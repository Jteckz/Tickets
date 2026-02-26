import { api } from './api.js';
import { renderNavbar, requireAuth, showMessage, clearMessage } from './ui.js';

let providerEvents = [];

function formatDateForInput(isoDate) {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function resetImageControls(form) {
  const currentWrap = document.getElementById('current-image-wrap');
  const currentPreview = document.getElementById('current-image-preview');
  const clearImageInput = form.elements.namedItem('clear_image');
  const imageInput = form.elements.namedItem('image');

  currentWrap?.classList.add('hidden');
  if (currentPreview) currentPreview.src = '';
  if (clearImageInput) clearImageInput.checked = false;
  if (imageInput) imageInput.value = '';
}

function populateEventForm(eventData) {
  const form = document.getElementById('provider-form');
  if (!form || !eventData) return;

  form.elements.namedItem('event_id').value = eventData.id;
  form.elements.namedItem('title').value = eventData.title || '';
  form.elements.namedItem('description').value = eventData.description || '';
  form.elements.namedItem('date').value = formatDateForInput(eventData.date);
  form.elements.namedItem('venue').value = eventData.venue || '';
  form.elements.namedItem('ticket_price').value = eventData.ticket_price;
  form.elements.namedItem('total_tickets').value = eventData.total_tickets;
  form.elements.namedItem('tickets_available').value = eventData.tickets_available;
  form.elements.namedItem('is_hot').checked = Boolean(eventData.is_hot);

  const currentWrap = document.getElementById('current-image-wrap');
  const currentPreview = document.getElementById('current-image-preview');
  if (eventData.image) {
    currentPreview.src = eventData.image;
    currentWrap.classList.remove('hidden');
  } else {
    resetImageControls(form);
  }

  document.getElementById('form-title').textContent = 'Edit Event';
}

function bindEventCardActions() {
  document.querySelectorAll('.edit-event-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const eventId = Number(btn.dataset.id);
      const eventData = providerEvents.find((item) => item.id === eventId);
      populateEventForm(eventData);
    });
  });

  document.querySelectorAll('.delete-event-btn').forEach((btn) => {
    btn.addEventListener('click', () => deleteEvent(Number(btn.dataset.id), btn.closest('article')));
  });
}

async function loadProviderDashboard() {
  const user = requireAuth(['provider']);
  if (!user) return;

  try {
    const data = await api.get('/dashboard/provider/data/');
    providerEvents = data.events;

    document.getElementById('events-count').textContent = data.events_count;
    document.getElementById('tickets-sold').textContent = data.tickets_sold;
    document.getElementById('revenue').textContent = `$${data.revenue.toFixed(2)}`;

    const list = document.getElementById('provider-events');
    list.innerHTML = data.events
      .map(
        (event) => `
      <article class="glass p-4 transition-all duration-300">
        <div class="flex items-center justify-between gap-2">
          <h4 class="font-semibold">${event.title}</h4>
          <div class="flex items-center gap-2">
            <button class="btn-secondary edit-event-btn" data-id="${event.id}">Edit</button>
            <button class="btn-secondary delete-event-btn" data-id="${event.id}">Delete</button>
          </div>
        </div>
        ${event.image ? `<img src="${event.image}" alt="${event.title}" class="mt-2 h-28 w-full rounded-lg object-cover" />` : ''}
        <p class="mt-2 text-sm text-slate-300">${event.description || 'No description'}</p>
      </article>
    `
      )
      .join('') || '<p class="text-slate-400">No events created yet.</p>';

    bindEventCardActions();
  } catch (error) {
    showMessage('provider-message', error.message);
  }
}

async function deleteEvent(id, cardElement) {
  clearMessage('provider-message');
  if (!id) return;

  const shouldDelete = window.confirm('Delete this event? This cannot be undone.');
  if (!shouldDelete) return;

  try {
    await api.delete(`/events/${id}/`);

    if (cardElement) {
      cardElement.classList.add('opacity-0', 'translate-x-2');
      setTimeout(() => cardElement.remove(), 280);
    }

    showMessage('provider-message', 'Event deleted successfully.', 'success');
    await loadProviderDashboard();
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

  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const imageFile = form.elements.namedItem('image')?.files?.[0];
  if (imageFile) {
    formData.append('image', imageFile);
  } else if (form.elements.namedItem('clear_image')?.checked) {
    formData.append('clear_image', 'true');
  }

  const eventId = form.elements.namedItem('event_id')?.value || '';
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    if (eventId) {
      await api.patch(`/events/${eventId}/`, formData);
      showMessage('provider-message', 'Event updated successfully.', 'success');
    } else {
      await api.post('/events/', formData);
      showMessage('provider-message', 'Event created successfully.', 'success');
    }

    form.reset();
    form.elements.namedItem('event_id').value = '';
    resetImageControls(form);
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
