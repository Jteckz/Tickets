async function loadTicketDetail() {
    requireAuth();

    const path = window.location.pathname;
    const match = path.match(/tickets\/(\d+)\/?/);
    const ticketId = match ? match[1] : null;

    if (!ticketId) {
        alert("Invalid Ticket URL");
        window.location.href = "/tickets/";
        return;
    }

    try {
        const ticket = await apiGet(`/tickets/my/${ticketId}/`);
        renderTicket(ticket);
    } catch (err) {
        console.error(err);
        alert("Failed to load ticket.");
        window.location.href = "/tickets/";
    }
}

function renderTicket(ticket) {
    document.getElementById("loader").classList.add("hidden");
    document.getElementById("ticket-content").classList.remove("hidden");

    const event = ticket.event || { title: "Unknown Event" };
    const eventDate = event.date
        ? new Date(event.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
        : "Date TBA";

    document.getElementById("event-title").textContent = event.title;
    document.getElementById("event-date").textContent = eventDate;

    const verificationCode = `TKT-${String(ticket.id).padStart(6, "0")}`;
    document.getElementById("ticket-code").textContent = verificationCode;

    const qrImg = document.getElementById("qr-code");
    if (ticket.qr_code) {
        qrImg.src = ticket.qr_code;
    } else {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=ticket:${ticket.id}`;
    }
    qrImg.classList.remove("opacity-50");

    document.getElementById("attendee-name").textContent = getUser().username || "You";
    document.getElementById("ticket-type").textContent = "General";

    const statusBadge = document.getElementById("ticket-status-badge");
    const status = ticket.status || "unused";
    if (status === "unused") {
        statusBadge.className = "mt-4 px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide";
        statusBadge.textContent = "Valid Entry";
    } else if (status === "used") {
        statusBadge.className = "mt-4 px-4 py-1.5 rounded-full bg-gray-200 text-gray-600 text-xs font-bold uppercase tracking-wide";
        statusBadge.textContent = "Used";
    } else {
        statusBadge.className = "mt-4 px-4 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wide";
        statusBadge.textContent = "Cancelled";
    }

    const downloadBtn = document.getElementById("download-ticket-btn");
    downloadBtn.onclick = () => downloadTicket(ticket.id, event.title, verificationCode);
}

async function downloadTicket(ticketId, eventTitle, verificationCode) {
    const btn = document.getElementById("download-ticket-btn");
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Downloading...";

    try {
        const res = await fetch(API_BASE + `/tickets/download/${ticketId}/`, {
            headers: getHeaders(true),
        });
        if (!res.ok) {
            throw new Error("Could not download ticket QR.");
        }

        const qrBlob = await res.blob();
        const qrUrl = URL.createObjectURL(qrBlob);

        const link = document.createElement("a");
        link.href = qrUrl;
        link.download = `${eventTitle.replace(/\s+/g, "_")}_${verificationCode}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(qrUrl);
    } catch (error) {
        console.error(error);
        alert(error.message || "Download failed.");
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}
