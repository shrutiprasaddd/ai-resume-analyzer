import { useState } from "react";
import axios from "axios";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [page, setPage] = useState(
    localStorage.getItem("token") ? "analyze" : "login",
  );

  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setPage("login");
    setData(null);
  };

  const handleSubmit = async () => {
    if (!file || !role) {
      alert("Please upload resume and enter job role");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("resume", file);
      formData.append("role", role);

      const res = await axios.post("/analyze", formData, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      setData(res.data);

      // ✅ UX IMPROVEMENT: reset inputs after analysis
      setFile(null);
      setRole("");
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong 😢");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <h2>🚀 AI Resume Analyzer</h2>

        <div className="nav">
          {!token && page !== "login" && (
            <button onClick={() => setPage("login")}>Login</button>
          )}

          {!token && page !== "register" && (
            <button onClick={() => setPage("register")}>Register</button>
          )}

          {token && (
            <>
              <button
                onClick={() => {
                  setPage("analyze");
                  setData(null);
                  setFile(null);
                  setRole("");
                }}
              >
                Analyze
              </button>

              <button onClick={() => setPage("dashboard")}>Dashboard</button>

              <button onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </header>

      {/* MAIN */}
      <div className="app">
        {/* AUTH */}
        {!token && page === "login" && (
          <Login setToken={setToken} setPage={setPage} />
        )}

        {!token && page === "register" && <Register setPage={setPage} />}

        {/* ANALYZE */}
        {token && page === "analyze" && (
          <>
            <div className="card input-card">
              <label className="file-upload">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <span>{file ? `✅ ${file.name}` : "📄 Upload Resume"}</span>
              </label>

              <input
                type="text"
                placeholder="Enter Job Role (e.g. DevOps Engineer)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />

              <button
                onClick={handleSubmit}
                disabled={loading || !file || !role} // ✅ prevent empty submit
              >
                {loading ? "⏳ Analyzing..." : "Analyze Resume"}
              </button>
            </div>

            {/* RESULT */}
            {data && (
              <div className="card result-card">
                <h2>📊 Resume Analysis</h2>

                <div className="result-block">
                  <h3>⭐ Score</h3>
                  <p className="score">{data.score ?? "0"}/100</p>
                </div>

                <div className="result-block">
                  <h3>🧠 Summary</h3>
                  <p>{data.summary || "No summary generated"}</p>
                </div>

                <div className="result-block">
                  <h3>❌ Missing Skills</h3>
                  {data.missing_skills?.length ? (
                    <ul>
                      {data.missing_skills.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>None 🎉</p>
                  )}
                </div>

                <div className="result-block">
                  <h3>💡 Suggestions</h3>
                  {data.suggestions?.length ? (
                    <ul>
                      {data.suggestions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>Looks good 👍</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* DASHBOARD */}
        {token && page === "dashboard" && <Dashboard data={data} />}
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2026 AI Resume Analyzer</p>
      </footer>
    </>
  );
}

export default App;
