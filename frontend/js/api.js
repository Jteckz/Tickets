function getToken() {
  return localStorage.getItem("access");
}

function getHeaders(auth = true) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (auth && getToken()) {
    headers["Authorization"] = `Bearer ${getToken()}`;
  }
  return headers;
}

async function apiGet(url, auth = true) {
  const res = await fetch(API_BASE + url, {
    headers: getHeaders(auth),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

async function apiPost(url, data = {}, auth = true) {
  const res = await fetch(API_BASE + url, {
    method: "POST",
    headers: getHeaders(auth),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}
