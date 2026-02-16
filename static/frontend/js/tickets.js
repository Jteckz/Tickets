import { api } from './api.js';
import { renderNavbar, requireAuth, showMessage } from './ui.js';

function openModal(src, title) {
  const modal = document.getElementById('qr-modal');
  modal.querySelector('img').src = src;
  modal.querySelector('h3').textContent = title;
  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('qr-modal').classList.add('hidden');
}

async function loadTickets() {
  const user = requireAuth();
  if (!user) return;

  const list = document.getElementById('tickets-list');
  list.innerHTML = '<p class="text-slate-400">Loading your tickets...</p>';

  try {
    const tickets = await api.get('/tickets/my/');
    if (!tickets.length) {
      list.innerHTML = '<p class="text-slate-400">No purchased tickets yet.</p>';
      return;
    }

    list.innerHTML = tickets
      .map(
        (ticket) => `
      <article class="glass p-5 fade-in">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-lg font-semibold">${ticket.event.title}</h3>
          <span class="rounded-full bg-slate-700 px-3 py-1 text-xs">${ticket.status}</span>
        </div>
        <p class="mt-2 text-slate-300">${ticket.event.venue} · ${new Date(ticket.event.date).toLocaleString()}</p>
        <div class="mt-4 flex gap-3">
          <button class="btn-secondary qr-btn" data-title="${ticket.event.title}" data-src="${ticket.qr_code}">View QR</button>
          <a class="btn-primary" href="/api/tickets/download/${ticket.id}/">Download</a>
        </div>
      </article>
    `
      )
      .join('');

    document.querySelectorAll('.qr-btn').forEach((button) => {
      button.addEventListener('click', () => openModal(button.dataset.src, button.dataset.title));
    });
  } catch (error) {
    showMessage('tickets-message', error.message);
    list.innerHTML = '';
  }
}

document.getElementById('close-modal')?.addEventListener('click', closeModal);
document.getElementById('qr-modal')?.addEventListener('click', (event) => {
  if (event.target.id === 'qr-modal') closeModal();
});

renderNavbar();
loadTickets();
