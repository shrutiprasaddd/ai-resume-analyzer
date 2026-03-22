import { useState } from "react";
import axios from "axios";

function Register({ setPage }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    try {
      await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });

      alert("✅ Registered successfully! Please login.");

      setPage("login"); // ✅ auto switch
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="card">
      <h2>Register</h2>

      <input placeholder="Name" onChange={(e) => setName(e.target.value)} />

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={register}>Register</button>

      <p className="auth-switch">
        Already have an account?{" "}
        <span onClick={() => setPage("login")}>Login</span>
      </p>
    </div>
  );
}

export default Register;
