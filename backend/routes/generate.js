// routes/generate.js
const express = require("express");
const Groq = require("groq-sdk");
const { connectDB, getDB } = require("../db");

const router = express.Router();

// Model can be changed from Render's Environment tab (GROQ_MODEL) without a code change.
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

function extractCode(response) {
  // Normal case: a complete ```html ... ``` block
  const match = response.match(/```(?:\w+)?\n?([\s\S]*?)```/);
  if (match) return match[1].trim();

  // Fallback: opening fence exists but the closing one is missing (truncated output)
  const open = response.match(/```(?:\w+)?\n?([\s\S]*)$/);
  if (open) return open[1].trim();

  return response.trim();
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

  const text_prompt = `You are a frontend developer. Generate a single complete HTML file.

OUTPUT:
- Return ONLY one markdown code block (no explanation).

TECH:
- Use Tailwind CDN
- Use GSAP CDN (only if needed)
- Use Inter font

STRUCTURE (adapt based on topic):
- Landing → Navbar, Hero, Features, Footer
- Dashboard → Sidebar, Cards, Table
- Form → Centered form with validation
- CRUD → Table + modal actions

DESIGN:
- Clean modern UI
- Dark/light mode toggle (localStorage)
- Responsive (mobile-first)
- Use Tailwind utility classes only

FUNCTIONALITY:
- Navbar toggle (mobile)
- Implement complete functional logic when required
- Handle edge cases and user input properly
- Use localStorage for data persistence if needed
- Use fetch() only if required by topic
- Avoid unnecessary animations
- Avoid unsafe eval()

ANIMATION (optional):
gsap.from(".animate-in", {opacity:0, y:30, duration:0.5});

CONTENT:
- Use realistic content based on the TOPIC:
${prompt.trim()} (no lorem ipsum)

TOPIC:
${prompt.trim()}

IMPORTANT:
- Keep code minimal, clean, and fast
- Avoid unnecessary complexity
- Single HTML file only`;

  try {
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: text_prompt }],
      max_completion_tokens: 8000,
      temperature: 0.7,
      reasoning_effort: "low", // GPT-OSS is a reasoning model; keeps it fast and leaves tokens for the HTML
    });

    const raw = completion.choices[0]?.message?.content || "";
    const code = extractCode(raw);

    if (!code) {
      console.error("Groq returned an empty response");
      return res.status(502).json({ error: "AI returned an empty response. Please try again." });
    }

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
    // err.status tells you quickly what went wrong:
    // 400 = bad model/parameter, 401 = bad API key, 404 = model not found, 429 = rate limit
    console.error("Groq error:", err.status, err.message);
    return res.status(500).json({ error: "AI generation failed. Please try again." });
  }
});

module.exports = router;






// // routes/generate.js
// const express = require("express");
// const Groq = require("groq-sdk");
// const { connectDB, getDB } = require("../db");

// const router = express.Router();

// function extractCode(response) {
//   const match = response.match(/```(?:\w+)?\n?([\s\S]*?)```/);
//   return match ? match[1].trim() : response.trim();
// }

// router.post("/", async (req, res) => {
//   const { prompt, userId, userEmail } = req.body;

//   if (!prompt || prompt.trim() === "") {
//     return res.status(400).json({ error: "Prompt is required" });
//   }

//   const apiKey = process.env.GROQ_API_KEY;
//   if (!apiKey) {
//     return res.status(500).json({ error: "Server misconfigured: missing API key" });
//   }

// const text_prompt = `You are a frontend developer. Generate a single complete HTML file.

// OUTPUT:
// - Return ONLY one markdown code block (no explanation).

// TECH:
// - Use Tailwind CDN
// - Use GSAP CDN (only if needed)
// - Use Inter font

// STRUCTURE (adapt based on topic):
// - Landing → Navbar, Hero, Features, Footer
// - Dashboard → Sidebar, Cards, Table
// - Form → Centered form with validation
// - CRUD → Table + modal actions

// DESIGN:
// - Clean modern UI
// - Dark/light mode toggle (localStorage)
// - Responsive (mobile-first)
// - Use Tailwind utility classes only

// FUNCTIONALITY:
// - Navbar toggle (mobile)
// - Implement complete functional logic when required
// - Handle edge cases and user input properly
// - Use localStorage for data persistence if needed
// - Use fetch() only if required by topic
// - Avoid unnecessary animations
// - Avoid unsafe eval()

// ANIMATION (optional):
// gsap.from(".animate-in", {opacity:0, y:30, duration:0.5});

// CONTENT:
// - Use realistic content based on the TOPIC:
// ${prompt.trim()} (no lorem ipsum)

// TOPIC:
// ${prompt.trim()}

// IMPORTANT:
// - Keep code minimal, clean, and fast
// - Avoid unnecessary complexity
// - Single HTML file only`;

//   try {
//     const groq = new Groq({ apiKey });

//     const completion = await groq.chat.completions.create({
//       model: "llama-3.3-70b-versatile",
//       messages: [{ role: "user", content: text_prompt }],
//       max_tokens: 8000,
//       temperature: 0.7
//     });

//     const raw = completion.choices[0]?.message?.content || "";
//     const code = extractCode(raw);

//     // Save search to MongoDB (non-fatal if it fails)
//     if (userId) {
//       try {
//         await connectDB();
//         const db = getDB();
//         await db.collection("searches").insertOne({
//           userId,
//           userEmail: userEmail || "",
//           prompt: prompt.trim(),
//           createdAt: new Date(),
//         });
//       } catch (dbErr) {
//         console.error("DB save failed (non-fatal):", dbErr.message);
//       }
//     }

//     return res.status(200).json({ code });
//   } catch (err) {
//     console.error("Groq error:", err.message);
//     return res.status(500).json({ error: "AI generation failed. Please try again." });
//   }
// });

// module.exports = router;
