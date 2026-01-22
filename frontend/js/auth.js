async function login(username, password) {
  const data = await apiPost("/auth/login/", { username, password }, false);
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);

  const profile = await apiGet("/profile/");
  localStorage.setItem("user", JSON.stringify(profile));

  routeByRole(profile.role);
}

async function register(payload) {
  await apiPost("/auth/register/", payload, false);
  await login(payload.username, payload.password);
}

function logout() {
  localStorage.clear();
  window.location.href = "/login/";
}

function getUser() {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = "/login/";
  }
}

function routeByRole(role) {
  if (role === "provider") window.location.href = "/provider/dashboard/";
  else if (role === "staff") window.location.href = "/staff/dashboard/";
  else if (role === "admin") window.location.href = "/admin/dashboard/";
  else window.location.href = "/events/"; // customer
}
