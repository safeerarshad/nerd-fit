import type { SqlDatabase } from '../sqlite/types.ts';
import { buildInitialPlan } from '../../domain/planning.ts';
import type { ProfileInput, GoalInput, InitialPlan, DailyTarget } from '../../domain/planning.ts';

export type PlanContext = { now: number; timeZone: string };
export type StoredGoal = { id: string; input: GoalInput; plan: InitialPlan; effectiveFrom: string; createdAt: number };
export type StoredTarget = DailyTarget & { id: string; goalId: string; date: string };
export type StoredPlan = { profile: ProfileInput; goal: StoredGoal; plan: InitialPlan; targets: StoredTarget[]; nextReviewDate: string | null };

type GoalRow = { id: string; input_json: string; plan_json: string; effective_from: string; created_at: number };

function parseGoal(row: GoalRow): StoredGoal {
  return { id: row.id, input: JSON.parse(row.input_json) as GoalInput, plan: JSON.parse(row.plan_json) as InitialPlan, effectiveFrom: row.effective_from, createdAt: row.created_at };
}

function validateDate(date: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new RangeError('Invalid civil date');
  const instant = new Date(`${date}T12:00:00Z`);
  if (!Number.isFinite(instant.getTime()) || instant.toISOString().slice(0, 10) !== date) throw new RangeError('Invalid civil date');
}

function addDays(date: string, days: number): string {
  validateDate(date);
  const instant = new Date(`${date}T12:00:00Z`);
  instant.setUTCDate(instant.getUTCDate() + days);
  const result = instant.toISOString().slice(0, 10);
  validateDate(result);
  return result;
}

function contextDate(context: PlanContext): string {
  if (!Number.isSafeInteger(context.now) || context.now < 0 || !Number.isFinite(new Date(context.now).getTime())) throw new RangeError('Invalid save timestamp');
  if (typeof context.timeZone !== 'string' || !context.timeZone) throw new RangeError('A time zone is required');
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: context.timeZone, calendar: 'iso8601', numberingSystem: 'latn', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(context.now);
  const date = ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)!.value).join('-');
  validateDate(date);
  return date;
}

export async function getProfile(db: SqlDatabase): Promise<ProfileInput | null> {
  const row = await db.first<{ input_json: string }>('SELECT input_json FROM profiles WHERE id = ?', 'local');
  return row ? JSON.parse(row.input_json) as ProfileInput : null;
}

/** Latest accepted configuration; effectiveFrom can be tomorrow after an edit. */
export async function getActiveGoal(db: SqlDatabase): Promise<StoredGoal | null> {
  const row = await db.first<GoalRow>('SELECT id,input_json,plan_json,effective_from,created_at FROM goals WHERE profile_id = ? AND is_active = 1', 'local');
  return row ? parseGoal(row) : null;
}

/**
 * Continue the accepted weekday schedule until another goal becomes effective.
 * Materialization is one atomic INSERT..SELECT, so concurrent reads need neither
 * a nested transaction nor a UI-generated target. created_at remains the source
 * goal's acceptance instant, rather than introducing a second wall-clock input.
 */
