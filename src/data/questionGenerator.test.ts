import { describe, expect, it } from "vitest";
import { createSeedData } from "./seed";
import {
  countAvailableEditorialQuestions,
  editorialQuestionBank,
  generateEditorialQuestions,
} from "./questionGenerator";

const defaultOptions = {
  topicId: "all",
  kind: "mixed" as const,
  difficulty: "all" as const,
  count: 10,
};

describe("editorial question generator", () => {
  it("keeps every template answerable and sourced", () => {
    expect(editorialQuestionBank).toHaveLength(24);

    for (const question of editorialQuestionBank) {
      expect(question.alternatives.map((item) => item.id)).toContain(
        question.correctAnswer,
      );
      expect(question.explanation.length).toBeGreaterThan(50);
      expect(question.source.length).toBeGreaterThan(10);
    }
  });

  it("generates the requested number without duplicating existing cards", () => {
    const data = createSeedData();
    const generated = generateEditorialQuestions(data, defaultOptions);
    const nextData = { ...data, cards: [...data.cards, ...generated] };

    expect(generated).toHaveLength(10);
    expect(new Set(generated.map((card) => card.id)).size).toBe(10);
    expect(countAvailableEditorialQuestions(nextData, defaultOptions)).toBe(14);
  });

  it("respects topic and question type filters", () => {
    const generated = generateEditorialQuestions(createSeedData(), {
      topicId: "topic_lrf",
      kind: "true_false",
      difficulty: "all",
      count: 10,
    });

    expect(generated.length).toBeGreaterThan(0);
    expect(generated.every((card) => card.topicId === "topic_lrf")).toBe(true);
    expect(generated.every((card) => card.kind === "true_false")).toBe(true);
  });
});
