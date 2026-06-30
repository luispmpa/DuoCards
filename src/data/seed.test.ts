import { describe, expect, it } from "vitest";
import { createSeedData } from "./seed";

describe("AFO seed content", () => {
  it("ships with a valid answer, explanation and source for every card", () => {
    const data = createSeedData();

    expect(data.subjects).toHaveLength(1);
    expect(data.subjects[0].code).toBe("AFO");
    expect(data.cards.length).toBeGreaterThanOrEqual(12);

    for (const card of data.cards) {
      expect(card.alternatives.map((item) => item.id)).toContain(
        card.correctAnswer,
      );
      expect(card.explanation.length).toBeGreaterThan(30);
      expect(card.source.length).toBeGreaterThan(10);
      expect(data.topics.some((topic) => topic.id === card.topicId)).toBe(true);
    }
  });
});

