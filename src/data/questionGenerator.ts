import type { Difficulty } from "../types";

export type QuestionGenerationOptions = {
  topicId: string;
  kind: "multiple_choice";
  difficulty: Difficulty | "all";
  count: number;
};
