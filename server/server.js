require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const axios = require("axios");
const path = require("path");

const authRoutes = require("./routes/auth");
const auth = require("./middleware/auth");

const app = express();

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());

// ✅ DB CONNECT
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

// ✅ AUTH ROUTES
app.use("/api/auth", authRoutes);

// ✅ FILE UPLOAD
const upload = multer({ dest: "uploads/" });

// ✅ ANALYZE ROUTE (FIXED COMPLETELY)
app.post("/analyze", auth, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const role = req.body.role || "Software Developer";

    // 🔥 PERFECT PROMPT
    const prompt = `
You are an expert AI Resume Analyzer.

Analyze the resume for the role: "${role}"

Return STRICT JSON ONLY (no text outside JSON):

{
  "score": number,
  "summary": "short professional summary",
  "missing_skills": ["skill1", "skill2"],
  "suggestions": ["suggestion1", "suggestion2"]
}

Rules:
- Score MUST reflect match with role
- If role mismatch → give LOW score
- NEVER return empty fields
- Always give meaningful suggestions

Resume:
${pdfData.text}
`;

    // 🔥 API CALL
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

    console.log("AI RAW:", aiText); // 🔍 DEBUG

    // 🔥 CLEAN RESPONSE
    aiText = aiText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(aiText);
    } catch (err) {
      console.log("❌ JSON parse failed");

      parsed = {
        score: 40,
        summary: "AI parsing failed",
        missing_skills: ["Could not extract"],
        suggestions: ["Try again with better resume"],
      };
    }

    res.json(parsed);
  } catch (err) {
    console.log("SERVER ERROR:", err.message);
    res.status(500).json({ error: "Error analyzing resume" });
  }
});

// ✅ SERVE FRONTEND (IMPORTANT ORDER)
app.use(express.static(path.join(__dirname, "../client/build")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// ✅ START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
