import { User } from "./types.js";
import { getUsers, saveUsers, getHistory } from "./storage.js";
import { showError } from "./utils.js";
import { state } from "./app.js";
import { updateDashboard } from "./dashboard.js";

export function handleRegister(): void {

  const name = (document.getElementById('reg-name') as HTMLInputElement).value.trim();
  const email = (document.getElementById('reg-email') as HTMLInputElement).value.trim();
  const pass = (document.getElementById('reg-pass') as HTMLInputElement).value;
  const pass2 = (document.getElementById('reg-pass2') as HTMLInputElement).value;

  const errEl = document.getElementById('reg-error')!;

  errEl.classList.add('hidden');

  if (!name || !email || !pass) {
    showError(errEl, 'Completa todos los campos');
    return;
  }

  if (pass !== pass2) {
    showError(errEl, 'Las contraseñas no coinciden');
    return;
  }

  const users = getUsers();

  if (users[email]) {
    showError(errEl, 'Ese correo ya existe');
    return;
  }

  const newUser: User = {
    name,
    email,
    password: pass,
    createdAt: new Date().toISOString()
  };

  users[email] = newUser;

  saveUsers(users);

  loginUser(newUser);
}

export function handleLogin(): void {

  const email = (document.getElementById('login-email') as HTMLInputElement).value.trim();

  const pass = (document.getElementById('login-pass') as HTMLInputElement).value;

  const errEl = document.getElementById('login-error')!;

  errEl.classList.add('hidden');

  const users = getUsers();

  const user = users[email];

  if (!user || user.password !== pass) {
    showError(errEl, 'Correo o contraseña incorrectos');
    return;
  }

  loginUser(user);
}

export function loginUser(user: User): void {

  state.currentUser = user;

  localStorage.setItem('sentir_session', user.email);

  state.history = getHistory(user.email);

  updateDashboard();

  window.location.href = "dashboard.html";
}

export function handleLogout(): void {

  localStorage.removeItem('sentir_session');

  window.location.href = "index.html";
}

export function handleRecovery(): void {

  const email = (document.getElementById('recovery-email') as HTMLInputElement).value.trim();

  if (!email.includes('@')) {
    alert('Correo inválido');
    return;
  }

  document.getElementById('recovery-form')?.classList.add('hidden');

  document.getElementById('recovery-success')?.classList.remove('hidden');
}

(window as any).handleRegister = handleRegister;
(window as any).handleLogin = handleLogin;
(window as any).handleLogout = handleLogout;
(window as any).handleRecovery = handleRecovery;