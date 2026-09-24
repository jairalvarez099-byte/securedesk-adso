import { useCallback, useEffect, useState } from "react";

import Login from "./pages/Login.jsx";
import {
  activateUser,
  createIncident,
  deactivateUser,
  getAdminStats,
  getProfile,
  listIncidents,
} from "./services/api.js";
import "./App.css";

const EMPTY_INCIDENT = {
  title: "",
  description: "",
  severity: "LOW",
  reporterEmail: "",
  containsPersonal: false,
};

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [form, setForm] = useState(EMPTY_INCIDENT);
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");

  const loadIncidents = useCallback(async () => {
    try {
      const data = await listIncidents(token);
      setIncidents(data.incidents);
    } catch (error) {
      setMessage(error.message);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    getProfile(token)
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      });
  }, [token]);

  useEffect(() => {
    if (token && user) loadIncidents();
  }, [token, user, loadIncidents]);

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setAdminStats(null);
    setIncidents([]);
    setMessage("");
  }

  async function loadAdminStats() {
    setMessage("");

    try {
      setAdminStats(await getAdminStats(token));
    } catch (error) {
      setMessage(`${error.status ?? ""} ${error.message}`.trim());
    }
  }

  async function handleCreateIncident(event) {
    event.preventDefault();
    setMessage("");

    try {
      await createIncident(token, form);
      setForm(EMPTY_INCIDENT);
      setMessage("Incidente registrado correctamente (201 Created)");
      await loadIncidents();
    } catch (error) {
      setMessage(`${error.status ?? ""} ${error.message}`.trim());
    }
  }

  async function handleUserState(action) {
    setMessage("");

    try {
      const data = await action(token, userId);
      setMessage(`${data.message}: ${data.user.email}`);
    } catch (error) {
      setMessage(`${error.status ?? ""} ${error.message}`.trim());
    }
  }

  if (!token) return <Login onLogin={setToken} />;

  return (
    <main className="panel">
      <header className="topbar">
        <h1>SecureDesk ADSO</h1>
        <button type="button" onClick={handleLogout}>
          Cerrar sesion
        </button>
      </header>

      <p className="subtitle">
        Sesion activa: {user?.email} - Rol: {user?.role}
      </p>

      {message && <p className="message">{message}</p>}

      <section>
        <h2>Panel administrativo</h2>
        {user?.role === "ADMIN" ? (
          <>
            <button type="button" onClick={loadAdminStats}>
              Consultar estadisticas admin
            </button>
            {adminStats && <pre>{JSON.stringify(adminStats, null, 2)}</pre>}

            <div className="stack inline">
              <input
                type="number"
                min="1"
                placeholder="ID de usuario"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
              />
              <button
                type="button"
                onClick={() => handleUserState(deactivateUser)}
              >
                Desactivar
              </button>
              <button
                type="button"
                onClick={() => handleUserState(activateUser)}
              >
                Activar
              </button>
            </div>
          </>
        ) : (
          <p>Tu rol no tiene acceso a estadisticas administrativas.</p>
        )}
      </section>

      <section>
        <h2>Registrar incidente</h2>
        <form onSubmit={handleCreateIncident} className="stack">
          <input
            placeholder="Titulo"
            value={form.title}
            onChange={(event) =>
              setForm({ ...form, title: event.target.value })
            }
          />
          <textarea
            placeholder="Descripcion"
            rows="3"
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
          />
          <select
            value={form.severity}
            onChange={(event) =>
              setForm({ ...form, severity: event.target.value })
            }
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
          <input
            type="email"
            placeholder="Correo del reportante"
            value={form.reporterEmail}
            onChange={(event) =>
              setForm({ ...form, reporterEmail: event.target.value })
            }
          />
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.containsPersonal}
              onChange={(event) =>
                setForm({ ...form, containsPersonal: event.target.checked })
              }
            />
            Contiene datos personales
          </label>
          <button type="submit">Crear incidente</button>
        </form>
      </section>

      <section>
        <h2>Ultimos incidentes</h2>
        {incidents.length === 0 ? (
          <p>Sin incidentes registrados.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Titulo</th>
                <th>Severidad</th>
                <th>Reportante</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id}>
                  <td>{incident.id}</td>
                  <td>{incident.title}</td>
                  <td>{incident.severity}</td>
                  <td>{incident.reporterEmail}</td>
                  <td>{new Date(incident.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

export default App;
