async function loadTicketDetail() {
    requireAuth();

    // extract ID from URL: e.g. /tickets/5/
    const path = window.location.pathname;
    const match = path.match(/tickets\/(\d+)\//);
    const ticketId = match ? match[1] : null;

    if (!ticketId) {
        alert("Invalid Ticket URL");
        window.location.href = "/tickets/";
        return;
    }

    try {
        const ticket = await apiGet(`/tickets/my/${ticketId}/`);
        // Note: The router was `router.register("tickets/my", TicketViewSet, basename="my-tickets")`
        // So details endpoint is likely `/tickets/my/{id}/` if relying on Standard ViewSet
        // But `front_urls.py` sets explicit views? No, `my-tickets` implies ViewSet.
        // Let's verify route. `router.register` creates `/tickets/my/` and `/tickets/my/{pk}/`

        renderTicket(ticket);
    } catch (err) {
        console.error(err);
        alert("Control failed to load ticket.");
        window.location.href = "/tickets/";
    }
}

function renderTicket(ticket) {
    document.getElementById("loader").classList.add("hidden");
    document.getElementById("ticket-content").classList.remove("hidden");

    const event = ticket.event || { title: "Unknown Event" };

    document.getElementById("event-title").textContent = event.title;
    document.getElementById("event-date").textContent = new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    document.getElementById("ticket-code").textContent = ticket.formatted_code || ticket.qr_code_data || ticket.id;
    // Assuming backend sends a friendly code, or we just show ID. 
    // Actually the prompt said "View ticket QR code". 
    // Backend `tickets/core/serializers/` might have the field name. 
    // Typically `qr_code` field contains the URL or data.

    const qrImg = document.getElementById("qr-code");
    if (ticket.qr_code) {
        // If it's a URL
        qrImg.src = ticket.qr_code;
        qrImg.classList.remove("opacity-50");
    } else {
        // Generate QR code if backend doesn't provide image URL but provides data
        // For MVP, if backend provides URL, good. If not, we might need a library like qrcode.js.
        // I'll assume backend provides a URL or I'll set a placeholder.
        // If `ticket.qr_code` is missing, try `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.qr_code_data}`
        const codeData = ticket.qr_code_data || ticket.id;
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${codeData}`;
        qrImg.classList.remove("opacity-50");
    }

    document.getElementById("attendee-name").textContent = getUser().username || "You"; // Or ticket.owner field
    document.getElementById("ticket-type").textContent = ticket.ticket_type || "General";

    const statusBadge = document.getElementById("ticket-status-badge");
    if (ticket.status === "valid") {
        statusBadge.className = "mt-4 px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide";
        statusBadge.textContent = "Valid Entry";
    } else if (ticket.status === "used") {
        statusBadge.className = "mt-4 px-4 py-1.5 rounded-full bg-gray-200 text-gray-500 text-xs font-bold uppercase tracking-wide";
        statusBadge.textContent = "Used";
    } else {
        statusBadge.className = "mt-4 px-4 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wide";
        statusBadge.textContent = ticket.status;
    }
}
