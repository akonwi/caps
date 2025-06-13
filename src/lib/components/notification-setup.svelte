<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { pwaService } from '$lib/pwa';
	import { Bell, BellOff } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import type { Hat } from '$lib';

	interface Props {
		hats: Hat[];
	}

	let { hats }: Props = $props();

	let notificationStatus = $state({
		supported: false,
		permission: 'default' as NotificationPermission,
		enabled: false,
		time: '07:00'
	});

	let isLoading = $state(false);

	onMount(async () => {
		await pwaService.init();
		updateStatus();
	});

	function updateStatus() {
		notificationStatus = pwaService.getNotificationStatus();
	}

	async function enableNotifications() {
		isLoading = true;
		try {
			const success = await pwaService.enablePushNotifications();
			if (success) {
				await pwaService.scheduleDailyNotification(hats, '07:00');
				updateStatus();
			}
		} catch (error) {
			console.error('Failed to enable notifications:', error);
		} finally {
			isLoading = false;
		}
	}

	async function disableNotifications() {
		isLoading = true;
		try {
			await pwaService.disableNotifications();
			updateStatus();
		} catch (error) {
			console.error('Failed to disable notifications:', error);
		} finally {
			isLoading = false;
		}
	}

	// Update notifications when hats change
	$effect(() => {
		if (notificationStatus.enabled && hats.length > 0) {
			pwaService.scheduleDailyNotification(hats, notificationStatus.time);
		}
	});
</script>

{#if notificationStatus.supported}
	<div class="rounded-lg border p-4">
		<div class="flex items-center justify-between">
			<div>
				<h3 class="text-sm font-medium">Daily Hat Notifications</h3>
				<p class="text-xs text-gray-500">
					{#if notificationStatus.enabled}
						Get reminded at 7:00 AM to pick today's hat
					{:else}
						Enable daily reminders to pick your hat
					{/if}
				</p>
			</div>
			
			{#if notificationStatus.permission === 'denied'}
				<div class="text-xs text-red-600">
					Notifications blocked. Enable in browser settings.
				</div>
			{:else if notificationStatus.enabled}
				<Button 
					onclick={disableNotifications} 
					variant="ghost" 
					size="sm"
					disabled={isLoading}
				>
					<BellOff class="h-4 w-4" />
				</Button>
			{:else}
				<Button 
					onclick={enableNotifications} 
					variant="ghost" 
					size="sm"
					disabled={isLoading || hats.length === 0}
				>
					<Bell class="h-4 w-4" />
				</Button>
			{/if}
		</div>
		
		{#if hats.length === 0 && !notificationStatus.enabled}
			<p class="mt-2 text-xs text-amber-600">
				Add some hats to your collection first!
			</p>
		{/if}
	</div>
{/if}
