import { api } from './api.js';
import { renderNavbar, showMessage } from './ui.js';

async function renderEvents() {
  const grid = document.getElementById('events-grid');
  if (!grid) return;

  grid.innerHTML = '<p class="text-slate-400">Loading events...</p>';
  try {
    const events = await api.get('/events/');
    if (!events.length) {
      grid.innerHTML = '<p class="text-slate-400">No events available right now.</p>';
      return;
    }

    grid.innerHTML = events
      .map(
        (event) => `
        <article class="glass p-5 transition-all duration-300 hover:scale-105 hover:shadow-lg fade-in">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-lg font-semibold">${event.title}</h3>
            ${event.is_hot ? '<span class="rounded-full bg-rose-500/80 px-2 py-1 text-xs">Hot</span>' : ''}
          </div>
          <p class="text-sm text-slate-300 mb-3">${event.description || 'No description available.'}</p>
          <ul class="mb-4 space-y-1 text-sm text-slate-400">
            <li><i class="fa-regular fa-calendar"></i> ${new Date(event.date).toLocaleString()}</li>
            <li><i class="fa-solid fa-location-dot"></i> ${event.venue}</li>
            <li><i class="fa-solid fa-ticket"></i> ${event.tickets_available} available</li>
          </ul>
          <div class="flex items-center justify-between">
            <span class="font-semibold text-blue-300">$${event.ticket_price}</span>
            <button class="btn-primary book-btn" data-id="${event.id}">Book Now</button>
          </div>
        </article>
      `
      )
      .join('');

    document.querySelectorAll('.book-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          btn.disabled = true;
          btn.textContent = 'Booking...';
          await api.post(`/tickets/book/${btn.dataset.id}/`, {});
          btn.textContent = 'Booked ✓';
        } catch (error) {
          showMessage('events-message', error.message);
          btn.disabled = false;
          btn.textContent = 'Book Now';
        }
      });
    });
  } catch (error) {
    showMessage('events-message', error.message);
    grid.innerHTML = '';
  }
}

renderNavbar();
renderEvents();
