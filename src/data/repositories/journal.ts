import type { SqlDatabase } from '../sqlite/types.ts';

export type FoodInput = {
  id: string; name: string; quantityLabel: string; kcal: number; protein: number; carbs: number; fat: number;
  occurredAt: number; timeZone: string;
};
export type FoodRow = FoodInput & { localDate: string; localTime: string; offsetMinutes: number; nutritionWarning: string | null };
export type WeightInput = { id: string; kg: number; occurredAt: number; timeZone: string; influence: 'normal' | 'reduced' | 'ignored' };
export type WeightRow = WeightInput & { localDate: string; localTime: string; offsetMinutes: number };
export type DayStatus = 'COMPLETE' | 'ESTIMATED' | 'PARTIAL' | 'MISSING' | 'FASTING';
export type DayStatusRow = { localDate: string; status: DayStatus; estimatedKcal: number | null; confirmedAt: number | null };
export type DayTotals = { kcal: number; protein: number; carbs: number; fat: number; count: number };
export type SettingKey = 'units' | 'glass';

const foodColumns = 'id,name,quantity_label AS quantityLabel,kcal,protein,carbs,fat,occurred_at AS occurredAt,time_zone AS timeZone,local_date AS localDate,local_time AS localTime,offset_minutes AS offsetMinutes,nutrition_warning AS nutritionWarning';
const weightColumns = 'id,kg,influence,occurred_at AS occurredAt,time_zone AS timeZone,local_date AS localDate,local_time AS localTime,offset_minutes AS offsetMinutes';

function numberInRange(value: number, name: string, minimum: number, maximum: number): void {
  if (!Number.isFinite(value) || value < minimum || value > maximum) throw new RangeError(`${name} must be between ${minimum} and ${maximum}.`);
}

function label(value: string, name: string, maximum: number): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maximum) throw new RangeError(`${name} must contain 1–${maximum} characters.`);
  return value.trim();
}

function validateDate(date: string): void {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new RangeError('Invalid civil date.');
  const instant = new Date(`${date}T12:00:00Z`);
  if (!Number.isFinite(instant.getTime()) || instant.toISOString().slice(0, 10) !== date) throw new RangeError('Invalid civil date.');
}

function validateInstant(instant: number): void {
  if (!Number.isSafeInteger(instant) || instant < 0 || instant > 253402300799999) throw new RangeError('Invalid timestamp.');
}

function localTimestamp(occurredAt: number, timeZone: string) {
  validateInstant(occurredAt);
  if (typeof timeZone !== 'string' || timeZone.length > 100 || !(timeZone === 'UTC' || timeZone.includes('/')) || /^[+-]/.test(timeZone)) {
    throw new RangeError('An IANA time zone is required.');
  }
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone, calendar: 'iso8601', numberingSystem: 'latn', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  const parts = formatter.formatToParts(occurredAt);
  const part = (name: string) => parts.find(value => value.type === name)!.value;
  const localDate = `${part('year')}-${part('month')}-${part('day')}`;
  validateDate(localDate);
  const localTime = `${part('hour')}:${part('minute')}:${part('second')}.${String(occurredAt % 1000).padStart(3, '0')}`;
  const offsetMinutes = (Date.parse(`${localDate}T${localTime}Z`) - occurredAt) / 60000;
  numberInRange(offsetMinutes, 'Time-zone offset', -1440, 1440);
  return { localDate, localTime, offsetMinutes };
}

function paging(limit = 100, offset = 0): { limit: number; offset: number } {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1000 || !Number.isSafeInteger(offset) || offset < 0) {
    throw new RangeError('Page limit must be 1–1000 and offset a nonnegative integer.');
  }
  return { limit, offset };
}

async function audit(db: SqlDatabase, kind: string, id: string): Promise<void> {
  await db.run('INSERT INTO audit_events(kind,entity_id,occurred_at) VALUES (?,?,?)', kind, id, Date.now());
}

async function writeDayStatus(db: SqlDatabase, date: string, status: DayStatus, estimatedKcal: number | null, confirmedAt: number | null): Promise<void> {
  await db.run('INSERT INTO nutrition_day_status(profile_id,local_date,status,estimated_kcal,confirmed_at) VALUES (?,?,?,?,?) ON CONFLICT(profile_id,local_date) DO UPDATE SET status=excluded.status,estimated_kcal=excluded.estimated_kcal,confirmed_at=excluded.confirmed_at', 'local', date, status, estimatedKcal, confirmedAt);
}

