import type { Hat } from "$lib";

export interface NotificationSchedule {
	enabled: boolean;
	time: string; // HH:MM format
}

export class PWAService {
	private registration: ServiceWorkerRegistration | null = null;
	private subscription: PushSubscription | null = null;

	async init(): Promise<void> {
		if (!this.isSupported()) {
			console.warn("PWA features not supported in this browser");
			return;
		}

		try {
			// Register service worker
			this.registration = await navigator.serviceWorker.register(
				"/caps/sw.js",
				{
					scope: "/",
				},
			);

			console.log("Service worker registered successfully");

			// Wait for service worker to be ready
			await navigator.serviceWorker.ready;
		} catch (error) {
			console.error("Service worker registration failed:", error);
		}
	}

	isSupported(): boolean {
		return (
			"serviceWorker" in navigator &&
			"PushManager" in window &&
			"Notification" in window
		);
	}

	async requestNotificationPermission(): Promise<NotificationPermission> {
		if (!("Notification" in window)) {
			throw new Error("Notifications not supported");
		}

		const permission = await Notification.requestPermission();
		return permission;
	}

	async enablePushNotifications(): Promise<boolean> {
		try {
			const permission = await this.requestNotificationPermission();

			if (permission !== "granted") {
				console.log("Notification permission denied");
				return false;
			}

			if (!this.registration) {
				await this.init();
			}

			// Subscribe to push notifications
			// Note: In production, you'd need a proper VAPID key and push service
			this.subscription = await this.registration!.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: this.urlBase64ToUint8Array(
					// This is a placeholder VAPID key - you'll need to generate your own
					"BEl62iUYgUivxIkv69yViEuiBIa40HI8TQjgtm5o4GzDFQq-3YHhOhcmhXBqFXGNhVNnBD3N9d3LZVChLHx4_w8",
				),
			});

			console.log("Push subscription successful");
			return true;
		} catch (error) {
			console.error("Failed to enable push notifications:", error);
			return false;
		}
	}

	async scheduleDailyNotification(
		hats: Hat[],
		time: string = "07:00",
	): Promise<void> {
		if (!this.isSupported() || !this.subscription) {
			console.warn("Push notifications not available");
			return;
		}

		// Store the schedule in localStorage for the service worker to access
		const schedule: NotificationSchedule = {
			enabled: true,
			time,
		};

		localStorage.setItem("notification-schedule", JSON.stringify(schedule));
		localStorage.setItem("hat-collection", JSON.stringify(hats));

		// Set up daily scheduling using setTimeout
		// Note: In a production app, you'd want to use a more robust scheduling system
		this.scheduleNextNotification(hats, time);
	}

	private scheduleNextNotification(hats: Hat[], time: string): void {
		const [hours, minutes] = time.split(":").map(Number);
		const now = new Date();
		const scheduledTime = new Date();

		scheduledTime.setHours(hours, minutes, 0, 0);

		// If the time has already passed today, schedule for tomorrow
		if (scheduledTime <= now) {
			scheduledTime.setDate(scheduledTime.getDate() + 1);
		}

		const timeUntilNotification = scheduledTime.getTime() - now.getTime();

		setTimeout(() => {
			this.sendDailyHatNotification(hats);
			// Schedule the next one for tomorrow
			this.scheduleNextNotification(hats, time);
		}, timeUntilNotification);

		console.log(
			`Next hat notification scheduled for ${scheduledTime.toLocaleString()}`,
		);
	}

	async sendDailyHatNotification(hats: Hat[]): Promise<void> {
		if (hats.length === 0) {
			return;
		}

		// Pick a random hat for the notification
		const randomHat = hats[Math.floor(Math.random() * hats.length)];

		const notificationData = {
			title: "Time to pick today's hat! 🧢",
			body: `How about wearing your ${randomHat.name}?`,
			icon: "/icon-192.png",
			image: randomHat.imageUrl || null,
			data: {
				hatId: randomHat.id,
				timestamp: Date.now(),
			},
		};

		// Send notification via service worker
		if (this.registration) {
			const notificationOptions: any = {
				body: notificationData.body,
				icon: notificationData.icon,
				badge: "/icon-192.png",
				data: notificationData.data,
				actions: [
					{
						action: "open",
						title: "Pick Hat",
					},
				],
				requireInteraction: true,
				tag: "daily-hat",
			};

			// Add image if available and supported
			if (notificationData.image) {
				notificationOptions.image = notificationData.image;
			}

			this.registration.showNotification(
				notificationData.title,
				notificationOptions,
			);
		}
	}

	async disableNotifications(): Promise<void> {
		const schedule: NotificationSchedule = {
			enabled: false,
			time: "07:00",
		};

		localStorage.setItem("notification-schedule", JSON.stringify(schedule));

		if (this.subscription) {
			await this.subscription.unsubscribe();
			this.subscription = null;
		}
	}

	getNotificationStatus(): {
		supported: boolean;
		permission: NotificationPermission;
		enabled: boolean;
		time: string;
	} {
		const schedule = this.getStoredSchedule();

		return {
			supported: this.isSupported(),
			permission: Notification.permission,
			enabled: schedule.enabled && Notification.permission === "granted",
			time: schedule.time,
		};
	}

	private getStoredSchedule(): NotificationSchedule {
		try {
			const stored = localStorage.getItem("notification-schedule");
			return stored ? JSON.parse(stored) : { enabled: false, time: "07:00" };
		} catch {
			return { enabled: false, time: "07:00" };
		}
	}

	private urlBase64ToUint8Array(base64String: string): Uint8Array {
		const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding)
			.replace(/-/g, "+")
			.replace(/_/g, "/");

		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);

		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}
		return outputArray;
	}
}

// Singleton instance
export const pwaService = new PWAService();
