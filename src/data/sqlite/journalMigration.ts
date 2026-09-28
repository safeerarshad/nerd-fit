import type { Migration } from './types.ts';

/** First-APK quick-add snapshots; no inferred food nutrients or scale readings. */
export const journalMigration: Migration = {
  version: 3,
  sql: `
    CREATE TABLE food_entries (
      id TEXT PRIMARY KEY NOT NULL CHECK(length(id) BETWEEN 1 AND 120),
      profile_id TEXT NOT NULL REFERENCES profiles(id),
      name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 120),
      quantity_label TEXT NOT NULL CHECK(length(trim(quantity_label)) BETWEEN 1 AND 100),
      kcal REAL NOT NULL CHECK(kcal BETWEEN 0 AND 20000),
      protein REAL NOT NULL CHECK(protein BETWEEN 0 AND 2000),
      carbs REAL NOT NULL CHECK(carbs BETWEEN 0 AND 2000),
      fat REAL NOT NULL CHECK(fat BETWEEN 0 AND 2000),
      occurred_at INTEGER NOT NULL CHECK(typeof(occurred_at) = 'integer' AND occurred_at BETWEEN 0 AND 253402300799999),
      time_zone TEXT NOT NULL CHECK(length(time_zone) BETWEEN 1 AND 100),
      local_date TEXT NOT NULL CHECK(local_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
      local_time TEXT NOT NULL CHECK(local_time GLOB '[0-9][0-9]:[0-9][0-9]:[0-9][0-9].[0-9][0-9][0-9]'),
      offset_minutes REAL NOT NULL CHECK(offset_minutes BETWEEN -1440 AND 1440),
      nutrition_warning TEXT,
      source TEXT NOT NULL DEFAULT 'user-quick-add' CHECK(source = 'user-quick-add'),
      CHECK(4 * protein + 4 * carbs + 9 * fat <= max(2 * kcal, kcal + 200))
    );
    CREATE INDEX food_entries_day ON food_entries(profile_id, local_date, occurred_at DESC, id DESC);
    CREATE TABLE weight_entries (
      id TEXT PRIMARY KEY NOT NULL CHECK(length(id) BETWEEN 1 AND 120),
      profile_id TEXT NOT NULL REFERENCES profiles(id),
      kg REAL NOT NULL CHECK(kg BETWEEN 20 AND 400),
      occurred_at INTEGER NOT NULL CHECK(typeof(occurred_at) = 'integer' AND occurred_at BETWEEN 0 AND 253402300799999),
      time_zone TEXT NOT NULL CHECK(length(time_zone) BETWEEN 1 AND 100),
      local_date TEXT NOT NULL CHECK(local_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
      local_time TEXT NOT NULL CHECK(local_time GLOB '[0-9][0-9]:[0-9][0-9]:[0-9][0-9].[0-9][0-9][0-9]'),
      offset_minutes REAL NOT NULL CHECK(offset_minutes BETWEEN -1440 AND 1440),
      influence TEXT NOT NULL CHECK(influence IN ('normal', 'reduced', 'ignored')),
      source TEXT NOT NULL DEFAULT 'manual' CHECK(source = 'manual')
    );
    CREATE INDEX weight_entries_time ON weight_entries(profile_id, occurred_at DESC, id DESC);
    CREATE TABLE nutrition_day_status (
      profile_id TEXT NOT NULL REFERENCES profiles(id),
      local_date TEXT NOT NULL CHECK(local_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
      status TEXT NOT NULL CHECK(status IN ('COMPLETE', 'ESTIMATED', 'PARTIAL', 'MISSING', 'FASTING')),
      estimated_kcal REAL CHECK(estimated_kcal BETWEEN 0 AND 20000),
      confirmed_at INTEGER CHECK(confirmed_at >= 0),
      PRIMARY KEY(profile_id, local_date),
      CHECK((status = 'ESTIMATED' AND estimated_kcal IS NOT NULL) OR (status <> 'ESTIMATED' AND estimated_kcal IS NULL)),
      CHECK((status IN ('COMPLETE', 'ESTIMATED', 'FASTING') AND confirmed_at IS NOT NULL) OR status IN ('PARTIAL', 'MISSING'))
    );
  `,
};
