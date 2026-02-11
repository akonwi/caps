import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as SQLite from "expo-sqlite";
import type { DailySelectionState, Hat } from "@/types";
import { initializeDatabase } from "@/utils/db";
import { getLocalDateString } from "@/utils/date";
import { pickRandomHat } from "@/utils/selection";
import {
  clearDailyNotifications,
  sendDailyHatNotification,
} from "@/utils/notifications";

const DAILY_HAT_TASK = "daily-hat-selection";

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

TaskManager.defineTask(DAILY_HAT_TASK, async () => {
  try {
    const db = await SQLite.openDatabaseAsync("caps.db");
    await initializeDatabase(db);

    const hats = await db.getAllAsync<Hat>(
      "SELECT id, name, imageUrl FROM hats ORDER BY ROWID DESC",
    );
    if (!hats || hats.length === 0) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const today = getLocalDateString();
    const dailySelection = await getStateValue<DailySelectionState>(
      db,
      "dailySelection",
    );

    if (dailySelection?.date === today) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const lastSelectedIds =
      (await getStateValue<string[]>(db, "lastSelectedIds")) || [];
    const { hat, nextLastSelectedIds } = pickRandomHat(
      hats,
      lastSelectedIds,
    );

    if (!hat) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    await setStateValue(db, "lastSelectedIds", nextLastSelectedIds);
    await setStateValue(db, "dailySelection", {
      date: today,
      hatId: hat.id,
    });

    await clearDailyNotifications();
    await sendDailyHatNotification(hat.name, hat.imageUrl);

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("Daily hat background task failed:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerDailyHatTask = async () => {
  const status = await BackgroundFetch.getStatusAsync();
  if (
    status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
    status === BackgroundFetch.BackgroundFetchStatus.Denied
  ) {
    return;
  }

  const alreadyRegistered = await TaskManager.isTaskRegisteredAsync(
    DAILY_HAT_TASK,
  );

  if (alreadyRegistered) {
    return;
  }

  await BackgroundFetch.registerTaskAsync(DAILY_HAT_TASK, {
    minimumInterval: 60 * 60,
    stopOnTerminate: false,
    startOnBoot: true,
  });
};
