import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  type Card,
  type Grade,
  Rating,
  State,
} from "ts-fsrs";
import type { SerializedFsrsCard } from "../types";

const scheduler = fsrs(
  generatorParameters({
    enable_fuzz: true,
    enable_short_term: true,
  }),
);

export { Rating, State };

export function serializeFsrsCard(card: Card): SerializedFsrsCard {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review?.toISOString(),
  };
}

export function deserializeFsrsCard(card: SerializedFsrsCard): Card {
  return {
    ...card,
    due: new Date(card.due),
    last_review: card.last_review ? new Date(card.last_review) : undefined,
  } as Card;
}

export function newFsrsCard(now = new Date()): SerializedFsrsCard {
  return serializeFsrsCard(createEmptyCard(now));
}

export function reviewFsrsCard(
  stored: SerializedFsrsCard,
  rating: Grade,
  now = new Date(),
) {
  return scheduler.next(deserializeFsrsCard(stored), now, rating);
}

export function previewFsrsCard(
  stored: SerializedFsrsCard,
  now = new Date(),
) {
  return scheduler.repeat(deserializeFsrsCard(stored), now);
}

export function intervalLabel(date: Date, now = new Date()) {
  const minutes = Math.max(
    1,
    Math.round((date.getTime() - now.getTime()) / 60000),
  );
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} d`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} m`;
  return `${(days / 365).toFixed(1).replace(".0", "")} a`;
}
