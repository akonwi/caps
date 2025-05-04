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

	/**
	 * Compresses an image to reduce its size
	 */
	async function compressImage(file: File, maxWidth = 800, quality = 0.8): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (readerEvent) => {
				if (!readerEvent.target?.result) {
					return reject(new Error('Error reading file'));
				}

				const img = new Image();
				img.onload = () => {
					// Calculate new dimensions while maintaining aspect ratio
					let width = img.width;
					let height = img.height;

					if (width > maxWidth) {
						height = (height * maxWidth) / width;
						width = maxWidth;
					}

					// Create a canvas to draw the resized image
					const canvas = document.createElement('canvas');
					canvas.width = width;
					canvas.height = height;

					// Draw the image on the canvas
					const ctx = canvas.getContext('2d');
					if (!ctx) {
						return reject(new Error('Could not get canvas context'));
					}
					ctx.drawImage(img, 0, 0, width, height);

					// Get the data URL from the canvas with reduced quality
					const dataUrl = canvas.toDataURL('image/jpeg', quality);
					resolve(dataUrl);
				};

				img.onerror = () => {
					reject(new Error('Error loading image'));
				};

				img.src = readerEvent.target.result as string;
			};

			reader.onerror = () => {
				reject(new Error('Error reading file'));
			};

			reader.readAsDataURL(file);
		});
	}

	async function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			const imageFile = input.files[0];

			try {
				// Compress the image to reduce storage size
				imageUrl = await compressImage(imageFile);
				console.log('Image compressed successfully');
			} catch (error) {
				console.error('Image compression failed, falling back to standard method', error);
				// Fallback to standard method
				const reader = new FileReader();
				reader.onload = (e) => {
					if (e.target && typeof e.target.result === 'string') {
						imageUrl = e.target.result;
					}
				};
				reader.readAsDataURL(imageFile);
			}
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
				<Button type="button" variant="outline" on:click={onClose}>Cancel</Button>
				<Button type="submit">{isEditing ? 'Update' : 'Add'} Hat</Button>
			</div>
		</form>
	</div>
</div>
