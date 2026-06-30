import { createSeedData } from "../data/seed";
import type { AppData } from "../types";

const STORAGE_KEY = "duocards:data:v1";

export function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createSeedData();
    const parsed = JSON.parse(stored) as AppData;
    if (!parsed.version || !Array.isArray(parsed.cards)) return createSeedData();
    return parsed;
  } catch {
    return createSeedData();
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function downloadBackup(data: AppData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = `duocards-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(href);
}

export async function parseBackup(file: File): Promise<AppData> {
  const data = JSON.parse(await file.text()) as AppData;
  if (
    data.version !== 1 ||
    !Array.isArray(data.subjects) ||
    !Array.isArray(data.topics) ||
    !Array.isArray(data.cards)
  ) {
    throw new Error("Este arquivo não é um backup válido do DuoCards.");
  }
  return data;
}

export function clearData() {
  localStorage.removeItem(STORAGE_KEY);
}
