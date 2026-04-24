// routes/generate.js
const express = require("express");
const Groq = require("groq-sdk");
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

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server misconfigured: missing API key" });
  }

const text_prompt = `Generate a fully functional single-file web application based on the topic.

OUTPUT FORMAT (STRICT):
Return ONLY one complete HTML file enclosed in a single markdown code block starting with \`\`\`html. Zero conversational explanations.

TECHNICAL CONSTRAINTS:
- Tech Stack: HTML5, Tailwind CSS via CDN, Vanilla JS (ES6+), Inter font.
- Architecture: Keep the code lightweight and minimal. Write direct, efficient functional logic without unnecessary boilerplate.
- Safety: Zero external dependencies besides Tailwind. NEVER use unsafe eval().
- UI/UX: Mobile-first responsive design. Include a functional dark/light mode toggle.
- Functionality: The app must work perfectly out of the box. Handle user inputs, state, and edge cases safely. Use localStorage only if the topic requires data persistence.

TOPIC: ${prompt.trim()}`;

  try {
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: text_prompt }],
      max_tokens: 8000,
      temperature: 0.7
    });

    const raw = completion.choices[0]?.message?.content || "";
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
    console.error("Groq error:", err.message);
    return res.status(500).json({ error: "AI generation failed. Please try again." });
  }
});

module.exports = router;
