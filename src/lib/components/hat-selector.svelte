<script lang="ts">
	import type { Hat } from '$lib';
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';

	export let selectedHat: Hat | null = null;
	export let onSelect: () => void;
	export let hatsCount: number = 0;
</script>

<div class="h-full">
	<h2 class="mb-4 text-xl font-semibold">Today's Hat Selection</h2>

	<Card class="flex flex-col items-center p-6">
		{#if selectedHat}
			<div class="mb-4 h-64 w-64 overflow-hidden rounded-lg bg-gray-100">
				{#if selectedHat.imageUrl}
					<img
						src={selectedHat.imageUrl}
						alt={selectedHat.name}
						class="h-full w-full object-cover"
					/>
				{:else}
					<div class="flex h-full w-full items-center justify-center text-gray-400">No image</div>
				{/if}
			</div>

			<h3 class="mb-2 text-2xl font-bold">{selectedHat.name}</h3>
		{:else}
			<div
				class="mb-4 flex h-64 w-64 items-center justify-center rounded-lg bg-gray-100 text-gray-400"
			>
				No hat selected
			</div>

			<p class="mb-6 text-center">
				{#if hatsCount === 0}
					Add some hats to the collection first!
				{/if}
			</p>
		{/if}

		<Button disabled={hatsCount === 0} onclick={onSelect} class="px-8">Pick a Random Hat</Button>
	</Card>
</div>
