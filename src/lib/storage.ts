import { createSeedData } from "../data/seed";
import type { AppData } from "../types";

const STORAGE_KEY = "duocards:data:v1";

function isCompleteAeCard(card: AppData["cards"][number]) {
  const letters = card.alternatives.map((alternative) => alternative.id);
  return (
    card.kind === "multiple_choice" &&
    letters.join("") === "ABCDE" &&
    Object.keys(card.alternativeExplanations ?? {}).sort().join("") ===
      "ABCDE" &&
    Boolean(card.legalBasis?.length && card.memoryAid && card.sourceUrl)
  );
}

export function migrateData(data: AppData): AppData {
  if (data.version >= 2 && data.cards.every(isCompleteAeCard)) return data;

  const seed = createSeedData();
  const currentSeedById = new Map(seed.cards.map((card) => [card.id, card]));
  const cards = data.cards.map((existing) => {
    const currentSeed = currentSeedById.get(existing.id);
    if (currentSeed) {
      return {
        ...currentSeed,
        active: existing.active,
        schedule: existing.schedule,
        history: existing.history,
        createdAt: existing.createdAt,
      };
    }

    if (isCompleteAeCard(existing)) return existing;

    // Cards personalizados antigos continuam disponíveis para edição e backup,
    // mas ficam fora da fila FSRS até serem convertidos para o padrão A–E.
    return { ...existing, active: false };
  });

  return {
    ...data,
    version: seed.version,
    cards,
  };
}

export function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createSeedData();
    const parsed = JSON.parse(stored) as AppData;
    if (!parsed.version || !Array.isArray(parsed.cards)) return createSeedData();
    return migrateData(parsed);
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
    !data.version ||
    !Array.isArray(data.subjects) ||
    !Array.isArray(data.topics) ||
    !Array.isArray(data.cards)
  ) {
    throw new Error("Este arquivo não é um backup válido do DuoCards.");
  }
  return migrateData(data);
}

export function clearData() {
  localStorage.removeItem(STORAGE_KEY);
}