export async function getTarget(db: SqlDatabase, date: string): Promise<StoredTarget | null> {
  validateDate(date);
  const weekday = (new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7;
  const path = `$.days[${weekday}]`;
  await db.run(`
    INSERT INTO daily_targets(id,goal_id,date,kcal,protein,carbs,fat,is_active,created_at)
    SELECT g.id || ':' || ?, g.id, ?,
      json_extract(g.plan_json, ?), json_extract(g.plan_json, ?),
      json_extract(g.plan_json, ?), json_extract(g.plan_json, ?), 1, g.created_at
    FROM goals AS g
    WHERE g.id = (
      SELECT id FROM goals WHERE profile_id = ? AND effective_from <= ?
      ORDER BY effective_from DESC, revision DESC LIMIT 1
    )
    AND g.plan_status = 'coached'
    AND NOT EXISTS (SELECT 1 FROM daily_targets WHERE date = ? AND is_active = 1)
    ON CONFLICT(goal_id, date) DO UPDATE SET is_active = 1
  `, date, date, `${path}.kcal`, `${path}.protein`, `${path}.carbs`, `${path}.fat`, 'local', date, date);
  return db.first<StoredTarget>('SELECT id,goal_id AS goalId,date,kcal,protein,carbs,fat FROM daily_targets WHERE date = ? AND is_active = 1', date);
}

async function readStoredPlan(db: SqlDatabase, profile: ProfileInput, goal: StoredGoal): Promise<StoredPlan> {
  const targets = await db.all<StoredTarget>('SELECT id,goal_id AS goalId,date,kcal,protein,carbs,fat FROM daily_targets WHERE goal_id = ? ORDER BY date', goal.id);
  const review = await db.first<{ due_date: string }>('SELECT due_date FROM weekly_reviews WHERE goal_id = ? AND status = ? ORDER BY due_date LIMIT 1', goal.id, 'scheduled');
  return { profile, goal, plan: goal.plan, targets, nextReviewDate: review?.due_date ?? null };
}

/** Caller supplies input only. The accepted targets are always recalculated here. */
async function saveInsideTransaction(db: SqlDatabase, profile: ProfileInput, input: GoalInput, context: PlanContext, effectiveFrom: string, previous: StoredGoal | null): Promise<StoredPlan> {
  const plan = buildInitialPlan(profile, input);
  const profileJson = JSON.stringify(profile);
  const inputJson = JSON.stringify(input);
  const planJson = JSON.stringify(plan);
  const row = await db.first<{ next: number }>('SELECT COALESCE(MAX(revision), 0) + 1 AS next FROM goals');
  const revision = row?.next ?? 1;
  const id = `goal-${revision}`;
  await db.run('INSERT INTO profiles(id,input_json,created_at,updated_at) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET input_json = excluded.input_json, updated_at = excluded.updated_at', 'local', profileJson, context.now, context.now);
  await db.run('INSERT INTO preferences(profile_id,units,time_zone,updated_at) VALUES (?,?,?,?) ON CONFLICT(profile_id) DO UPDATE SET units = excluded.units,time_zone = excluded.time_zone,updated_at = excluded.updated_at', 'local', profile.units, context.timeZone, context.now);
  await db.run('UPDATE goals SET is_active = 0 WHERE profile_id = ? AND is_active = 1', 'local');
  await db.run('INSERT INTO goals(id,profile_id,revision,mode,plan_status,input_json,plan_json,effective_from,is_active,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)', id, 'local', revision, input.mode, plan.status, inputJson, planJson, effectiveFrom, 1, context.now);
  // Snapshot all inputs and the algorithm output so old accepted plans remain explainable.
  await db.run('INSERT INTO goal_history(id,goal_id,previous_goal_id,action,snapshot_json,occurred_at) VALUES (?,?,?,?,?,?)', `history-${id}`, id, previous?.id ?? null, previous ? 'edited' : 'created', JSON.stringify({ algorithmVersion: 'startup-v1', profile, goal: input, plan, effectiveFrom, timeZone: context.timeZone }), context.now);
  // Change only the current projection; original future and past rows are retained.
  await db.run('UPDATE daily_targets SET is_active = 0 WHERE date >= ? AND is_active = 1', effectiveFrom);
  await db.run('UPDATE weekly_reviews SET status = ? WHERE due_date >= ? AND status = ?', 'superseded', effectiveFrom, 'scheduled');
  if (plan.status === 'coached') {
    for (let offset = 0; offset < 7; offset++) {
      const date = addDays(effectiveFrom, offset);
      const mondayBasedWeekday = (new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7;
      const target = plan.days[mondayBasedWeekday]!;
      await db.run('INSERT INTO daily_targets(id,goal_id,date,kcal,protein,carbs,fat,is_active,created_at) VALUES (?,?,?,?,?,?,?,?,?)', `${id}:${date}`, id, date, target.kcal, target.protein, target.carbs, target.fat, 1, context.now);
    }
    await db.run('INSERT INTO weekly_reviews(id,goal_id,due_date,status,snapshot_json,created_at) VALUES (?,?,?,?,?,?)', `review-${id}`, id, addDays(effectiveFrom, 7), 'scheduled', JSON.stringify({ algorithmVersion: 'startup-v1', plan }), context.now);
  }
  await db.run('INSERT INTO audit_events(kind,entity_id,occurred_at) VALUES (?,?,?)', previous ? 'goal_edited' : 'onboarding_completed', id, context.now);
  const savedProfile = await getProfile(db);
  const savedGoal = await getActiveGoal(db);
  if (!savedProfile || !savedGoal) throw new Error('Saved plan could not be read back');
  return readStoredPlan(db, savedProfile, savedGoal);
}

/** Repeated Done presses return the existing accepted plan, even with changed draft input. */
export async function completeOnboarding(db: SqlDatabase, profile: ProfileInput, goal: GoalInput, context: PlanContext): Promise<StoredPlan> {
  const today = contextDate(context);
  return db.transaction(async tx => {
    const existingProfile = await getProfile(tx);
    const existingGoal = await getActiveGoal(tx);
    if (existingProfile && existingGoal) return readStoredPlan(tx, existingProfile, existingGoal);
    if (existingProfile || existingGoal) throw new Error('Incomplete existing onboarding state');
    return saveInsideTransaction(tx, profile, goal, context, today, null);
  });
}

/** Accepted edits apply from tomorrow in the supplied zone; today's target is immutable. */
export async function savePlan(db: SqlDatabase, profile: ProfileInput, goal: GoalInput, context: PlanContext): Promise<StoredPlan> {
  const tomorrow = addDays(contextDate(context), 1);
  return db.transaction(async tx => {
    const previous = await getActiveGoal(tx);
    if (!previous || !await getProfile(tx)) throw new Error('Complete onboarding before editing the plan');
    return saveInsideTransaction(tx, profile, goal, context, tomorrow, previous);
  });
}
