import { api } from './api.js';
import { renderNavbar, requireAuth, showMessage, clearMessage } from './ui.js';

async function loadProviderDashboard() {
  const user = requireAuth(['provider']);
  if (!user) return;

  try {
    const data = await api.get('/dashboard/provider/data/');
    document.getElementById('events-count').textContent = data.events_count;
    document.getElementById('tickets-sold').textContent = data.tickets_sold;
    document.getElementById('revenue').textContent = `$${data.revenue.toFixed(2)}`;

    const list = document.getElementById('provider-events');
    list.innerHTML = data.events
      .map(
        (event) => `
      <article class="glass p-4">
        <div class="flex items-center justify-between gap-2">
          <h4 class="font-semibold">${event.title}</h4>
          <button class="btn-secondary edit-event-btn" data-id="${event.id}">Edit</button>
        </div>
        <p class="mt-2 text-sm text-slate-300">${event.description || 'No description'}</p>
      </article>
    `
      )
      .join('') || '<p class="text-slate-400">No events created yet.</p>';

    document.querySelectorAll('.edit-event-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.getElementById('event-id').value = btn.dataset.id;
        document.getElementById('form-title').textContent = 'Edit Event';
      });
    });
  } catch (error) {
    showMessage('provider-message', error.message);
  }
}

async function submitEventForm(event) {
  event.preventDefault();
  clearMessage('provider-message');

  const form = event.currentTarget;
  const getTrimmedValue = (name) => (form.elements.namedItem(name)?.value || '').trim();
  const getNumberValue = (name) => Number(form.elements.namedItem(name)?.value);

  const payload = {
    title: getTrimmedValue('title'),
    description: getTrimmedValue('description'),
    date: form.elements.namedItem('date')?.value || '',
    venue: getTrimmedValue('venue'),
    ticket_price: getNumberValue('ticket_price'),
    total_tickets: getNumberValue('total_tickets'),
    tickets_available: getNumberValue('tickets_available'),
    is_hot: Boolean(form.elements.namedItem('is_hot')?.checked),
  };

  const hasMissingRequiredText = !payload.title || !payload.date || !payload.venue;
  const hasInvalidNumbers = [payload.ticket_price, payload.total_tickets, payload.tickets_available].some(
    (value) => Number.isNaN(value) || value < 0
  );

  if (hasMissingRequiredText || hasInvalidNumbers) {
    showMessage('provider-message', 'Please complete all required fields.');
    return;
  }

  const eventId = form.elements.namedItem('event_id')?.value || '';
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    if (eventId) {
      await api.patch(`/events/${eventId}/`, payload);
      showMessage('provider-message', 'Event updated successfully.', 'success');
    } else {
      await api.post('/events/', payload);
      showMessage('provider-message', 'Event created successfully.', 'success');
    }
    form.reset();
    const eventIdField = form.elements.namedItem('event_id');
    if (eventIdField) {
      eventIdField.value = '';
    }
    document.getElementById('form-title').textContent = 'Create Event';
    await loadProviderDashboard();
  } catch (error) {
    showMessage('provider-message', error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Event';
  }
}

document.getElementById('provider-form')?.addEventListener('submit', submitEventForm);

renderNavbar();
loadProviderDashboard();
