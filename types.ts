export interface Section {
  id: string;
  title: string;
  description?: string;
}

export interface Chapter {
  id: string;
  title: string;
  sections: Section[];
}

export interface TextbookStructure {
  topic: string;
  targetAudience: string;
  chapters: Chapter[];
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export enum AppState {
  WELCOME = 'WELCOME',
  GENERATING_STRUCTURE = 'GENERATING_STRUCTURE',
  READING = 'READING',
  ERROR = 'ERROR'
}

export interface GeneratedContent {
  markdown: string;
  quiz?: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
