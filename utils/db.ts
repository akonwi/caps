import * as SQLite from 'expo-sqlite';

export async function initializeDatabase(db: SQLite.SQLiteDatabase) {
  // Create tables if they don't exist
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS hats (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      imageUrl TEXT
    );

    CREATE TABLE IF NOT EXISTS state (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}
