async function loadProviderEvents() {
    requireAuth();
    // Validate role
    if (getUser().role !== 'provider') {
        window.location.href = '/dashboard/';
        return;
    }

    await fetchMyEvents();
}

async function fetchMyEvents() {
    const container = document.getElementById("events-container");
    const loader = document.getElementById("loader");
    const noEvents = document.getElementById("no-events");

    loader.classList.remove("hidden");
    container.innerHTML = "";

    try {
        const myEvents = await apiGet("/events/?mine=1");

        loader.classList.add("hidden");

        if (myEvents.length === 0) {
            noEvents.classList.remove("hidden");
            return;
        }

        noEvents.classList.add("hidden");
        container.innerHTML = myEvents.map(renderEventRow).join("");

    } catch (err) {
        console.error(err);
        loader.classList.add("hidden");
        container.innerHTML = `<p class="text-red-400">Failed to fetch events.</p>`;
    }
}

function renderEventRow(event) {
    return `
    <div class="glass p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h3 class="font-bold text-lg text-white">${event.title}</h3>
            <div class="text-sm text-gray-400 flex flex-wrap gap-4 mt-1">
                <span>${new Date(event.date).toLocaleDateString()}</span>
                <span>$${event.ticket_price}</span>
                <span class="${event.tickets_available > 0 ? 'text-green-400' : 'text-red-400'}">
                    ${event.tickets_available} / ${event.total_tickets} left
                </span>
            </div>
        </div>
        <div class="flex gap-2 w-full sm:w-auto">
            <!-- Edit button could go here -->
            <button onclick="deactivateEvent(${event.id})" class="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors w-full sm:w-auto">
                Delete
            </button>
        </div>
    </div>
    `;
}

async function createEvent() {
    const btn = document.getElementById("create-btn");
    const title = document.getElementById("title").value;
    const venue = document.getElementById("location").value;
    const date = document.getElementById("date").value;
    const ticket_price = document.getElementById("price").value;
    const total_tickets = document.getElementById("total_tickets").value;
    const description = document.getElementById("description").value;

    if (!title || !venue || !date || !ticket_price || !total_tickets) {
        alert("Please fill in all required fields.");
        return;
    }

    btn.disabled = true;
    btn.textContent = "Publishing...";

    const payload = {
        title,
        venue,
        date,
        ticket_price,
        total_tickets,
        tickets_available: total_tickets,
        description,
        // provider: user.id // Backend sets this from request.user
    };

    try {
        await apiPost("/events/", payload);
        alert("Event created successfully!");

        // Reset form
        document.getElementById("title").value = "";
        document.getElementById("location").value = "";
        document.getElementById("date").value = "";
        document.getElementById("price").value = "";
        document.getElementById("total_tickets").value = "";
        document.getElementById("description").value = "";

        fetchMyEvents(); // Refresh list

    } catch (err) {
        console.error(err);
        alert("Failed to create event: " + (err.detail || JSON.stringify(err)));
    } finally {
        btn.disabled = false;
        btn.textContent = "Publish Event";
    }
}

async function deactivateEvent(id) {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;

    try {
        // Assuming DELETE /api/events/{id}/
        // api.js apiPost helper does not support DELETE without modification or using fetch directly
        // I need to use fetch or update api.js. I'll use fetch directly for now using headers from api.js

        const res = await fetch(API_BASE + `/events/${id}/`, {
            method: "DELETE",
            headers: getHeaders(true)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Delete failed.");
        }

        // If successful
        fetchMyEvents();

    } catch (err) {
        console.error(err);
        alert(err.message || "Delete failed.");
    }
}
