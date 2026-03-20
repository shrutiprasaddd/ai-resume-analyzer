import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

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

      const res = await axios.post("/analyze", formData);

      setData(res.data);
    } catch (err) {
      alert("Something went wrong 😢");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>🚀 AI Resume Analyzer</h1>

      <div className="card input-card">
        <label className="file-upload">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <span>{file ? `✅ ${file.name}` : "📄 Drag & Upload Resume"}</span>
        </label>

        <input
          type="text"
          placeholder="Enter Job Role (e.g. Frontend Developer)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "⏳ Analyzing..." : "Analyze"}
        </button>
      </div>

      {data && (
        <div className="card result-card">
          <h2>📊 Analysis Result</h2>

          {/* Score */}
          <div className="score-section">
            <h3>Score: {data.score || 0}/100</h3>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${data.score || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Missing Skills */}
          <div className="section">
            <h3>❌ Missing Skills</h3>
            {data?.missing_skills?.length ? (
              <ul>
                {data.missing_skills.map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>
            ) : (
              <p className="success">No major missing skills 🎉</p>
            )}
          </div>

          {/* Suggestions */}
          <div className="section">
            <h3>💡 Suggestions</h3>
            {data?.suggestions?.length ? (
              <ul>
                {data.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            ) : (
              <p className="success">Resume looks strong 💪</p>
            )}
          </div>

          {/* Summary */}
          <div className="section">
            <h3>📄 Improved Summary</h3>
            <p>{data.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
