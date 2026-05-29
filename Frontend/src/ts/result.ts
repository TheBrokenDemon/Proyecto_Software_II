import { SurveyRecord } from "./types.js";

const messages: Record<string, string> = {

  feliz: 'Qué bueno que te sientas feliz 🌿',

  triste: 'Está bien sentirse triste a veces 💙',

  ansiosa: 'Respira profundo. Todo pasará ✨',

  cansada: 'Descansar también es avanzar 🌙'
};

export function showResultScreen(
  record: SurveyRecord
): void {

  const emoji =
    document.getElementById('result-emoji');

  const emotion =
    document.getElementById('result-emotion-text');

  const message =
    document.getElementById('result-message');

  if (emoji) emoji.textContent = record.emoji;

  if (emotion) emotion.textContent = record.emotion;

  if (message) {
    message.textContent =
      messages[record.emotion] ||
      'Gracias por registrar tus emociones';
  }

  launchConfetti();

  window.location.href = "result.html";
}

export function launchConfetti(): void {

  const container =
    document.getElementById('result-confetti');

  if (!container) return;

  container.innerHTML = '';

  for (let i = 0; i < 40; i++) {

    const piece = document.createElement('div');

    piece.className = 'confetti-piece';

    piece.style.left = Math.random() * 100 + '%';

    piece.style.animationDelay =
      Math.random() * 2 + 's';

    container.appendChild(piece);
  }
}