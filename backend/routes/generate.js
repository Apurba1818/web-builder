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

  const text_prompt = `You are a frontend developer. Generate one complete HTML file.

OUTPUT: Return ONLY a single markdown code block. Nothing else.

CDN LINKS (use exactly):
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">

PAGE STRUCTURE (based on topic):
- Landing page → Navbar, Hero, 3 Feature Cards, Footer
- Dashboard/Admin → Sidebar, Stats Cards, Data Table
- Form page → Centered form card, inputs, submit button
- CRUD page → Table with Add/Edit/Delete buttons and modal

DESIGN:
- Dark bg: #0f0f0f | Light bg: #ffffff | Accent: #9333ea
- Font: Inter | Inputs: rounded-lg, purple focus border
- Cards: bg-white/5 border border-white/10 rounded-xl p-4
- Footer: "Made with WebBuilder"

JAVASCRIPT:
- Dark mode toggle with localStorage
- Hamburger menu for mobile
- Forms: validate → fetch() POST to "/api/submit" → show success/error in #message div
- Tables: fetch() GET "/api/data" on load → render rows
- Use this GSAP line only:
  gsap.from(".animate-in", {opacity:0, y:30, duration:0.6, stagger:0.15});

CONTENT: Write realistic content based on topic. No Lorem Ipsum.

TOPIC: ${prompt.trim()}

REMINDER: Single HTML code block only. No explanation.`;

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
