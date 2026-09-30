import { useEffect, useState } from "react";
import Login from "./pages/Login.jsx";
import { apiFetch } from "./services/api.js";

const cell = { borderBottom: "1px solid #e2e8f0", padding: "0.5rem", textAlign: "left" };

function App() {
  const [user, setUser] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    if (!token) return;
    apiFetch("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => setUser(d.user))
      .catch(() => logout());

    // Todos los roles autenticados pueden listar incidentes; el backend decide
    // si el correo de quien reporta llega completo (ADMIN) o enmascarado.
    apiFetch("/incidents", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : { incidents: [] }))
      .then((d) => setIncidents(d.incidents));
  }, [token]);

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setAdminStats(null);
    setIncidents([]);
  }

  async function loadAdminStats() {
    const response = await apiFetch("/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setAdminStats(data);
  }

  if (!token) return <Login onLogin={setToken} />;
  return (
    <div>
      <h1>SecureDesk ADSO</h1>
      <p>Sesion activa: {user?.email} - Rol: {user?.role}</p>
      <button onClick={logout}>Cerrar sesion</button>
      {user?.role === "ADMIN"
        ? <button onClick={loadAdminStats}>Consultar estadisticas admin</button>
        : <p>Tu rol no tiene acceso a estadisticas administrativas.</p>}
      {adminStats && <pre>{JSON.stringify(adminStats, null, 2)}</pre>}

      <h2>Incidentes recientes</h2>
      <p>
        {user?.role === "ADMIN"
          ? "Como ADMIN ves el correo completo de quien reporta."
          : "Tu rol ve el correo de quien reporta enmascarado."}
      </p>
      {incidents.length === 0 ? (
        <p>No hay incidentes registrados.</p>
      ) : (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={cell}>Titulo</th>
              <th style={cell}>Severidad</th>
              <th style={cell}>Reportado por</th>
              <th style={cell}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id}>
                <td style={cell}>{incident.title}</td>
                <td style={cell}>{incident.severity}</td>
                <td style={cell}>{incident.reporterEmail}</td>
                <td style={cell}>{new Date(incident.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
