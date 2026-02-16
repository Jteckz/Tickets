import { api } from './api.js';
import { renderNavbar, requireAuth, showMessage } from './ui.js';

async function loadDashboard() {
  const user = requireAuth(['customer', 'admin']);
  if (!user) return;

  document.getElementById('welcome-text').textContent = `Welcome back, ${user.username}`;
  document.getElementById('role-pill').textContent = user.role;

  try {
    const [events, tickets] = await Promise.all([api.get('/events/'), api.get('/tickets/my/')]);

    const upcoming = events.slice(0, 3).map((event) => `<li>${event.title} · ${new Date(event.date).toLocaleDateString()}</li>`).join('');
    document.getElementById('upcoming-events').innerHTML = upcoming || '<li>No upcoming events.</li>';

    const myTickets = tickets.slice(0, 3).map((ticket) => `<li>${ticket.event.title} · ${ticket.status}</li>`).join('');
    document.getElementById('my-tickets').innerHTML = myTickets || '<li>No tickets purchased yet.</li>';
  } catch (error) {
    showMessage('dashboard-message', error.message);
  }
}

renderNavbar();
loadDashboard();
