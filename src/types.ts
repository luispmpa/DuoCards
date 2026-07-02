export type View = "home" | "study" | "content" | "progress" | "settings";

export type CardKind = "multiple_choice" | "true_false";
export type Difficulty = "Básico" | "Intermediário" | "Avançado";
export type MemoryAidType =
  | "Esquema"
  | "Mnemônico"
  | "Mapa mental"
  | "Quadro comparativo";

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  createdAt: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  description: string;
  weight: number;
  createdAt: string;
}

export interface Alternative {
  id: string;
  text: string;
}

export interface LegalBasis {
  reference: string;
  excerpt: string;
}

export interface MemoryAid {
  type: MemoryAidType;
  title: string;
  content: string;
}

export interface SerializedFsrsCard {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: string;
}

export interface ReviewEntry {
  reviewedAt: string;
  rating: number;
  state: number;
  due: string;
  elapsedDays: number;
  scheduledDays: number;
  answerCorrect: boolean;
}

export interface StudyCard {
  id: string;
  subjectId: string;
  topicId: string;
  kind: CardKind;
  question: string;
  alternatives: Alternative[];
  correctAnswer: string;
  explanation: string;
  distractorNotes: Record<string, string>;
  alternativeExplanations?: Record<string, string>;
  legalBasis?: LegalBasis[];
  memoryAid?: MemoryAid;
  source: string;
  sourceUrl?: string;
  tags: string[];
  difficulty: Difficulty;
  active: boolean;
  schedule: SerializedFsrsCard;
  history: ReviewEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface DailyActivity {
  date: string;
  reviewed: number;
  correct: number;
  minutes: number;
  xp: number;
}

export interface Profile {
  name: string;
  goal: number;
  xp: number;
  streak: number;
  lastStudyDate?: string;
}

export interface AppSettings {
  dailyGoal: number;
  newCardsPerDay: number;
  theme: "light";
}

export interface AppData {
  version: number;
  profile: Profile;
  subjects: Subject[];
  topics: Topic[];
  cards: StudyCard[];
  activity: DailyActivity[];
  settings: AppSettings;
}

export interface FirebaseStatus {
  configured: boolean;
  connected: boolean;
  syncing: boolean;
  message: string;
  userEmail?: string;
}
