const translations = {
  en: {
    welcome: "Discover unforgettable experiences, secure instant tickets, and breeze through entry with our next-gen QR technology.",
    login: "Login",
    register: "Register",
    login_subtitle: "Sign in to continue to TicketFlow",
    login_btn: "Sign In",

    // Navbar
    dashboard: "Dashboard",
    events: "Events",
    my_tickets: "My Tickets",
    profile: "Profile",
    logout: "Logout",
    provider_panel: "Provider Panel",
    staff_panel: "Staff Panel",
    admin_panel: "Admin Panel",

    // Customer Dashboard
    discover_events: "Discover Events",
    discover_sub: "Explore and book the best events near you",
    search_events: "Search events...",

    // Provider
    overview: "Dashboard Overview",
    overview_sub: "Real-time statistics for your events",
    active_events: "Active Events",
    tickets_sold: "Tickets Sold",
    revenue: "Revenue",
    quick_actions: "Quick Actions",
    create_new_event: "Create New Event",
    manage_events: "Manage Events",

    // Staff
    ticket_verification: "Ticket Verification",
    scan_instruction: "Scan or enter ticket code to validate entry.",
    verify_ticket: "Verify Ticket",
    check_validity: "Check Validity",

    // Admin
    system_metrics: "System Metrics",
    metrics_sub: "Platform-wide statistics and overview.",
    total_users: "Total Users",
    total_events: "Total Events",
    total_tickets: "Total Tickets",
  },
  sw: {
    welcome: "Gundua matukio yasiyosahaulika, pata tiketi papo hapo, na uingie kwa urahisi ukitumia teknolojia yetu ya kisasa ya QR.",
    login: "Ingia",
    register: "Jisajili",
    login_subtitle: "Ingia ili kuendelea na TicketFlow",
    login_btn: "Ingia",

    // Navbar
    dashboard: "Dashibodi",
    events: "Matukio",
    my_tickets: "Tiketi Zangu",
    profile: "Wasifu",
    logout: "Ondoka",
    provider_panel: "Jopo la Mtoa Huduma",
    staff_panel: "Jopo la Wafanyakazi",
    admin_panel: "Jopo la Utawala",

    // Customer Dashboard
    discover_events: "Gundua Matukio",
    discover_sub: "Chunguza na uweke nafasi ya matukio bora karibu nawe",
    search_events: "Tafuta matukio...",

    // Provider
    overview: "Muhtasari wa Dashibodi",
    overview_sub: "Takwimu za muda halisi za matukio yako",
    active_events: "Matukio yanayoendelea",
    tickets_sold: "Tiketi Zilizouzwa",
    revenue: "Mapato",
    quick_actions: "Hatua za Haraka",
    create_new_event: "Unda Tukio Jipya",
    manage_events: "Dhibiti Matukio",

    // Staff
    ticket_verification: "Uhakiki wa Tiketi",
    scan_instruction: "Changanua au ingiza nambari ya tiketi ili kudhibitisha.",
    verify_ticket: "Hakiki Tiketi",
    check_validity: "Angalia Uhai",

    // Admin
    system_metrics: "Vipimo vya Mfumo",
    metrics_sub: "Takwimu za jukwaa zima na muhtasari.",
    total_users: "Jumla ya Watumiaji",
    total_events: "Jumla ya Matukio",
    total_tickets: "Jumla ya Tiketi",
  }
};

function setLanguage(lang) {
  localStorage.setItem("lang", lang);
  applyLanguage();
}

function loadLanguage() {
  applyLanguage();
}

function applyLanguage() {
  const lang = localStorage.getItem("lang") || "en";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    // If input placeholder
    if (el.tagName === 'INPUT' && el.placeholder) {
      // We need a mapping for placeholder? 
      // Or simpler: el.placeholder = translations[lang][el.dataset.i18n_placeholder];
      // For MVP, just innerText
    }
    el.innerText = translations[lang][el.dataset.i18n] || el.innerText;
  });
}
