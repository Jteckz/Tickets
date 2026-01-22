// Load dashboard stats and events
async function loadProviderDashboard() {
  try {
    const res = await fetch('/dashboard/provider/data/', {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    const data = await res.json();

    document.getElementById('total-events').textContent = data.total_events;
    document.getElementById('tickets-issued').textContent = data.tickets_issued;
    document.getElementById('tickets-used').textContent = data.tickets_used;

    renderEvents(data.events);
  } catch (err) {
    console.error(err);
    alert('Failed to load dashboard');
  }
}

// Render events list
function renderEvents(events) {
  const container = document.getElementById('events-container');
  container.innerHTML = '';
  events.forEach(ev => {
    const div = document.createElement('div');
    div.className = 'event-card card';
    div.innerHTML = `
      <h3>${ev.title}</h3>
      <p>${ev.description}</p>
      <p>Date: ${new Date(ev.date).toLocaleString()}</p>
      <p>Venue: ${ev.venue}</p>
      <p>Price: $${ev.ticket_price}</p>
      <p>Available: ${ev.tickets_available}/${ev.total_tickets}</p>
    `;
    container.appendChild(div);
  });
}

// Create a new event via API
async function createEvent() {
  const title = document.getElementById('event-title').value;
  const description = document.getElementById('event-description').value;
  const date = document.getElementById('event-date').value;
  const venue = document.getElementById('event-venue').value;
  const ticket_price = document.getElementById('event-ticket-price').value;
  const total_tickets = document.getElementById('event-total-tickets').value;

  if (!title || !date || !venue || !ticket_price || !total_tickets) {
    alert('Please fill all required fields!');
    return;
  }

  try {
    const res = await fetch('/api/events/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      credentials: 'include',
      body: JSON.stringify({
        title,
        description,
        date,
        venue,
        ticket_price,
        total_tickets
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      console.error(errData);
      throw new Error('Failed to create event');
    }

    const newEvent = await res.json();
    alert(`Event "${newEvent.title}" created successfully!`);

    // Clear form
    document.getElementById('event-title').value = '';
    document.getElementById('event-description').value = '';
    document.getElementById('event-date').value = '';
    document.getElementById('event-venue').value = '';
    document.getElementById('event-ticket-price').value = '';
    document.getElementById('event-total-tickets').value = '';

    // Reload dashboard
    loadProviderDashboard();
  } catch (err) {
    console.error(err);
    alert('Error creating event');
  }
}

// Helper function to get CSRF token from cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
