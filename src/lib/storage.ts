/**
 * Storage service with fallback from localStorage to IndexedDB
 */

// Interface for our app state
export interface AppState {
	hats: Array<{
		id: string;
		name: string;
		imageUrl: string | null;
	}>;
	previousHatId: string | null;
	lastSelectedIds: string[] | null;
}

// Database name and store name
const DB_NAME = "cap_app";
const STORE_NAME = "app_state";
const STATE_KEY = "main_state";

/**
 * Initialize the IndexedDB database
 */
async function initializeDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, 1);

		request.onerror = () => {
			console.error("Error opening IndexedDB");
			reject(new Error("Could not open IndexedDB"));
		};

		request.onsuccess = () => {
			resolve(request.result);
		};

		request.onupgradeneeded = (event) => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, { keyPath: "id" });
			}
		};
	});
}

/**
 * Save state to IndexedDB
 */
async function saveToIndexedDB(
	state: Omit<AppState, "previousHatId">,
): Promise<void> {
	try {
		const db = await initializeDb();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, "readwrite");
			const store = transaction.objectStore(STORE_NAME);

			const request = store.put({
				id: STATE_KEY,
				...state,
			});

			request.onsuccess = () => {
				resolve();
			};

			request.onerror = () => {
				reject(new Error("Error saving to IndexedDB"));
			};

			transaction.oncomplete = () => {
				db.close();
			};
		});
	} catch (error) {
		console.error("IndexedDB save error:", error);
		throw error;
	}
}

/**
 * Load state from IndexedDB
 */
async function loadFromIndexedDB(): Promise<AppState | null> {
	try {
		const db = await initializeDb();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, "readonly");
			const store = transaction.objectStore(STORE_NAME);

			const request = store.get(STATE_KEY);

			request.onsuccess = () => {
				if (request.result) {
					// Remove the id property used for IndexedDB
					const { id, ...state } = request.result;
					resolve(state as AppState);
				} else {
					resolve(null);
				}
			};

			request.onerror = () => {
				reject(new Error("Error loading from IndexedDB"));
			};

			transaction.oncomplete = () => {
				db.close();
			};
		});
	} catch (error) {
		console.error("IndexedDB load error:", error);
		return null;
	}
}

/**
 * Save state with fallback
 * Tries localStorage first, falls back to IndexedDB if localStorage fails
 */
export async function saveState(
	state: Omit<AppState, "previousHatId">,
): Promise<void> {
	let localStorageSuccess = false;

	// Try localStorage first
	try {
		localStorage.setItem("cap_state", JSON.stringify(state));
		const verification = localStorage.getItem("cap_state");
		localStorageSuccess = !!verification;
		console.log("State saved to localStorage:", localStorageSuccess);
	} catch (e) {
		console.warn("localStorage save failed, using IndexedDB fallback");
	}

	// If localStorage failed, try IndexedDB
	if (!localStorageSuccess) {
		try {
			await saveToIndexedDB(state);
			console.log("State saved to IndexedDB");
		} catch (error) {
			console.error("All storage methods failed", error);
			throw new Error("Could not save state");
		}
	}
}

/**
 * Load state with fallback
 * Tries localStorage first, falls back to IndexedDB if localStorage fails
 */
export async function loadState(): Promise<AppState | null> {
	// Try localStorage first
	try {
		const data = localStorage.getItem("cap_state");
		if (data) {
			const state = JSON.parse(data) as AppState;
			console.log("State loaded from localStorage");
			return state;
		}
	} catch (e) {
		console.warn("localStorage load failed, trying IndexedDB");
	}

	// If localStorage failed or had no data, try IndexedDB
	try {
		const state = await loadFromIndexedDB();
		if (state) {
			console.log("State loaded from IndexedDB");
			return state;
		}
	} catch (error) {
		console.error("IndexedDB load failed", error);
	}

	// If all storage methods failed, return null
	return null;
}

/**
 * Check if storage is available
 */
export function checkStorageAvailability(): {
	localStorage: boolean;
	indexedDB: boolean;
} {
	const availability = {
		localStorage: false,
		indexedDB: false,
	};

	// Check localStorage
	try {
		localStorage.setItem("test", "test");
		if (localStorage.getItem("test") === "test") {
			availability.localStorage = true;
		}
		localStorage.removeItem("test");
	} catch (e) {
		console.warn("localStorage not available");
	}

	// Check IndexedDB
	try {
		if (window.indexedDB) {
			availability.indexedDB = true;
		}
	} catch (e) {
		console.warn("IndexedDB not available");
	}

	return availability;
}
