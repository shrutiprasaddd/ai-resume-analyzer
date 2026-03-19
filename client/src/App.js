import { useState } from "react";
import axios from "axios";

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

      const res = await axios.post(
        "https://ai-resume-analyzer-qyi6.onrender.com",
        formData
      );

      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Something went wrong 😢");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "sans-serif",
        maxWidth: "900px",
        margin: "auto",
        background: "#f4f6f9",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>🚀 AI Resume Analyzer</h1>

      {/* Upload Section */}
      <div style={{ marginBottom: "20px" }}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      </div>

      {/* Role Input */}
      <input
        type="text"
        placeholder="Enter Job Role (e.g. Frontend Developer)"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={{
          padding: "10px",
          width: "100%",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      <br />
      <br />

      {/* Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: "12px 20px",
          borderRadius: "8px",
          border: "none",
          background: loading ? "#999" : "#007bff",
          color: "white",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        {loading ? "⏳ Analyzing..." : "Analyze"}
      </button>

      {/* Result Section */}
      {data && (
        <div
          style={{
            marginTop: "30px",
            padding: "25px",
            borderRadius: "16px",
            background: "#ffffff",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <h2>📊 Analysis Result</h2>

          {/* Score */}
          <h3>⭐ Score: {data?.score ? `${data.score}/100` : "N/A"}</h3>

          {/* Missing Skills */}
          <h3>❌ Missing Skills</h3>
          <ul>
            {data.missing_skills?.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>

          {/* Suggestions */}
          <h3>💡 Suggestions</h3>
          <ul>
            {data.suggestions?.map((s, index) => (
              <li key={index}>{s}</li>
            ))}
          </ul>

          {/* Summary */}
          <h3>📄 Improved Summary</h3>
          <p>{data.summary}</p>
        </div>
      )}
    </div>
  );
}

export default App;
