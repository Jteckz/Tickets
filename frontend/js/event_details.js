async function loadEventDetail() {
    requireAuth();

    // extract ID from URL: e.g. /events/3/
    const path = window.location.pathname;
    const match = path.match(/events\/(\d+)\//);
    const eventId = match ? match[1] : null;

    if (!eventId) {
        alert("Invalid Event URL");
        window.location.href = "/dashboard/";
        return;
    }

    // save for booking
    window.currentEventId = eventId;

    try {
        const event = await apiGet(`/events/${eventId}/`);
        renderEvent(event);
    } catch (err) {
        console.error(err);
        alert("Control failed to load event.");
        window.location.href = "/dashboard/";
    }
}

function renderEvent(event) {
    document.getElementById("loader").classList.add("hidden");
    document.getElementById("event-content").classList.remove("hidden");

    document.getElementById("event-title").textContent = event.title;
    document.getElementById("event-desc").textContent = event.description || "No description provided.";

    // Formatting
    const date = new Date(event.date);
    document.getElementById("event-date").textContent = date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    document.getElementById("event-location").textContent = event.location || "Online / TBA";
    document.getElementById("event-price").textContent = event.price ? `$${event.price}` : "Free";
    document.getElementById("event-available").textContent = event.tickets_available || "Unlimited";

    if (event.image) {
        document.getElementById("event-image").src = event.image;
    } else {
        document.getElementById("event-image").src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop";
    }

    const btn = document.getElementById("book-btn");

    // Check ticket availability
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
        const res = await apiPost(`/tickets/book/${window.currentEventId}/`, {});
        alert("Ticket booked successfully!");
        window.location.href = "/tickets/"; // Redirect to my tickets
    } catch (err) {
        console.error(err);
        const msg = err.error || err.detail || JSON.stringify(err);
        alert("Booking failed: " + msg);
        btn.disabled = false;
        btn.textContent = originalText;
        btn.classList.remove("opacity-75");
    }
}
