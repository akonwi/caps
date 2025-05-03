<script lang="ts">
	import type { Hat } from '$lib';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { generateId } from '$lib/utils';

	export let hat: Hat | null = null;
	export let onClose: () => void;
	export let onSave: (hat: Hat) => void;

	let name = hat?.name || '';
	let imageUrl = hat?.imageUrl || '';

	const isEditing = !!hat;

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			const imageFile = input.files[0];

			// Convert the image file to a base64 data URL
			const reader = new FileReader();
			reader.onload = (e) => {
				if (e.target && typeof e.target.result === 'string') {
					imageUrl = e.target.result;
				}
			};
			reader.readAsDataURL(imageFile);
		}
	}

	function handleSubmit() {
		if (!name.trim()) {
			alert('Please enter a hat name');
			return;
		}

		const newHat: Hat = {
			id: isEditing ? hat!.id : generateId(),
			name: name.trim(),
			imageUrl
		};

		onSave(newHat);
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
	<div class="w-full max-w-md rounded-lg bg-white p-6">
		<h2 class="mb-4 text-xl font-semibold">{isEditing ? 'Edit Hat' : 'Add New Hat'}</h2>

		<form on:submit|preventDefault={handleSubmit} class="space-y-4">
			<div>
				<Label for="hat-name">Hat Name</Label>
				<Input id="hat-name" bind:value={name} placeholder="Enter hat name" required />
			</div>

			<div>
				<Label for="hat-image">Hat Image</Label>
				<Input id="hat-image" type="file" accept="image/*" on:change={handleFileChange} />

				{#if imageUrl}
					<div class="mt-2 h-48 w-full overflow-hidden rounded bg-gray-100">
						<img src={imageUrl} alt="Hat preview" class="h-full w-full object-contain" />
					</div>
				{/if}
			</div>

			<div class="flex justify-end gap-2 pt-4">
				<Button type="button" variant="outline" onclick={onClose}>Cancel</Button>
				<Button type="submit">{isEditing ? 'Update' : 'Add'} Hat</Button>
			</div>
		</form>
	</div>
</div>
