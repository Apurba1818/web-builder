// routes/generate.js
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { connectDB, getDB } = require("../db");

const router = express.Router();

function extractCode(response) {
  const match = response.match(/```(?:\w+)?\n?([\s\S]*?)```/);
  return match ? match[1].trim() : response.trim();
}

router.post("/", async (req, res) => {
  const { prompt, userId, userEmail } = req.body;

  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server misconfigured: missing API key" });
  }

  const text_prompt = `You are a frontend developer. Generate a single complete HTML file.

TECH: Tailwind CDN, GSAP CDN, Google Fonts
SECTIONS: Navbar, Hero, Features (3 cards), Footer ("Made with WebBuilder")  
DESIGN: Dark mode toggle, responsive, glassmorphism cards
ANIMATIONS: Simple GSAP fade-in on load only
OUTPUT: Single code block only. No explanation.

Topic: ${prompt.trim()}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const result = await genAI
      .getGenerativeModel({ model: "gemini-2.5-flash-lite" })
      .generateContent(text_prompt);

    const raw = result.response.text();
    const code = extractCode(raw);

    // Save search to MongoDB (non-fatal if it fails)
    if (userId) {
      try {
        await connectDB();
        const db = getDB();
        await db.collection("searches").insertOne({
          userId,
          userEmail: userEmail || "",
          prompt: prompt.trim(),
          createdAt: new Date(),
        });
      } catch (dbErr) {
        console.error("DB save failed (non-fatal):", dbErr.message);
      }
    }

    return res.status(200).json({ code });
  } catch (err) {
    console.error("Gemini error:", err.message);
    return res.status(500).json({ error: "AI generation failed. Please try again." });
  }
});

module.exports = router;
