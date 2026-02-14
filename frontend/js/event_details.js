async function loadEventDetail() {
    requireAuth();

    let eventId = window.djangoEventId;
    if (!eventId) {
        const path = window.location.pathname;
        const match = path.match(/events\/(\d+)\/?/);
        eventId = match ? match[1] : null;
        if (!eventId) {
             const params = new URLSearchParams(window.location.search);
             eventId = params.get("id");
        }
    }

    if (!eventId) {
        alert("Invalid Event URL");
        window.location.href = "/dashboard/";
        return;
    }

    window.currentEventId = eventId;

    try {
        const event = await apiGet(`/events/${eventId}/`, false);
        renderEvent(event);
    } catch (err) {
        console.error(err);
        alert("Failed to load event.");
        window.location.href = "/dashboard/";
    }
}

function renderEvent(event) {
    document.getElementById("loader").classList.add("hidden");
    document.getElementById("event-content").classList.remove("hidden");

    document.getElementById("event-title").textContent = event.title;
    document.getElementById("event-desc").textContent = event.description || "No description provided.";

    const date = new Date(event.date);
    document.getElementById("event-date").textContent = date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    document.getElementById("event-location").textContent = event.venue || "Online / TBA";
    document.getElementById("event-price").textContent = Number(event.ticket_price) > 0 ? `$${event.ticket_price}` : "Free";
    document.getElementById("event-available").textContent = event.tickets_available ?? "Unlimited";

    document.getElementById("event-image").src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop";

    const btn = document.getElementById("book-btn");
    if (event.tickets_available !== null && event.tickets_available <= 0) {
        btn.disabled = true;
        btn.textContent = "Sold Out";
        btn.classList.add("bg-gray-600", "cursor-not-allowed");
        btn.classList.remove("bg-gradient-to-r");
    }
}

async function bookTicket() {
    const btn = document.getElementById("book-btn");
    const originalText = btn.textContent;

    if (!confirm("Confirm purchase for this event?")) return;

    btn.disabled = true;
    btn.textContent = "Processing...";
    btn.classList.add("opacity-75");

    try {
        codex/inspect-and-test-event-ticketing-features-f2k6cx
        const ticket = await apiPost(`/tickets/book/${window.currentEventId}/`, {});
        alert("Ticket booked successfully! Your QR ticket will open now.");
        window.location.href = `/tickets/${ticket.id}/?download=1`;

        await apiPost(`/tickets/book/${window.currentEventId}/`, {});
        alert("Ticket booked successfully!");
        window.location.href = "/tickets/";
        main
    } catch (err) {
        console.error(err);
        const msg = err.error || err.detail || JSON.stringify(err);
        alert("Booking failed: " + msg);
        btn.disabled = false;
        btn.textContent = originalText;
        btn.classList.remove("opacity-75");
    }
}
