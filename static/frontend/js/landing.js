import { api } from './api.js';
import { renderNavbar } from './ui.js';

async function loadFeatured() {
  const container = document.getElementById('featured-events');
  if (!container) return;

  try {
    const events = await api.get('/events/');
    container.innerHTML = events
      .slice(0, 3)
      .map(
        (event) => `
      <article class="glass p-5 transition-all duration-300 hover:scale-105 hover:shadow-lg fade-in">
        <h3 class="text-lg font-semibold">${event.title}</h3>
        <p class="mt-2 text-sm text-slate-300">${event.description || 'Premium event experience.'}</p>
        <p class="mt-3 text-sm text-slate-400">${event.venue}</p>
      </article>
    `
      )
      .join('');
  } catch {
    container.innerHTML = '<p class="text-slate-400">Unable to load featured events.</p>';
  }
}

renderNavbar();
loadFeatured();
