import { api } from './api.js';
import { auth } from './auth.js';
import { renderNavbar } from './ui.js';

function formatDate(value) {
  if (!value) return 'Date to be announced';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date to be announced';

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value ?? '';
  return div.innerHTML;
}

function getSessionToken() {
  return localStorage.getItem('access_token') || auth.getAccessToken();
}

function updateAuthLink() {
  const authLink = document.getElementById('landing-auth-link');
  if (!authLink) return;

  const isLoggedIn = Boolean(getSessionToken());
  authLink.textContent = isLoggedIn ? 'Logout' : 'Login';
  authLink.href = isLoggedIn ? '#' : '/login/';

  if (isLoggedIn) {
    authLink.addEventListener('click', (event) => {
      event.preventDefault();
      auth.logout();
    });
  }
}

async function handleBook(eventId) {
  if (!getSessionToken()) {
    alert('Please login to continue with booking.');
    window.location.href = '/login/';
    return;
  }

  try {
    await api.post(`/tickets/book/${eventId}/`, {});
    alert('Ticket booked successfully! Redirecting to your tickets.');
    window.location.href = '/tickets/';
  } catch (error) {
    alert(error.message || 'Could not complete booking.');
  }
}

function startHeroSlider() {
  const slides = [...document.querySelectorAll('.hero-slide')];
  if (slides.length < 2) return;

  let activeIndex = 0;
  setInterval(() => {
    slides[activeIndex].classList.remove('is-active');
    activeIndex = (activeIndex + 1) % slides.length;
    slides[activeIndex].classList.add('is-active');
  }, 4200);
}

function createEventCardMarkup(item) {
  const title = escapeHtml(item.title || 'Untitled Event');
  const venue = escapeHtml(item.venue || 'Venue to be announced');

  return `
    <article class="event-card">
      <h3>${title}</h3>
      <p class="event-meta">${formatDate(item.date)}</p>
      <p class="event-meta">${venue}</p>
      <button class="book-btn" type="button" data-event-id="${item.id}">Book Now</button>
    </article>
  `;
}

function renderEvents(events) {
  const grid = document.getElementById('events-grid');
  if (!grid) return;

  if (!events.length) {
    grid.innerHTML = '<p class="event-empty">No events available right now. Please check back soon.</p>';
    return;
  }

  grid.innerHTML = events.slice(0, 6).map(createEventCardMarkup).join('');

  grid.querySelectorAll('.book-btn').forEach((button) => {
    button.addEventListener('click', () => handleBook(button.dataset.eventId));
  });
}

async function loadEvents() {
  const grid = document.getElementById('events-grid');
  if (!grid) return;

  grid.innerHTML = '<p class="event-empty">Loading featured events...</p>';

  try {
    const events = await api.get('/events/');
    renderEvents(Array.isArray(events) ? events : []);
  } catch {
    grid.innerHTML = '<p class="event-empty">Unable to load events right now. Please try again shortly.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  updateAuthLink();
  startHeroSlider();
  loadEvents();
});
