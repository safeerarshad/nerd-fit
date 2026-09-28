import type { Migration } from './types.ts';

/** M3 only: immutable planning snapshots plus a current-target projection. */
export const onboardingMigration: Migration = {
  version: 2,
  sql: `
    CREATE TABLE profiles (
      id TEXT PRIMARY KEY NOT NULL CHECK (id = 'local'),
      input_json TEXT NOT NULL CHECK (json_valid(input_json)),
      created_at INTEGER NOT NULL CHECK (created_at >= 0),
      updated_at INTEGER NOT NULL CHECK (updated_at >= created_at)
    );
    CREATE TABLE preferences (
      profile_id TEXT PRIMARY KEY NOT NULL REFERENCES profiles(id),
      units TEXT NOT NULL CHECK (units IN ('metric', 'imperial')),
      time_zone TEXT NOT NULL CHECK (length(time_zone) > 0),
      updated_at INTEGER NOT NULL CHECK (updated_at >= 0)
    );
    CREATE TABLE goals (
      id TEXT PRIMARY KEY NOT NULL,
      profile_id TEXT NOT NULL REFERENCES profiles(id),
      revision INTEGER NOT NULL UNIQUE CHECK (revision > 0),
      mode TEXT NOT NULL CHECK (mode IN ('cut', 'maintain', 'bulk')),
      plan_status TEXT NOT NULL CHECK (plan_status IN ('coached', 'tracking-only')),
      input_json TEXT NOT NULL CHECK (json_valid(input_json)),
      plan_json TEXT NOT NULL CHECK (json_valid(plan_json)),
      effective_from TEXT NOT NULL CHECK (effective_from GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
      is_active INTEGER NOT NULL CHECK (is_active IN (0, 1)),
      created_at INTEGER NOT NULL CHECK (created_at >= 0)
    );
    CREATE UNIQUE INDEX goals_one_active ON goals(profile_id) WHERE is_active = 1;
    CREATE INDEX goals_effective_date ON goals(profile_id, effective_from, revision);
    CREATE TABLE goal_history (
      id TEXT PRIMARY KEY NOT NULL,
      goal_id TEXT NOT NULL UNIQUE REFERENCES goals(id),
      previous_goal_id TEXT REFERENCES goals(id),
      action TEXT NOT NULL CHECK (action IN ('created', 'edited')),
      snapshot_json TEXT NOT NULL CHECK (json_valid(snapshot_json)),
      occurred_at INTEGER NOT NULL CHECK (occurred_at >= 0)
    );
    CREATE TABLE daily_targets (
      id TEXT PRIMARY KEY NOT NULL,
      goal_id TEXT NOT NULL REFERENCES goals(id),
      date TEXT NOT NULL CHECK (date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
      kcal INTEGER NOT NULL CHECK (kcal > 0 AND typeof(kcal) = 'integer'),
      protein REAL NOT NULL CHECK (protein >= 0),
      carbs REAL NOT NULL CHECK (carbs >= 0),
      fat REAL NOT NULL CHECK (fat >= 0),
      is_active INTEGER NOT NULL CHECK (is_active IN (0, 1)),
      created_at INTEGER NOT NULL CHECK (created_at >= 0),
      UNIQUE (goal_id, date),
      CHECK (abs(4 * protein + 4 * carbs + 9 * fat - kcal) < 0.001)
    );
    CREATE UNIQUE INDEX daily_targets_one_current ON daily_targets(date) WHERE is_active = 1;
    CREATE INDEX daily_targets_goal_date ON daily_targets(goal_id, date);
    CREATE TABLE weekly_reviews (
      id TEXT PRIMARY KEY NOT NULL,
      goal_id TEXT NOT NULL REFERENCES goals(id),
      due_date TEXT NOT NULL CHECK (due_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
      status TEXT NOT NULL CHECK (status IN ('scheduled', 'superseded', 'completed', 'dismissed')),
      snapshot_json TEXT NOT NULL CHECK (json_valid(snapshot_json)),
      created_at INTEGER NOT NULL CHECK (created_at >= 0),
      UNIQUE (goal_id, due_date)
    );
    CREATE INDEX weekly_reviews_schedule ON weekly_reviews(status, due_date);
  `,
};
