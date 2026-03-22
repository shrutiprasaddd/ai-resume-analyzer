function Dashboard({ data }) {
  if (!data) {
    return (
      <div className="card">
        <h2>📊 Dashboard</h2>
        <p>No analysis yet. Go to Analyze and upload a resume 🚀</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>📊 Dashboard</h2>

      <div className="result-block">
        <h3>⭐ Score</h3>
        <p className="score">{data.score}/100</p>
      </div>

      <div className="result-block">
        <h3>🧠 Summary</h3>
        <p>{data.summary}</p>
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
  );
}

export default Dashboard;
