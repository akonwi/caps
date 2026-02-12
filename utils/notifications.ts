import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { NotificationRequest } from "expo-notifications";
import { getNextTriggerDate } from "@/utils/date";

const DAILY_NOTIFICATION_ID = "daily-hat";
const DAILY_NOTIFICATION_CHANNEL = "daily-hat";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ensureAndroidChannel = async () => {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(DAILY_NOTIFICATION_CHANNEL, {
    name: "Daily Hat",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
};

export const requestNotificationPermissions = async () => {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.status === Notifications.PermissionStatus.GRANTED) {
    return true;
  }

  const request = await Notifications.requestPermissionsAsync();
  return request.status === Notifications.PermissionStatus.GRANTED;
};

const hasNotificationPermissions = async () => {
  const settings = await Notifications.getPermissionsAsync();
  return settings.status === Notifications.PermissionStatus.GRANTED;
};

export const clearDailyNotifications = async () => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const matching = scheduled.filter((notification: NotificationRequest) => {
    const data = notification.content.data as { kind?: string } | undefined;
    return data?.kind === DAILY_NOTIFICATION_ID;
  });

  await Promise.all(
    matching.map((notification: NotificationRequest) =>
      Notifications.cancelScheduledNotificationAsync(notification.identifier),
    ),
  );
};

export const sendDailyHatNotification = async (
  hatName: string,
  imageUrl?: string | null,
) => {
  await ensureAndroidChannel();
  const allowed = await hasNotificationPermissions();
  if (!allowed) return;

  const content: Notifications.NotificationContentInput = {
    title: "Today's hat",
    body: hatName,
    sound: true,
    data: imageUrl
      ? { kind: DAILY_NOTIFICATION_ID, imageUrl }
      : { kind: DAILY_NOTIFICATION_ID },
    ...(Platform.OS === "android"
      ? { channelId: DAILY_NOTIFICATION_CHANNEL }
      : {}),
  };

  if (Platform.OS === "ios" && imageUrl) {
    (content as Notifications.NotificationContentInput & {
      attachments?: Array<{ identifier: string; url: string; type: string }>;
    }).attachments = [
      { identifier: "hat-image", url: imageUrl, type: "public.image" },
    ];
  }

  await Notifications.scheduleNotificationAsync({
    content,
    trigger: null,
  });
};

export const scheduleNextMorningHatNotification = async (
  hatName: string,
  imageUrl?: string | null,
  hour = 8,
  minute = 0,
) => {
  await ensureAndroidChannel();
  const allowed = await hasNotificationPermissions();
  if (!allowed) return;

  await clearDailyNotifications();

  const content: Notifications.NotificationContentInput = {
      title: "Today's hat",
      body: hatName,
      sound: true,
      data: imageUrl
        ? { kind: DAILY_NOTIFICATION_ID, imageUrl }
        : { kind: DAILY_NOTIFICATION_ID },
      ...(Platform.OS === "android"
        ? { channelId: DAILY_NOTIFICATION_CHANNEL }
        : {}),
  };

  if (Platform.OS === "ios" && imageUrl) {
    (content as Notifications.NotificationContentInput & {
      attachments?: Array<{ identifier: string; url: string; type: string }>;
    }).attachments = [
      { identifier: "hat-image", url: imageUrl, type: "public.image" },
    ];
  }

  await Notifications.scheduleNotificationAsync({
    content,
    trigger: getNextTriggerDate(hour, minute) as unknown as Notifications.NotificationTriggerInput,
  });
};
