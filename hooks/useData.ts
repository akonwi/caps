import { useState, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { Hat } from '@/types';

export function useData() {
  const db = useSQLiteContext();
  const [hats, setHats] = useState<Hat[]>([]);
  const [selectedHat, setSelectedHat] = useState<Hat | null>(null);
  const [lastSelectedIds, setLastSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [db]);

  const loadData = async () => {
    try {

      // Load hats
      const hatsResult = await db.getAllAsync<Hat>(
        'SELECT id, name, imageUrl FROM hats ORDER BY ROWID DESC'
      );
      setHats(hatsResult || []);

      // Load lastSelectedIds
      const stateResult = await db.getFirstAsync<{ value: string }>(
        'SELECT value FROM state WHERE key = ?',
        ['lastSelectedIds']
      );

      if (stateResult?.value) {
        const ids = JSON.parse(stateResult.value);
        setLastSelectedIds(ids);

        // Set selected hat to the most recent one
        if (ids.length > 0) {
          const mostRecentId = ids[ids.length - 1];
          const mostRecentHat = hatsResult?.find((h) => h.id === mostRecentId);
          setSelectedHat(mostRecentHat || null);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoading(false);
    }
  };

  const add = async (hat: Hat) => {
    try {
      await db.runAsync(
        'INSERT INTO hats (id, name, imageUrl) VALUES (?, ?, ?)',
        [hat.id, hat.name, hat.imageUrl]
      );
      setHats((prev) => [hat, ...prev]);
    } catch (error) {
      console.error('Error adding hat:', error);
      throw error;
    }
  };

  const bulkAdd = async (newHats: Hat[]) => {
    try {
      for (const hat of newHats) {
        await db.runAsync(
          'INSERT INTO hats (id, name, imageUrl) VALUES (?, ?, ?)',
          [hat.id, hat.name, hat.imageUrl]
        );
      }
      setHats(newHats);
    } catch (error) {
      console.error('Error bulk adding hats:', error);
      throw error;
    }
  };

  const deleteHat = async (id: string) => {
    try {
      await db.runAsync('DELETE FROM hats WHERE id = ?', [id]);
      setHats((prev) => prev.filter((h) => h.id !== id));

      // Clear selected hat if it was deleted
      if (selectedHat?.id === id) {
        setSelectedHat(null);
      }

      // Remove from lastSelectedIds
      const newLastSelectedIds = lastSelectedIds.filter((hatId) => hatId !== id);
      setLastSelectedIds(newLastSelectedIds);
      await saveLastSelectedIds(newLastSelectedIds);
    } catch (error) {
      console.error('Error deleting hat:', error);
      throw error;
    }
  };

  const update = async (hat: Hat) => {
    try {
      await db.runAsync(
        'UPDATE hats SET name = ?, imageUrl = ? WHERE id = ?',
        [hat.name, hat.imageUrl, hat.id]
      );
      setHats((prev) => prev.map((h) => (h.id === hat.id ? hat : h)));

      // Update selected hat if it was the one being edited
      if (selectedHat?.id === hat.id) {
        setSelectedHat(hat);
      }
    } catch (error) {
      console.error('Error updating hat:', error);
      throw error;
    }
  };

  const saveLastSelectedIds = async (ids: string[]) => {
    try {
      await db.runAsync(
        'INSERT OR REPLACE INTO state (key, value) VALUES (?, ?)',
        ['lastSelectedIds', JSON.stringify(ids)]
      );
    } catch (error) {
      console.error('Error saving lastSelectedIds:', error);
      throw error;
    }
  };

  const updateLastSelectedIds = async (ids: string[]) => {
    setLastSelectedIds(ids);
    await saveLastSelectedIds(ids);
  };

  const clearAll = async () => {
    try {
      await db.runAsync('DELETE FROM hats');
      await db.runAsync('DELETE FROM state');
      setHats([]);
      setSelectedHat(null);
      setLastSelectedIds([]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  };

  return {
    hats,
    selectedHat,
    lastSelectedIds,
    isLoading,
    add,
    bulkAdd,
    delete: deleteHat,
    update,
    setSelectedHat,
    updateLastSelectedIds,
    clearAll,
  };
}
