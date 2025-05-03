<script lang="ts">
	import type { Hat } from '$lib';
	import HatInventory from '$lib/components/hat-inventory.svelte';
	import HatModal from '$lib/components/hat-modal.svelte';
	import HatSelector from '$lib/components/hat-selector.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Plus } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let hats: Hat[] = $state([]);
	let selectedHat: Hat | null = $state(null);
	let previousHatId: string | null = null;
	let showAddEditModal = $state(false);
	let editingHat: Hat | null = $state(null);

	onMount(() => {
		const stored = localStorage.getItem('cap_state');
		if (stored) {
			const data = JSON.parse(stored);
			hats = data.hats;
			previousHatId = data.previousHatId;
		}
	});

	function save() {
		localStorage.setItem('cap_state', JSON.stringify({ hats, previousHatId }));
	}

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
		save();
		closeModal();
	}

	function updateHat(updatedHat: Hat) {
		hats = hats.map((hat) => (hat.id === updatedHat.id ? updatedHat : hat));
		save();
		closeModal();
	}

	function deleteHat(id: string) {
		hats = hats.filter((hat) => hat.id !== id);
		save();

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

		// Filter out the previously selected hat to avoid consecutive selections
		const availableHats = hats.filter((hat) => hat.id !== previousHatId);

		// Select a random hat from available hats
		const randomIndex = Math.floor(Math.random() * availableHats.length);
		selectedHat = availableHats[randomIndex];
		previousHatId = selectedHat.id;
	}
</script>

<main class="container mx-auto max-w-4xl px-4 py-8">
	<h1 class="mb-6 text-center text-3xl font-bold">Caps</h1>

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
