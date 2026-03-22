import { useState, useEffect } from "react";
import axios from "axios";

function Login({ setToken, setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (localStorage.getItem("token")) {
      setPage("analyze");
    }
  }, []);

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data); // 👈 ADD THIS

      if (!res.data.token) {
        alert("No token received from server");
        return;
      }

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setPage("analyze");
    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data || err.message); // 👈 ADD THIS
      alert("Login failed");
    }
  };

  return (
    <div className="card">
      <h2>Login</h2>

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={login} disabled={!email || !password}>
        Login
      </button>

      {/* 👇 NOW THIS WILL SHOW */}
      <p className="auth-switch">
        Don’t have an account?{" "}
        <span onClick={() => setPage("register")}>Register</span>
      </p>
    </div>
  );
}

export default Login;