function normalizeFood(input: FoodInput): FoodRow {
  const id = label(input.id, 'Food id', 120);
  const name = label(input.name, 'Food name', 120);
  const quantityLabel = label(input.quantityLabel, 'Quantity', 100);
  numberInRange(input.kcal, 'Calories', 0, 20000);
  for (const key of ['protein', 'carbs', 'fat'] as const) numberInRange(input[key], key, 0, 2000);
  const macroEnergy = input.protein * 4 + input.carbs * 4 + input.fat * 9;
  // Conservative data-entry check, not a regional food-label compliance rule.
  if (macroEnergy > Math.max(2 * input.kcal, input.kcal + 200)) throw new RangeError('Macros greatly exceed entered calories. Review the quantities and units.');
  const nutritionWarning = macroEnergy === 0 && input.kcal > 0
    ? 'Macro amounts were not supplied; only calories are known.'
    : Math.abs(macroEnergy - input.kcal) > Math.max(20, input.kcal * 0.2)
      ? 'Calories differ from the macro estimate. Review units; fiber, alcohol and label rounding can cause differences.'
      : null;
  return { id, name, quantityLabel, kcal: input.kcal, protein: input.protein, carbs: input.carbs, fat: input.fat,
    occurredAt: input.occurredAt, timeZone: input.timeZone, ...localTimestamp(input.occurredAt, input.timeZone), nutritionWarning };
}

