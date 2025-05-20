import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ActionReturn } from "svelte/action";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Click outside directive
 */
export function clickOutside(
	node: HTMLElement,
	onClickOutside: () => void,
): ActionReturn {
	const handleClick = (event: MouseEvent) => {
		if (!node.contains(event.target as Node)) {
			onClickOutside();
		}
	};

	document.addEventListener("click", handleClick, true);

	return {
		destroy() {
			document.removeEventListener("click", handleClick, true);
		},
	};
}

/**
 * Generates a short, readable ID string
 *
 * @param length The length of the ID (default: 8)
 * @param prefix Optional prefix for the ID
 * @returns A unique short ID string
 */
export function generateId(length: number = 8, prefix: string = ""): string {
	// Characters to use (alphanumeric without ambiguous characters)
	const chars = "abcdefghjkmnpqrstuvwxyz23456789";
	let result = "";

	// Generate random characters
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * chars.length);
		result += chars.charAt(randomIndex);
	}

	// Add timestamp to ensure uniqueness even with same random values
	const timestamp = Date.now().toString(36).slice(-4);

	// Combine parts, keeping within the requested length if possible
	const id = `${prefix}${result}${timestamp}`;
	return id.slice(0, prefix.length + length + 4);
}
