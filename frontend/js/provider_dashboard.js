async function loadProviderDashboard() {
  requireAuth();

  // Check role? auth.js routeByRole helps, but here we enforce
  const user = getUser();
  if (user.role !== 'provider') {
    window.location.href = '/dashboard/'; // Kick out
    return;
  }

  const loader = document.getElementById("loader");
  const container = document.getElementById("stats-container");

  try {
    const data = await apiGet("/dashboard/provider/data/");

    loader.classList.add("hidden");
    container.classList.remove("hidden");

    document.getElementById("total-events").textContent = data.events_count || 0;
    document.getElementById("tickets-sold").textContent = data.tickets_sold || 0;
    document.getElementById("revenue").textContent = `$${data.revenue || 0}`;

  } catch (err) {
    console.error(err);
    loader.classList.add("hidden");
    // alert("Failed to load dashboard data");
    container.classList.remove("hidden"); // Show zeros
  }
}