/** The token identifies an immutable submitted snapshot, not a mutable food template. */
export async function logFood(db: SqlDatabase, input: FoodInput): Promise<string> {
  const food = normalizeFood(input);
  return db.transaction(async tx => {
    const existing = await tx.first<FoodRow>(`SELECT ${foodColumns} FROM food_entries WHERE profile_id=? AND id=?`, 'local', food.id);
    if (existing) {
      const keys: (keyof FoodInput)[] = ['id', 'name', 'quantityLabel', 'kcal', 'protein', 'carbs', 'fat', 'occurredAt', 'timeZone'];
      if (keys.some(key => existing[key] !== food[key])) throw new Error('Idempotency token already belongs to a different food snapshot.');
      return existing.id;
    }
    await tx.run('INSERT INTO food_entries(id,profile_id,name,quantity_label,kcal,protein,carbs,fat,occurred_at,time_zone,local_date,local_time,offset_minutes,nutrition_warning) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      food.id, 'local', food.name, food.quantityLabel, food.kcal, food.protein, food.carbs, food.fat, food.occurredAt, food.timeZone, food.localDate, food.localTime, food.offsetMinutes, food.nutritionWarning);
    await writeDayStatus(tx, food.localDate, 'PARTIAL', null, null);
    await audit(tx, 'food_logged', food.id);
    return food.id;
  });
}

export async function listFood(db: SqlDatabase, localDate: string, options: { limit?: number; offset?: number } = {}): Promise<FoodRow[]> {
  validateDate(localDate);
  const { limit, offset } = paging(options.limit, options.offset);
  return db.all<FoodRow>(`SELECT ${foodColumns} FROM food_entries WHERE profile_id=? AND local_date=? ORDER BY occurred_at DESC,id DESC LIMIT ? OFFSET ?`, 'local', localDate, limit, offset);
}

/** Sum actual snapshots only; an estimate or future entry never becomes consumption. */
export async function dayTotals(db: SqlDatabase, date: string, now: number): Promise<DayTotals> {
  validateDate(date); validateInstant(now);
  const totals = (await db.first<DayTotals>('SELECT COALESCE(SUM(kcal),0) AS kcal,COALESCE(SUM(protein),0) AS protein,COALESCE(SUM(carbs),0) AS carbs,COALESCE(SUM(fat),0) AS fat,COUNT(*) AS count FROM food_entries WHERE profile_id=? AND local_date=? AND occurred_at<=?', 'local', date, now))!;
  return { ...totals };
}

export async function undoFood(db: SqlDatabase, id: string): Promise<void> {
  const token = label(id, 'Food id', 120);
  await db.transaction(async tx => {
    const existing = await tx.first<{ local_date: string }>('SELECT local_date FROM food_entries WHERE profile_id=? AND id=?', 'local', token);
    if (!existing) return;
    await tx.run('DELETE FROM food_entries WHERE profile_id=? AND id=?', 'local', token);
    const remaining = await tx.first<{ count: number }>('SELECT count(*) AS count FROM food_entries WHERE profile_id=? AND local_date=?', 'local', existing.local_date);
    await writeDayStatus(tx, existing.local_date, remaining!.count > 0 ? 'PARTIAL' : 'MISSING', null, null);
    await audit(tx, 'food_undone', token);
  });
}

export async function logWeight(db: SqlDatabase, input: WeightInput, now = Date.now()): Promise<string> {
  validateInstant(now);
  validateInstant(input.occurredAt);
  if (input.occurredAt > now) throw new RangeError('Actual weigh-ins cannot be in the future.');
  const id = label(input.id, 'Weight id', 120);
  numberInRange(input.kg, 'Weight in kg', 20, 400);
  if (!['normal', 'reduced', 'ignored'].includes(input.influence)) throw new RangeError('Invalid weight influence.');
  const weight = { id, kg: input.kg, occurredAt: input.occurredAt, timeZone: input.timeZone, influence: input.influence, ...localTimestamp(input.occurredAt, input.timeZone) };
  return db.transaction(async tx => {
    const existing = await tx.first<WeightRow>(`SELECT ${weightColumns} FROM weight_entries WHERE profile_id=? AND id=?`, 'local', id);
    if (existing) {
      const keys: (keyof WeightInput)[] = ['id', 'kg', 'occurredAt', 'timeZone', 'influence'];
      if (keys.some(key => existing[key] !== weight[key])) throw new Error('Idempotency token already belongs to a different weight snapshot.');
      return id;
    }
    await tx.run('INSERT INTO weight_entries(id,profile_id,kg,influence,occurred_at,time_zone,local_date,local_time,offset_minutes) VALUES (?,?,?,?,?,?,?,?,?)',
      id, 'local', weight.kg, weight.influence, weight.occurredAt, weight.timeZone, weight.localDate, weight.localTime, weight.offsetMinutes);
    await audit(tx, 'weight_logged', id);
    return id;
  });
}

export async function listWeights(db: SqlDatabase, options: { limit?: number } = {}): Promise<WeightRow[]> {
  const { limit } = paging(options.limit);
  return db.all<WeightRow>(`SELECT ${weightColumns} FROM weight_entries WHERE profile_id=? ORDER BY occurred_at DESC,id DESC LIMIT ?`, 'local', limit);
}

export async function latestWeight(db: SqlDatabase, now = Date.now()): Promise<WeightRow | null> {
  validateInstant(now);
  return db.first<WeightRow>(`SELECT ${weightColumns} FROM weight_entries WHERE profile_id=? AND occurred_at<=? ORDER BY occurred_at DESC,id DESC LIMIT 1`, 'local', now);
}

/** Call only after the user explicitly requests undo/deletion of this reading. */
export async function undoWeight(db: SqlDatabase, id: string): Promise<void> {
  const token = label(id, 'Weight id', 120);
  await db.transaction(async tx => {
    const deleted = await tx.run('DELETE FROM weight_entries WHERE profile_id=? AND id=?', 'local', token);
    if (deleted.changes > 0) await audit(tx, 'weight_undone', token);
  });
}

export async function setDayStatus(db: SqlDatabase, date: string, status: DayStatus, estimatedKcal?: number): Promise<void> {
  validateDate(date);
  if (!['COMPLETE', 'ESTIMATED', 'PARTIAL', 'MISSING', 'FASTING'].includes(status)) throw new RangeError('Unknown nutrition day status.');
  if (status === 'ESTIMATED') {
    if (estimatedKcal === undefined) throw new RangeError('An estimated day requires an explicit calorie estimate.');
    numberInRange(estimatedKcal, 'Estimated calories', 0, 20000);
  } else if (estimatedKcal !== undefined) throw new RangeError('Only estimated days accept an estimated calorie value.');
  await db.transaction(async tx => {
    const foods = await tx.first<{ count: number }>('SELECT count(*) AS count FROM food_entries WHERE profile_id=? AND local_date=?', 'local', date);
    if (status === 'FASTING' && foods!.count > 0) throw new RangeError('A fasting day cannot contain food entries. Review or remove the entries first.');
    if (status === 'COMPLETE' && foods!.count === 0) throw new RangeError('A complete day requires food; use an explicit fasting confirmation for known zero intake.');
    const confirmedAt = ['COMPLETE', 'ESTIMATED', 'FASTING'].includes(status) ? Date.now() : null;
    await writeDayStatus(tx, date, status, estimatedKcal ?? null, confirmedAt);
    await audit(tx, 'nutrition_status_changed', date);
  });
}

export async function getDayStatus(db: SqlDatabase, date: string): Promise<DayStatusRow> {
  validateDate(date);
  return await db.first<DayStatusRow>('SELECT local_date AS localDate,status,estimated_kcal AS estimatedKcal,confirmed_at AS confirmedAt FROM nutrition_day_status WHERE profile_id=? AND local_date=?', 'local', date)
    ?? { localDate: date, status: 'MISSING', estimatedKcal: null, confirmedAt: null };
}

function validateSettingKey(key: SettingKey): void {
  if (!['units', 'glass'].includes(key)) throw new RangeError('Unsupported setting key.');
}

export async function getSetting(db: SqlDatabase, key: SettingKey): Promise<string | null> {
  validateSettingKey(key);
  if (key === 'units') {
    const preference = await db.first<{ units: string }>('SELECT units FROM preferences WHERE profile_id=?', 'local');
    if (preference) return preference.units;
  }
  return (await db.first<{ value: string }>('SELECT value FROM settings WHERE key=?', key))?.value ?? null;
}

export async function setSetting(db: SqlDatabase, key: SettingKey, value: string): Promise<void> {
  validateSettingKey(key);
  const allowed = key === 'units' ? ['metric', 'imperial'] : ['clear', 'balanced', 'tinted'];
  if (!allowed.includes(value)) throw new RangeError(`Invalid ${key} setting.`);
  await db.transaction(async tx => {
    await tx.run('INSERT INTO settings(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', key, value);
    if (key === 'units') {
      const now = Date.now();
      await tx.run('UPDATE preferences SET units=?,updated_at=max(updated_at,?) WHERE profile_id=?', value, now, 'local');
      await tx.run("UPDATE profiles SET input_json=json_set(input_json,'$.units',?),updated_at=max(updated_at,?) WHERE id=?", value, now, 'local');
    }
    await audit(tx, 'setting_changed', key);
  });
}
