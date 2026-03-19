const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// File upload setup
const upload = multer({ dest: "uploads/" });

// Test route
app.get("/", (req, res) => {
  res.send("Server running");
});

// MAIN ANALYZE ROUTE
app.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Read PDF
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const jobRole = req.body.role || "Software Developer";

    // 🔥 STRONG PROMPT (forces JSON)
    const prompt = `
You are a resume analyzer AI.

Analyze the resume for the role of ${jobRole}.

IMPORTANT:
- Return ONLY valid JSON
- Do NOT add explanation
- Do NOT add text outside JSON

Format EXACTLY like this:

{
  "score": 85,
  "missing_skills": ["skill1", "skill2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "summary": "improved summary"
}

Resume:
${pdfData.text}
`;

    // Call OpenRouter
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
      }
    );

    let aiText = response.data.choices[0].message.content;

    // 🔥 CLEAN AI RESPONSE (remove ```json ``` issues)
    aiText = aiText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(aiText);
    } catch (err) {
      console.log("❌ JSON parse failed");
      console.log("RAW AI RESPONSE:", aiText);
      return res.json({ result: aiText }); // fallback
    }

    res.json(parsed);
  } catch (err) {
    console.log("SERVER ERROR:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Start server
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
