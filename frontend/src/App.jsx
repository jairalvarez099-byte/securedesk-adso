import { useEffect, useState } from "react";
import Login from "./pages/Login.jsx";
import { apiFetch } from "./services/api.js";

function App() {
  const [user, setUser] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    if (!token) return;
    apiFetch("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => setUser(d.user))
      .catch(() => logout());
  }, [token]);

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setAdminStats(null);
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
    </div>
  );
}

export default App;
