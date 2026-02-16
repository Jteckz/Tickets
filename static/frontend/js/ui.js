import { auth } from './auth.js';

export function showMessage(elementId, message, type = 'error') {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.className = `mt-3 text-sm ${type === 'error' ? 'text-rose-400' : 'text-emerald-400'}`;
}

export function clearMessage(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = '';
}

export function renderNavbar() {
  const mount = document.getElementById('navbar-root');
  if (!mount) return;

  const user = auth.getUser();
  const roleLinks = {
    provider: '<a href="/provider-dashboard/" class="hover:text-blue-400">Provider</a>',
    customer: '<a href="/dashboard/" class="hover:text-blue-400">Dashboard</a>',
    staff: '<a href="/scanner/" class="hover:text-blue-400">Scanner</a>',
    admin: '<a href="/dashboard/" class="hover:text-blue-400">Admin</a>',
  };

  mount.innerHTML = `
    <header class="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav class="glass mx-auto max-w-7xl px-4 py-3 text-slate-100">
        <div class="flex items-center justify-between">
          <a href="/" class="text-xl font-bold tracking-tight">TicketFlow</a>
          <button id="mobile-menu-btn" class="md:hidden">
            <i class="fa-solid fa-bars"></i>
          </button>
          <div class="hidden md:flex items-center gap-5 text-sm" id="desktop-nav">
            <a href="/events/" class="hover:text-blue-400">Events</a>
            <a href="/tickets/" class="hover:text-blue-400">Tickets</a>
            ${user ? roleLinks[user.role] || '' : ''}
            ${
              user
                ? `<button id="logout-btn" class="btn-secondary !py-2 !px-3">Logout</button>`
                : `<a href="/login/" class="hover:text-blue-400">Login</a>
                   <a href="/register/" class="btn-primary !py-2 !px-3">Register</a>`
            }
          </div>
        </div>
        <div class="hidden mt-3 flex-col gap-2 text-sm md:hidden" id="mobile-nav">
          <a href="/events/" class="hover:text-blue-400">Events</a>
          <a href="/tickets/" class="hover:text-blue-400">Tickets</a>
          ${user ? roleLinks[user.role] || '' : ''}
          ${
            user
              ? `<button id="logout-btn-mobile" class="btn-secondary text-left">Logout</button>`
              : `<a href="/login/" class="hover:text-blue-400">Login</a>
                 <a href="/register/" class="hover:text-blue-400">Register</a>`
          }
        </div>
      </nav>
    </header>
  `;

  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
    document.getElementById('mobile-nav')?.classList.toggle('hidden');
  });

  document.getElementById('logout-btn')?.addEventListener('click', () => auth.logout());
  document.getElementById('logout-btn-mobile')?.addEventListener('click', () => auth.logout());
}

export function requireAuth(roles = []) {
  const user = auth.getUser();
  if (!auth.isAuthenticated() || !user) {
    window.location.href = '/login/';
    return null;
  }

  if (roles.length && !roles.includes(user.role)) {
    window.location.href = '/dashboard/';
    return null;
  }

  return user;
}
