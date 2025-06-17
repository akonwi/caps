import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppState } from '@/types';

const STORAGE_KEY = 'cap_app_state';

export async function saveState(state: AppState): Promise<void> {
  try {
    const jsonValue = JSON.stringify(state);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    console.log(`Successfully saved ${state.hats.length} hats`);
  } catch (error) {
    console.error('Failed to save state:', error);
    throw error;
  }
}

export async function loadState(): Promise<AppState | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue) {
      const state = JSON.parse(jsonValue) as AppState;
      console.log(`Loaded ${state.hats.length} hats from storage`);
      return state;
    }
    return null;
  } catch (error) {
    console.error('Failed to load state:', error);
    return null;
  }
}
