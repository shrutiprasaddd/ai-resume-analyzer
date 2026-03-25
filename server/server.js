require("dotenv").config();
require("./db");

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const axios = require("axios");
const path = require("path");

const authRoutes = require("./routes/auth");
const Analysis = require("./models/Analysis");
const auth = require("./middleware/auth");

const app = express();

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());

// ✅ AUTH ROUTES
app.use("/api/auth", authRoutes);

// ✅ FILE UPLOAD
const upload = multer({ dest: "uploads/" });

// ✅ ANALYZE ROUTE (SAVE TO DB)
app.post("/analyze", auth, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const role = req.body.role || "Software Developer";

    const prompt = `
You are an expert AI Resume Analyzer.

Analyze the resume for the role: "${role}"

Return STRICT JSON ONLY:

{
  "score": number,
  "summary": "short professional summary",
  "missing_skills": ["skill1"],
  "suggestions": ["suggestion1"]
}

Resume:
${pdfData.text}
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    let aiText = response.data.choices[0].message.content;

    aiText = aiText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(aiText);
    } catch {
      parsed = {
        score: 40,
        summary: "AI parsing failed",
        missing_skills: ["Could not extract"],
        suggestions: ["Try again"],
      };
    }

    // ✅ SAVE TO DATABASE
    await Analysis.create({
      userId: req.user.id,
      role,
      score: parsed.score,
      missing_skills: parsed.missing_skills,
      suggestions: parsed.suggestions,
      summary: parsed.summary,
    });

    res.json(parsed);
  } catch (err) {
    console.log("SERVER ERROR:", err.message);
    res.status(500).json({ error: "Error analyzing resume" });
  }
});

// ✅ HISTORY API
app.get("/api/history", auth, async (req, res) => {
  try {
    const data = await Analysis.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(data);
  } catch (err) {
    res.status(500).send("Error fetching history");
  }
});

// ✅ SERVE FRONTEND
app.use(express.static(path.join(__dirname, "../client/build")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// ✅ START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
