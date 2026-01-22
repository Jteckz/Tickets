async function loadStaffDashboard() {
  requireAuth();
  if (getUser().role !== 'staff') {
    window.location.href = '/dashboard/';
    return;
  }
}

async function verifyTicket() {
  const input = document.getElementById("ticket_id");
  const ticketId = input.value.trim();
  const btn = document.getElementById("verify-btn");
  const resultArea = document.getElementById("result-area");
  const resultCard = document.getElementById("result-card");
  const resultIcon = document.getElementById("result-icon");
  const resultTitle = document.getElementById("result-title");
  const resultMsg = document.getElementById("result-msg");
  const resultEvent = document.getElementById("result-event");
  const resultId = document.getElementById("result-id");

  if (!ticketId) {
    alert("Please enter a ticket ID.");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Verifying...";
  resultArea.classList.add("hidden");

  try {
    // Correct endpoint: POST /tickets/verify/ {ticket_id: ...}
    // Note: URL requires trailing slash usually in Django
    const data = await apiPost("/tickets/verify/", { ticket_id: ticketId }); // apiPost adds headers

    // Success (Valid Ticket)
    resultArea.classList.remove("hidden");

    // Update UI for Success
    resultCard.className = "glass p-6 rounded-2xl border border-green-500/30 bg-green-500/5 text-center";
    resultIcon.className = "inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-4";
    resultIcon.innerHTML = `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
    resultTitle.textContent = "Valid Ticket";
    resultTitle.className = "text-2xl font-bold text-green-400 mb-2";
    resultMsg.textContent = data.message || "Entry Authorized";

    resultEvent.textContent = data.event || "Unknown Event";
    resultId.textContent = `#${data.ticket_id}`;

    input.value = ""; // Clear input for next scan

  } catch (err) {
    // Error (Invalid/Used)
    resultArea.classList.remove("hidden");

    const errorMsg = err.error || err.detail || "Verification Failed";

    // Update UI for Error
    resultCard.className = "glass p-6 rounded-2xl border border-red-500/30 bg-red-500/5 text-center";
    resultIcon.className = "inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 text-red-400 mb-4";
    resultIcon.innerHTML = `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
    resultTitle.textContent = "Access Denied";
    resultTitle.className = "text-2xl font-bold text-red-400 mb-2";
    resultMsg.textContent = errorMsg;

    resultEvent.textContent = "N/A";
    resultId.textContent = `#${ticketId}`;
  } finally {
    btn.disabled = false;
    btn.textContent = "Check Validity";
  }
}
