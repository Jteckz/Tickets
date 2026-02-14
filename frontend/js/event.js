async function loadEvents() {
  requireAuth();

  const container = document.getElementById("events");
  const loader = document.getElementById("events-loader");
  const emptyState = document.getElementById("events-empty");

  try {
    const events = await apiGet("/events/");
    loader.classList.add("hidden");

    if (!events || events.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }

    container.classList.remove("hidden");
    container.innerHTML = events.map(renderEventCard).join("");
  } catch (error) {
    console.error(error);
    loader.classList.add("hidden");
    container.classList.remove("hidden");
    container.innerHTML = `<p class="text-red-400 col-span-full text-center">Failed to load events.</p>`;
  }
}

function renderEventCard(event) {
  const sold = event.total_tickets ? Math.max(event.total_tickets - event.tickets_available, 0) : 0;
  const progress = event.total_tickets ? Math.round((sold / event.total_tickets) * 100) : 0;
  const priceLabel = Number(event.ticket_price) > 0 ? `$${event.ticket_price}` : "Free";
  const when = event.date
    ? new Date(event.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Date TBA";

  return `
    <article class="glass rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/40 transition-all group">
      <div class="h-48 overflow-hidden relative">
        <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop" alt="${event.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <span class="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10">${priceLabel}</span>
        ${event.is_hot ? '<span class="absolute top-3 left-3 bg-orange-500/90 text-xs font-bold px-3 py-1 rounded-full">🔥 Hot</span>' : ''}
      </div>
      <div class="p-5">
        <h3 class="text-xl font-bold mb-1 text-white">${event.title}</h3>
        <p class="text-sm text-gray-400 mb-1">${event.venue || "TBA"}</p>
        <p class="text-sm text-blue-300 mb-3">${when}</p>
        <p class="text-sm text-gray-300 line-clamp-2 mb-4">${event.description || "No description provided."}</p>

        <div class="mb-4">
          <div class="h-2 bg-white/10 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style="width:${progress}%"></div>
          </div>
          <p class="mt-1 text-xs text-gray-400">${sold}/${event.total_tickets || "∞"} sold</p>
        </div>

        <button onclick="viewEvent(${event.id})" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold transition-all">View Event</button>
      </div>
    </article>
  `;
}

function viewEvent(id) {
  window.location.href = `/events/${id}/`;
}
