async function loadAdminDashboard() {
    requireAuth();
    if (getUser().role !== 'admin') {
        window.location.href = '/dashboard/';
        return;
    }

    const loader = document.getElementById("loader");
    const container = document.getElementById("stats-container");

    try {
        // Fetch Events Count
        const events = await apiGet("/events/"); // Anyone can list events, admin too
        document.getElementById("total-events").textContent = events.length;

        // Fetch Users (If endpoint existed)
        // document.getElementById("total-users").textContent = "N/A";

        // Fetch Tickets (If endpoint existed)
        // document.getElementById("total-tickets").textContent = "N/A";

        // Since we are MVP and backend constraints prevent adding admin endpoints, we display N/A or mock.
        // User requirements said "View system stats only".
        // Providing best effort.
        document.getElementById("total-users").textContent = "-";
        document.getElementById("total-tickets").textContent = "-";

        loader.classList.add("hidden");
        container.classList.remove("hidden");

        // Try to be smart?
        // Maybe we can infer from something else? No.

    } catch (err) {
        console.error(err);
        loader.classList.add("hidden");
        container.classList.remove("hidden");
    }
}
