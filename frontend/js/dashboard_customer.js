let customerEventsPollingId = null;
let customerEventsSyncListenerBound = false;

async function loadCustomerDashboard() {
    requireAuth();

    const user = getUser();
    if (user) {
        document.getElementById("user-name").innerText = user.username || "User";
        document.getElementById("user-avatar").innerText = (user.username || "U").charAt(0).toUpperCase();
    }

    await fetchEvents();

    if (!customerEventsPollingId) {
        customerEventsPollingId = setInterval(fetchEvents, 15000);
    }

    if (!customerEventsSyncListenerBound) {
        window.addEventListener("storage", (e) => {
            if (e.key === "events_last_published_at") {
                fetchEvents();
            }
        });
        customerEventsSyncListenerBound = true;
    }
}

async function fetchEvents() {
    const container = document.getElementById("events-container");
    const loader = document.getElementById("events-loader");
    const noEvents = document.getElementById("no-events");

    try {
        const events = await apiGet(`/events/?_=${Date.now()}`);
        loader.classList.add("hidden");

        if (!events || events.length === 0) {
            noEvents.classList.remove("hidden");
            return;
        }

        container.classList.remove("hidden");
        container.innerHTML = events.map((event) => renderEventCard(event)).join("");
    } catch (err) {
        console.error(err);
        loader.classList.add("hidden");
        container.innerHTML = `<p class="text-red-400 text-center col-span-full">Failed to load events.</p>`;
        container.classList.remove("hidden");
    }
}

function renderEventCard(event) {
    const title = event.title || "Untitled Event";
    const dateObj = event.date ? new Date(event.date) : null;
    const date = dateObj ? dateObj.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Date TBA";
    const venue = event.venue || "TBA";
    const price = Number(event.ticket_price) > 0 ? `$${event.ticket_price}` : "Free";
    const image = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop";
    const id = event.id;
    const sold = event.total_tickets ? Math.max(event.total_tickets - event.tickets_available, 0) : 0;
    const progress = event.total_tickets ? Math.round((sold / event.total_tickets) * 100) : 0;

    return `
    <article class="glass rounded-2xl overflow-hidden border border-white/10 card-hover group">
        <div class="h-48 overflow-hidden relative">
            <img src="${image}" alt="${title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
            <div class="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10">${price}</div>
            ${event.is_hot ? '<div class="absolute top-3 left-3 bg-orange-500/90 text-xs font-bold px-3 py-1 rounded-full">🔥 Hot</div>' : ''}
        </div>
        <div class="p-5">
            <div class="flex items-center gap-2 text-blue-400 text-xs font-medium mb-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                ${date}
            </div>
            <h3 class="text-xl font-bold text-white mb-2 leading-tight group-hover:text-blue-400 transition-colors">${title}</h3>
            <div class="flex items-center gap-2 text-gray-400 text-sm mb-3">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                ${venue}
            </div>
            <div class="mb-4">
                <div class="h-2 bg-white/10 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style="width:${progress}%"></div></div>
                <p class="mt-1 text-xs text-gray-400">${sold}/${event.total_tickets || "∞"} sold</p>
            </div>
            <button onclick="viewEvent(${id})" class="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all">View Event</button>
        </div>
    </article>
  `;
}

function viewEvent(eventId) {
    window.location.href = `/events/${eventId}/`;
}
