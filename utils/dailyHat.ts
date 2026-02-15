import * as SQLite from "expo-sqlite";
import type { DailySelectionState, Hat } from "@/types";
import { initializeDatabase } from "@/utils/db";
import { getLocalDateString } from "@/utils/date";
import { pickRandomHat } from "@/utils/selection";

const getStateValue = async <T,>(
  db: SQLite.SQLiteDatabase,
  key: string,
) => {
  const stateResult = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM state WHERE key = ?",
    [key],
  );

  if (!stateResult?.value) return null;
  return JSON.parse(stateResult.value) as T;
};

const setStateValue = async (
  db: SQLite.SQLiteDatabase,
  key: string,
  value: unknown,
) => {
  await db.runAsync(
    "INSERT OR REPLACE INTO state (key, value) VALUES (?, ?)",
    [key, JSON.stringify(value)],
  );
};

export const ensureTodaySelectionInDatabase = async () => {
  const db = await SQLite.openDatabaseAsync("caps.db");
  await initializeDatabase(db);

  const hats = await db.getAllAsync<Hat>(
    "SELECT id, name, imageUrl FROM hats ORDER BY ROWID DESC",
  );

  if (!hats.length) {
    return null;
  }

  const today = getLocalDateString();
  const dailySelection = await getStateValue<DailySelectionState>(
    db,
    "dailySelection",
  );

  if (dailySelection?.date === today) {
    const existingHat = hats.find((hat) => hat.id === dailySelection.hatId);
    if (existingHat) return existingHat;
  }

  const lastSelectedIds =
    (await getStateValue<string[]>(db, "lastSelectedIds")) || [];
  const { hat, nextLastSelectedIds } = pickRandomHat(hats, lastSelectedIds);

  if (!hat) {
    return null;
  }

  await setStateValue(db, "lastSelectedIds", nextLastSelectedIds);
  await setStateValue(db, "dailySelection", {
    date: today,
    hatId: hat.id,
  });

  return hat;
};
