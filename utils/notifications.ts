import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { NotificationRequest } from "expo-notifications";

const DAILY_NOTIFICATION_ID = "daily-hat";
const DAILY_NOTIFICATION_CHANNEL = "daily-hat";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
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
  const matching = scheduled.filter(
    (notification: NotificationRequest) =>
      notification.identifier === DAILY_NOTIFICATION_ID,
  );

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

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_NOTIFICATION_ID,
    content: {
      title: "Today's hat",
      body: hatName,
      sound: true,
      data: imageUrl ? { imageUrl } : {},
      ...(Platform.OS === "ios" && imageUrl
        ? { attachments: [{ uri: imageUrl }] }
        : {}),
      ...(Platform.OS === "android"
        ? { channelId: DAILY_NOTIFICATION_CHANNEL }
        : {}),
    },
    trigger: null,
  });
};
