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

function getFileName(headers, fallback) {
  const disposition = headers.get('content-disposition') || '';
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);

  const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
  return plainMatch?.[1] || fallback;
}

async function handleDownload(ticketId) {
  try {
    const { blob, headers } = await api.download(`/tickets/download/${ticketId}/`);
    const fileName = getFileName(headers, `ticket_${ticketId}.pdf`);

    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    showMessage('tickets-message', error.message);
  }
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
          <button class="btn-primary download-btn" data-ticket-id="${ticket.id}">Download</button>
        </div>
      </article>
    `
      )
      .join('');

    document.querySelectorAll('.qr-btn').forEach((button) => {
      button.addEventListener('click', () => openModal(button.dataset.src, button.dataset.title));
    });

    document.querySelectorAll('.download-btn').forEach((button) => {
      button.addEventListener('click', () => handleDownload(button.dataset.ticketId));
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
