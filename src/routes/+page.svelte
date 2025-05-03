<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	interface Hat {
		id: number;
		name: string;
		imageUrl: string | null;
	}

	let showAddEditModal = false;
	let editingHat: Hat | null = null;

	function openAddModal() {
		editingHat = null;
		showAddEditModal = true;
	}
</script>

<main class="container mx-auto max-w-4xl px-4 py-8">
	<h1 class="mb-6 text-center text-3xl font-bold">Caps</h1>

	<div class="grid gap-8 md:grid-cols-2">
		<div>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold">Collection</h2>
				<Button on:click={openAddModal}>Add New Hat</Button>
				<Button on:click={openAddModal}>Add New Hat</Button>
			</div>

			<!-- <HatInventory {hats} onEdit={openEditModal} onDelete={deleteHat} /> -->
		</div>

		<!-- <div> -->
		<!-- <HatSelector {selectedHat} onSelect={selectRandomHat} hatsCount={hats.length} /> -->
		<!-- </div> -->
	</div>

	<!-- {#if showAddEditModal}
		<AddEditHatModal
			hat={editingHat}
			onClose={closeModal}
			onSave={editingHat ? updateHat : addHat}
		/>
	{/if} -->
</main>
