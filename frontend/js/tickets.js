async function loadMyTickets() {
  protectPage(["customer"]);
  const tickets = await apiGet("/tickets/my/");
  const box = document.getElementById("tickets");
  box.innerHTML = "";

  tickets.forEach(t => {
    box.innerHTML += `
      <div class="card">
        <h3>${t.event.title}</h3>
        <p>Status: ${t.status}</p>
        <button class="btn" onclick="viewTicket(${t.id})">View Ticket</button>
      </div>
    `;
  });
}

function viewTicket(id) {
  window.location.href = `ticket-detail.html?id=${id}`;
}

async function loadTicketDetail() {
  protectPage(["customer"]);
  const id = new URLSearchParams(window.location.search).get("id");
  const ticket = await apiGet(`/tickets/my/${id}/`);

  document.getElementById("event").innerText = ticket.event.title;
  document.getElementById("status").innerText = ticket.status;
  document.getElementById("qr").src = ticket.qr_code || "";
}
