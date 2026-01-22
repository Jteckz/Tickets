async function loadMyTickets() {
    requireAuth();

    const container = document.getElementById("tickets-container");
    const loader = document.getElementById("loader");
    const noTickets = document.getElementById("no-tickets");

    try {
        const data = await apiGet("/tickets/my/");
        loader.classList.add("hidden");

        if (!data || data.length === 0) {
            noTickets.classList.remove("hidden");
            return;
        }

        container.classList.remove("hidden");
        container.innerHTML = data.map(ticket => renderTicketCard(ticket)).join("");
    } catch (err) {
        console.error(err);
        loader.classList.add("hidden");
        container.classList.remove("hidden");
        container.innerHTML = `<p class="text-red-400 col-span-full text-center">Failed to load tickets.</p>`;
    }
}

function renderTicketCard(ticket) {
    const event = ticket.event || { title: "Unknown Event", date: new Date().toISOString() };
    const date = new Date(event.date);
    const dateStr = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    // Status color
    let statusColor = "text-green-400 bg-green-400/10";
    if (ticket.status === "used") statusColor = "text-gray-400 bg-gray-400/10";
    if (ticket.status === "cancelled") statusColor = "text-red-400 bg-red-400/10";

    return `
    <div class="glass rounded-2xl border border-white/10 overflow-hidden hover:border-blue-500/30 transition-all group flex flex-col">
        <div class="p-6 flex-grow">
            <div class="flex justify-between items-start mb-4">
                <div class="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                    ${ticket.ticket_type || "General Admission"}
                </div>
                <span class="${statusColor} px-2 py-1 rounded-md text-xs font-medium uppercase">
                    ${ticket.status}
                </span>
            </div>
            
            <h3 class="text-xl font-bold text-white mb-2 leading-tight">${event.title}</h3>
            
            <div class="space-y-2 mt-4">
                <div class="flex items-center text-sm text-gray-400 gap-2">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span>${dateStr} at ${timeStr}</span>
                </div>
                <div class="flex items-center text-sm text-gray-400 gap-2">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span>${event.location || "TBA"}</span>
                </div>
            </div>
        </div>
        
        <div class="p-4 bg-white/5 border-t border-white/5">
            <a href="/tickets/${ticket.id}/" class="flex items-center justify-center w-full py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors gap-2 text-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 17h4.01M16 3h2.138a2 2 0 011.887 1.341l.342 1a2 2 0 01-1.889 2.659H17.5M16 11h2.138a2 2 0 011.887 1.341l.342 1a2 2 0 01-1.889 2.659H17.5M10 20v-6h4v6m5-10h3m-6 0h6m-9-4H8m12 0h-2.5M8 6H4a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1"></path></svg>
                View QR Code
            </a>
        </div>
    </div>
    `;
}
