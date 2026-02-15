import { registerDailyHatTask } from "@/utils/backgroundTasks";
import { requestNotificationPermissions } from "@/utils/notifications";

let backgroundBootstrapPromise: Promise<void> | null = null;

export const bootstrapBackgroundServices = () => {
  if (backgroundBootstrapPromise) {
    return backgroundBootstrapPromise;
  }

  backgroundBootstrapPromise = (async () => {
    try {
      await requestNotificationPermissions();
      await registerDailyHatTask();
    } catch (error) {
      console.error("Error setting up background tasks:", error);
    }
  })();

  return backgroundBootstrapPromise;
};
