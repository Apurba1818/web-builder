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

const text_prompt = `You are an Expert Systems Architect specializing in autonomous, high-performance, single-file web applications.
Generate a fully functional, production-ready application inside a SINGLE HTML file containing all necessary CSS and JavaScript.

OUTPUT FORMAT (STRICT):
Return ONLY one complete HTML file enclosed in a single markdown code block starting with \`\`\`html. 
Provide absolutely zero markdown formatting outside the code block. Provide zero conversational explanations.

TECHNICAL CONSTRAINTS:
Logic: Use strictly Vanilla JavaScript (ES6+). Zero external dependencies for logic, state, or rendering. No unsafe eval().
Styling: Use Tailwind CSS via CDN. Implement a minimalist, modern, mobile-first design system. Include a functional Dark/Light mode toggle that persists user preference. Use the Inter font.
Content: Generate a fully working tool based on the topic. Do not output placeholder text (Lorem Ipsum) or dummy functions.

ARCHITECTURAL MANDATES (NON-NEGOTIABLE):
Inside the <script> tag, you MUST explicitly structure your code using a strict Model-View-Controller (MVC) separation of concerns:

A. THE DATA LAYER (MOCK ASYNC API):
- All data persistence MUST utilize the browser's localStorage.
- You MUST encapsulate every localStorage operation inside a mock asynchronous API module.
- Create distinct, comprehensive functions for all CRUD operations (Create, Read, Update, Delete) required by the application topic.
- Every single data function MUST return a Promise (e.g., return new Promise((resolve, reject) => {... })) to accurately simulate network latency and backend database calls. Include error handling for storage limits.

B. STATE MANAGEMENT:
- Maintain a single, centralized JavaScript state object.
- Application logic MUST NEVER read data directly from the DOM.
- UI event listeners must only dispatch actions that update the state object and subsequently call the Mock Async API.

C. UI RENDERING:
- Create dedicated rendering functions that strictly listen to state changes and update the DOM accordingly.
- Ensure all complex interactions, filtering, modal behaviors, and edge cases are fully implemented and functional.

TOPIC / APPLICATION SPECIFICATION:
${prompt.trim()}`;

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
