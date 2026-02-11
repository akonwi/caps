import type { Hat } from "@/types";

export const pickRandomHat = (
  hats: Hat[],
  lastSelectedIds: string[],
  maxRecent = 7,
) => {
  if (hats.length === 0) {
    return { hat: null, nextLastSelectedIds: lastSelectedIds };
  }

  const availableHats = hats.filter((hat) => !lastSelectedIds.includes(hat.id));
  const selectionPool = availableHats.length > 0 ? availableHats : hats;
  const randomIndex = Math.floor(Math.random() * selectionPool.length);
  const hat = selectionPool[randomIndex] || null;

  if (!hat) {
    return { hat: null, nextLastSelectedIds: lastSelectedIds };
  }

  const nextLastSelectedIds = lastSelectedIds.filter((id) => id !== hat.id);
  if (nextLastSelectedIds.length >= maxRecent) {
    nextLastSelectedIds.shift();
  }
  nextLastSelectedIds.push(hat.id);

  return { hat, nextLastSelectedIds };
};
