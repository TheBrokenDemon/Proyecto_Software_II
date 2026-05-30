import { state } from "./app.js";
import { formatDate } from "./utils.js";

export function updateDashboard(): void {

  if (!state.currentUser) return;

  const name =
    document.getElementById('dash-name');

  if (name) {
    name.textContent =
      state.currentUser.name;
  }

  renderHistory();

  renderProfile();
}

export function renderHistory(): void {

  const list =
    document.getElementById('history-list');

  if (!list) return;

  if (!state.history.length) {

    list.innerHTML = `
      <div class="empty-state">
        Sin registros todavía
      </div>
    `;

    return;
  }

  list.innerHTML = state.history.map(r => `
  
    <div class="history-item">

      <div class="history-emoji">
        ${r.emoji}
      </div>

      <div class="history-info">

        <h4>${r.emotion}</h4>

        <small>
          ${formatDate(r.date)}
        </small>

      </div>

    </div>

  `).join('');
}

export function renderProfile(): void {

  if (!state.currentUser) return;

  const user = state.currentUser;

  const nameInput = document.getElementById('profile-name-input') as HTMLInputElement;
  if (nameInput) nameInput.value = user.name;

  const emailInput = document.getElementById('profile-email-input') as HTMLInputElement;
  if (emailInput) emailInput.value = user.email;
}

export function handleProfileSave(): void {

  alert('Perfil actualizado');
}

(window as any).handleProfileSave =
  handleProfileSave;