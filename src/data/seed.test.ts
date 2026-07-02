import { describe, expect, it } from "vitest";
import { migrateData } from "../lib/storage";
import { createSeedData } from "./seed";

describe("AFO seed content", () => {
  it("ships only complete A-E questions ready for FSRS", () => {
    const data = createSeedData();

    expect(data.subjects).toHaveLength(1);
    expect(data.subjects[0].code).toBe("AFO");
    expect(data.version).toBe(2);
    expect(data.cards.length).toBeGreaterThanOrEqual(12);

    for (const card of data.cards) {
      expect(card.kind).toBe("multiple_choice");
      expect(card.alternatives.map((item) => item.id)).toEqual([
        "A",
        "B",
        "C",
        "D",
        "E",
      ]);
      expect(card.alternatives.map((item) => item.id)).toContain(card.correctAnswer);
      expect(Object.keys(card.alternativeExplanations ?? {}).sort()).toEqual([
        "A",
        "B",
        "C",
        "D",
        "E",
      ]);
      expect(
        Object.values(card.alternativeExplanations ?? {}).every(
          (explanation) => explanation.length > 70,
        ),
      ).toBe(true);
      expect(card.explanation.length).toBeGreaterThan(180);
      expect(card.source.length).toBeGreaterThan(10);
      expect(card.sourceUrl).toContain("planalto.gov.br");
      expect(card.legalBasis?.length).toBeGreaterThan(0);
      expect(card.memoryAid?.content.length).toBeGreaterThan(40);
      expect(data.topics.some((topic) => topic.id === card.topicId)).toBe(true);
    }
  });

  it("migrates legacy seed cards without resetting their FSRS history", () => {
    const legacy = createSeedData();
    const originalSchedule = {
      ...legacy.cards[0].schedule,
      reps: 7,
      stability: 12,
    };
    const originalHistory = [
      {
        reviewedAt: "2026-06-30T12:00:00.000Z",
        rating: 3,
        state: 2,
        due: "2026-07-12T12:00:00.000Z",
        elapsedDays: 2,
        scheduledDays: 12,
        answerCorrect: true,
      },
    ];
    legacy.version = 1;
    legacy.cards[0] = {
      ...legacy.cards[0],
      kind: "true_false",
      alternatives: [
        { id: "A", text: "Certo" },
        { id: "B", text: "Errado" },
      ],
      alternativeExplanations: undefined,
      legalBasis: undefined,
      memoryAid: undefined,
      sourceUrl: undefined,
      schedule: originalSchedule,
      history: originalHistory,
    };

    const migrated = migrateData(legacy);
    const card = migrated.cards[0];

    expect(migrated.version).toBe(2);
    expect(card.kind).toBe("multiple_choice");
    expect(card.alternatives.map((alternative) => alternative.id)).toEqual([
      "A",
      "B",
      "C",
      "D",
      "E",
    ]);
    expect(card.schedule).toEqual(originalSchedule);
    expect(card.history).toEqual(originalHistory);
  });
});
