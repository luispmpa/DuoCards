import { describe, expect, it } from "vitest";
import {
  newFsrsCard,
  previewFsrsCard,
  Rating,
  reviewFsrsCard,
  serializeFsrsCard,
} from "./fsrs";

describe("FSRS scheduler", () => {
  it("creates a new due card and previews all four grades", () => {
    const now = new Date("2026-06-30T12:00:00.000Z");
    const card = newFsrsCard(now);
    const preview = previewFsrsCard(card, now);

    expect(card.due).toBe(now.toISOString());
    expect(preview[Rating.Again].card.due).toBeInstanceOf(Date);
    expect(preview[Rating.Hard].card.due).toBeInstanceOf(Date);
    expect(preview[Rating.Good].card.due).toBeInstanceOf(Date);
    expect(preview[Rating.Easy].card.due).toBeInstanceOf(Date);
  });

  it("persists the state returned by ts-fsrs after a review", () => {
    const now = new Date("2026-06-30T12:00:00.000Z");
    const result = reviewFsrsCard(newFsrsCard(now), Rating.Good, now);
    const stored = serializeFsrsCard(result.card);

    expect(stored.reps).toBe(1);
    expect(new Date(stored.due).getTime()).toBeGreaterThan(now.getTime());
    expect(stored.stability).toBeGreaterThan(0);
  });
});

