import { useState } from "react";

import { login as loginRequest } from "../services/api.js";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      const data = await loginRequest(email, password);

      localStorage.setItem("token", data.token);
      setMessage(`Bienvenido ${data.user.name} - Rol: ${data.user.role}`);
      onLogin?.(data.token);
    } catch (error) {
      setMessage(error.message || "Error de autenticacion");
    }
  }

  return (
    <main className="panel">
      <h1>SecureDesk ADSO</h1>
      <p className="subtitle">Inicio de sesion</p>

      <form onSubmit={handleSubmit} className="stack">
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          type="password"
          placeholder="Contrasena"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button type="submit">Ingresar</button>
      </form>

      {message && <p className="message">{message}</p>}
    </main>
  );
}

export default Login;
