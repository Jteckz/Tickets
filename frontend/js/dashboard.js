async function loadProviderDashboard() {
  protectPage(["provider"]);
  const data = await apiGet("/dashboard/provider/");
  document.getElementById("total-events").innerText = data.total_events;
  document.getElementById("tickets-issued").innerText = data.tickets_issued;
  document.getElementById("tickets-used").innerText = data.tickets_used;
}

async function loadStaffDashboard() {
  protectPage(["staff"]);
  const data = await apiGet("/dashboard/staff/");
  document.getElementById("total-tickets").innerText = data.total_tickets;
  document.getElementById("used").innerText = data.used;
  document.getElementById("unused").innerText = data.unused;
}

async function loadAdminDashboard() {
  protectPage(["admin"]);
  const data = await apiGet("/dashboard/admin/");
  document.getElementById("users").innerText = data.users;
  document.getElementById("events").innerText = data.events;
  document.getElementById("tickets").innerText = data.tickets;
}

async function verifyTicket() {
  const ticket_id = document.getElementById("ticket_id").value;
  const res = await apiPost("/tickets/verify/", { ticket_id });
  alert("Verified!");
}
