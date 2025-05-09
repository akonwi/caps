<script lang="ts">
	import type { Hat } from '$lib';
	import HatInventory from '$lib/components/hat-inventory.svelte';
	import HatModal from '$lib/components/hat-modal.svelte';
	import HatSelector from '$lib/components/hat-selector.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Plus } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { loadState, saveState, checkStorageAvailability } from '$lib/storage';

	let hats: Hat[] = $state([]);
	let selectedHat: Hat | null = $state(null);
	let previousHatId: string | null = null;
	let lastSelectedIds: string[] = [];
	let showAddEditModal = $state(false);
	let editingHat: Hat | null = $state(null);
	let storageStatus = $state({ available: false, method: '?' });

	// Save state whenever hats or previousHatId change
	$effect(() => {
		// Only save if there's data to save and we're not in initial loading
		if (storageStatus.available) {
			saveState({ hats, lastSelectedIds })
				.then(() => {
					console.log(`Successfully saved ${hats.length} hats using ${storageStatus.method}`);
				})
				.catch((err) => {
					console.error('Failed to save state:', err);
					// Alert user in production
					if (import.meta.env.PROD) {
						alert(
							'Warning: Your browser may not be properly saving your hat collection. Try using a different browser or disable private browsing mode.'
						);
					}
				});
		}
	});

	onMount(async () => {
		// Check storage availability and set status
		const availability = checkStorageAvailability();
		storageStatus.available = availability.localStorage || availability.indexedDB;
		storageStatus.method = availability.localStorage
			? 'localStorage'
			: availability.indexedDB
				? 'IndexedDB'
				: 'none';

		console.log('Storage status:', storageStatus);

		// If no storage is available, warn the user
		if (!storageStatus.available) {
			console.warn('No storage methods available - data will not persist');
			if (import.meta.env.PROD) {
				alert(
					'Your browser settings may prevent saving your hat collection. Consider disabling private browsing or using a different browser.'
				);
			}
			return;
		}

		// Load state with fallbacks
		try {
			const state = await loadState();
			if (state) {
				hats = state.hats || [];
				previousHatId = state.previousHatId || null;
				lastSelectedIds = state.lastSelectedIds || [];
				console.log(`Loaded ${hats.length} hats from storage`);
			}
		} catch (e) {
			console.error('Error loading stored data:', e);
		}
	});

	function openAddModal() {
		editingHat = null;
		showAddEditModal = true;
	}

	function openEditModal(hat: Hat) {
		editingHat = hat;
		showAddEditModal = true;
	}

	function closeModal() {
		showAddEditModal = false;
		editingHat = null;
	}

	function addHat(hat: Hat) {
		hats = [...hats, hat];
		closeModal();
	}

	function updateHat(updatedHat: Hat) {
		hats = hats.map((hat) => (hat.id === updatedHat.id ? updatedHat : hat));
		closeModal();
	}

	function deleteHat(id: string) {
		hats = hats.filter((hat) => hat.id !== id);

		// If we deleted the previously selected hat, reset previousHatId
		if (previousHatId === id) {
			previousHatId = null;
		}
	}

	function selectRandomHat() {
		if (hats.length === 0) {
			selectedHat = null;
			return;
		}

		if (hats.length === 1) {
			selectedHat = hats[0];
			previousHatId = selectedHat.id;
			return;
		}

		// Filter out the latest selected hats to avoid consecutive selections
		const availableHats = hats.filter((hat) => lastSelectedIds.includes(hat.id));

		// Select a random hat from available hats
		const randomIndex = Math.floor(Math.random() * availableHats.length);
		selectedHat = availableHats[randomIndex];

		// if there are already 7 in the last selections, remove the earliest
		if (lastSelectedIds.length === 7) lastSelectedIds.shift();
		// push this one to the end
		lastSelectedIds.push(selectedHat.id);
	}
</script>

<main class="container mx-auto max-w-4xl px-4 py-8">
	<h1 class="mb-6 text-center text-3xl font-bold">Caps</h1>

	{#if import.meta.env.DEV}
		<div class="mb-4 text-center text-sm text-gray-500">
			<div class="inline-flex items-center rounded-full bg-gray-100 px-3 py-1">
				<span
					class="mr-1 inline-block h-2 w-2 rounded-full {storageStatus.available
						? 'bg-green-500'
						: 'bg-red-500'}"
				></span>
				Storage: {storageStatus.method}
			</div>
		</div>
	{/if}

	<div class="grid gap-8 md:grid-cols-2">
		<div>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold">Collection</h2>
				<Button onclick={openAddModal} variant="ghost"><Plus /></Button>
			</div>

			<HatInventory {hats} onEdit={openEditModal} onDelete={deleteHat} />
		</div>

		<div>
			<HatSelector {selectedHat} onSelect={selectRandomHat} hatsCount={hats.length} />
		</div>
	</div>

	{#if showAddEditModal}
		<HatModal hat={editingHat} onClose={closeModal} onSave={editingHat ? updateHat : addHat} />
	{/if}
</main>
