<script lang="ts">
	import type { Hat } from '$lib';
	import HatInventory from '$lib/components/hat-inventory.svelte';
	import HatModal from '$lib/components/hat-modal.svelte';
	import HatSelector from '$lib/components/hat-selector.svelte';
	import NotificationSetup from '$lib/components/notification-setup.svelte';
	import { Button } from '$lib/components/ui/button';
	import { DropdownMenu } from 'bits-ui';
	import { Plus } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { loadState, saveState, checkStorageAvailability } from '$lib/storage';

	let hats: Hat[] = $state([]);
	let selectedHat: Hat | null = $state(null);
	let lastSelectedIds: string[] = $state([]);
	let showAddEditModal = $state(false);
	let editingHat: Hat | null = $state(null);
	let storageStatus = $state({ available: false, method: '?' });

	// Save state whenever hats or lastSelectedIds change
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
				lastSelectedIds = state.lastSelectedIds || [];
				if (lastSelectedIds?.length! > 0) {
					const mostRecentId = lastSelectedIds![lastSelectedIds.length - 1];
					selectedHat = hats.find((h) => h.id === mostRecentId) ?? null;
				}
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
	}

	function selectRandomHat() {
		if (hats.length === 0) {
			selectedHat = null;
			return;
		}

		if (hats.length === 1) {
			selectedHat = hats[0];
			return;
		}

		// Filter out the latest selected hats to avoid consecutive selections
		const availableHats = hats.filter((hat) => !lastSelectedIds.includes(hat.id));

		// Select a random hat from available hats
		const randomIndex = Math.floor(Math.random() * availableHats.length);
		selectedHat = availableHats[randomIndex];

		// if there are already 7 in the last selections, remove the earliest
		if (lastSelectedIds.length === 7) lastSelectedIds.shift();
		// push this one to the end
		lastSelectedIds.push(selectedHat.id);
	}

	function exportCollection() {
		// Create a JSON string of the hat collection
		const exportData = JSON.stringify({ hats, lastSelectedIds });
		
		// Create a data URL with the JSON content
		const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportData);
		
		// Create a temporary anchor element
		const downloadAnchorElement = document.createElement('a');
		downloadAnchorElement.setAttribute('href', dataStr);
		downloadAnchorElement.setAttribute('download', "caps.json");
		
		// Append the anchor to the document, click it, and remove it
		document.body.appendChild(downloadAnchorElement);
		downloadAnchorElement.click();
		document.body.removeChild(downloadAnchorElement);
	}
	
	function importCollection() {
		// Create a file input element
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = 'application/json';
		
		// Handle the file selection
		fileInput.onchange = (event) => {
			const target = event.target as HTMLInputElement;
			if (!target.files || target.files.length === 0) return;
			
			const file = target.files[0];
			const reader = new FileReader();
			
			reader.onload = (e) => {
				try {
					const content = e.target?.result as string;
					const importedData = JSON.parse(content);
					
					// Validate the imported data
					if (!importedData.hats || !Array.isArray(importedData.hats)) {
						alert('Invalid file format. The file does not contain a valid hat collection.');
						return;
					}
					
					// Update the app state with the imported data
					hats = importedData.hats;
					
					// Handle lastSelectedIds if present
					if (importedData.lastSelectedIds && Array.isArray(importedData.lastSelectedIds)) {
						lastSelectedIds = importedData.lastSelectedIds;
						
						// Update the selected hat if possible
						if (lastSelectedIds.length > 0) {
							const lastId = lastSelectedIds[lastSelectedIds.length - 1];
							selectedHat = hats.find(h => h.id === lastId) || null;
						}
					} else {
						// If no lastSelectedIds, initialize as empty
						lastSelectedIds = [];
						selectedHat = null;
					}
					
					alert(`Successfully imported ${hats.length} hats.`);
				} catch (error) {
					console.error('Import error:', error);
					alert('Failed to import file. The file may be corrupted or have an invalid format.');
				}
			};
			
			reader.readAsText(file);
		};
		
		// Trigger the file selection dialog
		fileInput.click();
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
			<HatSelector {selectedHat} onSelect={selectRandomHat} hatsCount={hats.length} />
		</div>

		<div>
			<div class="mb-4">
				<NotificationSetup {hats} />
			</div>
			
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold">Collection</h2>
				<div class="flex gap-2">
					<DropdownMenu.Root>
						<DropdownMenu.Trigger class="inline-flex h-9 items-center justify-center rounded-md border px-3 py-2 text-sm font-medium">
							Data
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md">
							<DropdownMenu.Item class="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100" onclick={importCollection}>
								Import
							</DropdownMenu.Item>
							<DropdownMenu.Item class="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100" onclick={exportCollection}>
								Export
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
					<Button onclick={openAddModal} variant="ghost"><Plus /></Button>
				</div>
			</div>

			<HatInventory {hats} onEdit={openEditModal} onDelete={deleteHat} />
		</div>
	</div>

	{#if showAddEditModal}
		<HatModal hat={editingHat} onClose={closeModal} onSave={editingHat ? updateHat : addHat} />
	{/if}
</main>
