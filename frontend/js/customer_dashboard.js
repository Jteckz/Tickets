// dashboard_customer.js

async function loadCustomerDashboard() {
  try {
    const res = await fetch("/api/events/", {
      method: "GET",
      headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
    });
    if (!res.ok) throw new Error("Failed to fetch events");
    const events = await res.json();

    const container = document.getElementById("events-container");
    container.innerHTML = "";

    events.forEach(ev => {
      const card = document.createElement("div");
      card.className = "event-card";
      card.innerHTML = `
        <h3>${ev.title}</h3>
        <p><strong>Date:</strong> ${new Date(ev.date).toLocaleString()}</p>
        <p><strong>Venue:</strong> ${ev.venue}</p>
        <p><strong>Price:</strong> $${ev.ticket_price.toFixed(2)}</p>
        <p><strong>Tickets Left:</strong> ${ev.tickets_available}</p>
        <button onclick="buyTicket(${ev.id})" class="btn">Buy Ticket</button>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.log(err);
    alert(err.message);
  }
}

async function buyTicket(eventId) {
  try {
    const res = await fetch(`/api/tickets/book/${eventId}/`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
    });
    if (!res.ok) throw new Error("Failed to book ticket");
    alert("Ticket booked successfully!");
    loadCustomerDashboard();
  } catch (err) {
    alert(err.message);
  }
}

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "login.html";
}
