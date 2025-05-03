<script lang="ts">
	import type { Hat } from '$lib';
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';

	export let hats: Hat[] = [];
	export let onEdit: (hat: Hat) => void;
	export let onDelete: (id: string) => void;

	function confirmDelete(id: string, name: string) {
		if (confirm(`Are you sure you want to delete the hat "${name}"?`)) {
			onDelete(id);
		}
	}
</script>

<div class="mt-4 space-y-4">
	{#if hats.length === 0}
		<div class="rounded-lg border bg-gray-50 p-8 text-center">
			<p>No hats in your collection yet. Add some hats to get started!</p>
		</div>
	{:else}
		{#each hats as hat (hat.id)}
			<Card class="flex items-start gap-4 p-4">
				<div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
					{#if hat.imageUrl}
						<img src={hat.imageUrl} alt={hat.name} class="h-full w-full object-cover" />
					{:else}
						<div class="flex h-full w-full items-center justify-center text-gray-400">No image</div>
					{/if}
				</div>

				<div class="flex-grow">
					<h3 class="font-medium">{hat.name}</h3>
				</div>

				<div class="flex flex-col gap-2">
					<Button variant="outline" size="sm" on:click={() => onEdit(hat)}>Edit</Button>
					<Button variant="destructive" size="sm" on:click={() => confirmDelete(hat.id, hat.name)}
						>Delete</Button
					>
				</div>
			</Card>
		{/each}
	{/if}
</div>
