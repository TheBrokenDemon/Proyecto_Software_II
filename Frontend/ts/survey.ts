import { state } from "./app.js";
import { saveHistory } from "./storage.js";
import { showResultScreen } from "./result.js";

export function selectEmotion(btn: HTMLButtonElement): void {

  document.querySelectorAll('.emotion-btn')
    .forEach(b => b.classList.remove('selected'));

  btn.classList.add('selected');

  state.surveyData.emotion = btn.dataset['emotion'] || '';

  state.surveyData.emoji =
    btn.querySelector('.emotion-emoji')?.textContent || '✦';

  (document.getElementById('btn-step1') as HTMLButtonElement)
    .disabled = false;
}

export function selectIntensity(
  btn: HTMLButtonElement,
  value: number
): void {

  document.querySelectorAll('.scale-btn')
    .forEach(b => b.classList.remove('selected'));

  btn.classList.add('selected');

  state.surveyData.intensity = value;

  (document.getElementById('btn-step2') as HTMLButtonElement)
    .disabled = false;
}

export function toggleFactor(btn: HTMLButtonElement): void {

  btn.classList.toggle('selected');

  const text = btn.textContent?.trim() || '';

  const idx = state.surveyData.factors.indexOf(text);

  if (idx === -1) {
    state.surveyData.factors.push(text);
  } else {
    state.surveyData.factors.splice(idx, 1);
  }
}

export function nextStep(current: number): void {

  document.getElementById(`step-${current}`)?.classList.add('hidden');

  document.getElementById(`step-${current + 1}`)?.classList.remove('hidden');
}

export function finishSurvey(): void {

  const note =
    (document.getElementById('survey-note') as HTMLTextAreaElement).value;

  const record = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    emotion: state.surveyData.emotion,
    intensity: state.surveyData.intensity,
    factors: state.surveyData.factors,
    note,
    emoji: state.surveyData.emoji
  };

  state.history.push(record);

  saveHistory(state.currentUser!.email, state.history);

  showResultScreen(record);
}

(window as any).selectEmotion = selectEmotion;
(window as any).selectIntensity = selectIntensity;
(window as any).toggleFactor = toggleFactor;
(window as any).nextStep = nextStep;
(window as any).finishSurvey = finishSurvey;