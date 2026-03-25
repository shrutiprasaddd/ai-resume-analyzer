import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard({ token }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios
      .get("/api/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setHistory(res.data))
      .catch((err) => console.log(err));
  }, [token]);

  return (
    <div className="card">
      <h2>📊 Dashboard</h2>

      {history.length === 0 ? (
        <p>No analysis yet. Upload a resume 🚀</p>
      ) : (
        history.map((item, index) => (
          <div key={index} className="result-block">
            <h3>🎯 Role: {item.role}</h3>

            <p>
              <strong>⭐ Score:</strong> {item.score}/100
            </p>

            <p>
              <strong>🧠 Summary:</strong> {item.summary}
            </p>

            <div>
              <strong>❌ Missing Skills:</strong>
              <ul>
                {item.missing_skills?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div>
              <strong>💡 Suggestions:</strong>
              <ul>
                {item.suggestions?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default Dashboard;
