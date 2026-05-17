import { User, SurveyRecord } from "./types.js";

export function getUsers(): Record<string, User> {
  return JSON.parse(localStorage.getItem('sentir_users') || '{}');
}

export function saveUsers(users: Record<string, User>): void {
  localStorage.setItem('sentir_users', JSON.stringify(users));
}

export function getHistory(email: string): SurveyRecord[] {
  const raw = localStorage.getItem(`sentir_history_${email}`);
  return raw ? JSON.parse(raw) : [];
}

export function saveHistory(email: string, history: SurveyRecord[]): void {
  localStorage.setItem(`sentir_history_${email}`, JSON.stringify(history));
}