export function showError(el: HTMLElement, msg: string): void {
  el.textContent = msg;
  el.classList.remove('hidden');
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}