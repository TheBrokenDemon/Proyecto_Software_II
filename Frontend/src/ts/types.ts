export interface User {
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface SurveyRecord {
  id: string;
  date: string;
  emotion: string;
  intensity: number;
  factors: string[];
  note: string;
  emoji: string;
}

export interface AppState {
  currentUser: User | null;
  surveyData: {
    emotion: string;
    emoji: string;
    intensity: number;
    factors: string[];
  };
  history: SurveyRecord[];
}