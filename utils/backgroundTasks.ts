import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { ensureTodaySelectionInDatabase } from "@/utils/dailyHat";
import {
  clearDailyNotifications,
  sendDailyHatNotification,
} from "@/utils/notifications";

const DAILY_HAT_TASK = "daily-hat-selection";

TaskManager.defineTask(DAILY_HAT_TASK, async () => {
  try {
    const hat = await ensureTodaySelectionInDatabase();
    if (!hat) {
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    await clearDailyNotifications();
    await sendDailyHatNotification(hat.name, hat.imageUrl);

    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.error("Daily hat background task failed:", error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export const registerDailyHatTask = async () => {
  const status = await BackgroundTask.getStatusAsync();
  if (status === BackgroundTask.BackgroundTaskStatus.Restricted) {
    return;
  }

  const alreadyRegistered = await TaskManager.isTaskRegisteredAsync(
    DAILY_HAT_TASK,
  );

  if (alreadyRegistered) {
    return;
  }

  await BackgroundTask.registerTaskAsync(DAILY_HAT_TASK, {
    minimumInterval: 60,
  });
};
