const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function request(path, { token, ...options } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Error al consultar el backend");
    error.status = response.status;
    error.details = data.errors;
    throw error;
  }

  return data;
}

export function checkHealth() {
  return request("/health");
}

export function login(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getProfile(token) {
  return request("/auth/me", { token });
}

export function getAdminStats(token) {
  return request("/admin/stats", { token });
}

export function deactivateUser(token, id) {
  return request(`/admin/users/${id}/deactivate`, { method: "PATCH", token });
}

export function activateUser(token, id) {
  return request(`/admin/users/${id}/activate`, { method: "PATCH", token });
}

export function listIncidents(token) {
  return request("/incidents", { token });
}

export function createIncident(token, incident) {
  return request("/incidents", {
    method: "POST",
    token,
    body: JSON.stringify(incident),
  });
}
