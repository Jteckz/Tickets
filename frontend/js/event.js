async function loadEvents() {
  const events = await apiGet("/events/", false);
  const container = document.getElementById("events");
  container.innerHTML = "";

  events.forEach(e => {
    const sold = e.total_tickets - e.tickets_available;
    const percent = e.total_tickets
      ? Math.round((sold / e.total_tickets) * 100)
      : 0;

    container.innerHTML += `
      <div class="card event-card">
        ${e.is_hot ? `<div class="badge">🔥 Hot</div>` : ""}
        <h3>${e.title}</h3>
        <div class="event-meta">${e.venue} • ${new Date(e.date).toLocaleString()}</div>
        <p>${e.description || "No description"}</p>
        <div class="progress"><span style="width:${percent}%"></span></div>
        <p><strong>$${e.ticket_price}</strong> • ${e.tickets_available} left</p>
        <button class="btn full" onclick="viewEvent(${e.id})">View Event</button>
      </div>
    `;
  });
}

function viewEvent(id) {
  window.location.href = `event-detail.html?id=${id}`;
}

async function loadEventDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const e = await apiGet(`/events/${id}/`, false);

  document.getElementById("title").innerText = e.title;
  document.getElementById("meta").innerText = `${e.venue} • ${new Date(e.date).toLocaleString()}`;
  document.getElementById("desc").innerText = e.description || "No description";
  document.getElementById("price").innerText = `$${e.ticket_price}`;
  document.getElementById("available").innerText = `${e.tickets_available} tickets remaining`;
}

async function bookTicket() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const ticket = await apiPost(`/tickets/book/${id}/`, {});
  window.location.href = `ticket-detail.html?id=${ticket.id}`;
}
