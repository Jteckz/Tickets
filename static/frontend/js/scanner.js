import { api } from './api.js';
import { renderNavbar, requireAuth, showMessage } from './ui.js';

async function verifyTicket(event) {
  event.preventDefault();
  const user = requireAuth(['staff', 'admin']);
  if (!user) return;

  const ticketId = document.getElementById('ticket-id').value.trim();
  if (!ticketId) {
    showMessage('scanner-message', 'Please provide ticket ID.');
    return;
  }

  const result = document.getElementById('scanner-result');
  result.textContent = 'Verifying...';

  try {
    const data = await api.post('/tickets/verify/', { ticket_id: ticketId });
    result.className = 'mt-4 rounded-xl bg-emerald-500/20 p-3 text-emerald-300';
    result.textContent = `${data.message}: ${data.event}`;
  } catch (error) {
    result.className = 'mt-4 rounded-xl bg-rose-500/20 p-3 text-rose-300';
    result.textContent = error.message;
  }
}

document.getElementById('scanner-form')?.addEventListener('submit', verifyTicket);

renderNavbar();
