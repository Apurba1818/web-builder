// routes/generate.js  (Groq only)
const express = require("express");
const Groq = require("groq-sdk");
const { connectDB, getDB } = require("../db");

const router = express.Router();

// Changeable from Render's Environment tab without a code edit
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS, 10) || 12000;

function extractCode(response) {
  // Normal case: complete ```html ... ``` block
  const match = response.match(/```(?:\w+)?\n?([\s\S]*?)```/);
  if (match) return match[1].trim();

  // Fallback: opening fence but no closing fence (truncated output)
  const open = response.match(/```(?:\w+)?\n?([\s\S]*)$/);
  if (open) return open[1].trim();

  return response.trim();
}

function buildPrompt(topic) {
  return `You are a senior frontend developer and UI designer. Build a polished, production-quality, single-file HTML page for the request below.

REQUEST:
${topic}

OUTPUT FORMAT:
- Return ONLY one markdown code block containing the full HTML file. No explanation before or after.
- The file must be complete (<!DOCTYPE html> to </html>) and work when opened directly in a browser.

TECH:
- Tailwind CSS via CDN (<script src="https://cdn.tailwindcss.com"></script>)
- Inter font via Google Fonts
- Vanilla JavaScript inside a <script> tag (no frameworks, no build step)
- GSAP via CDN only for subtle entrance animations, if it helps

DESIGN QUALITY (important):
- Modern, professional look: consistent color palette, strong typography hierarchy, generous spacing, rounded corners, soft shadows
- Include hover, focus, and active states on all interactive elements, with smooth transitions
- Fully responsive, mobile-first, with a working mobile menu where there is a navbar
- Dark/light mode toggle that remembers the choice (wrap localStorage in try/catch)
- Accessible: semantic HTML, labels, alt text, sufficient contrast

CONTENT:
- Use realistic, specific content for the topic (real-sounding names, copy, numbers). No lorem ipsum, no "Your text here".
- Landing pages: navbar, hero with call to action, features, testimonials or stats, pricing or contact, footer
- Dashboards: sidebar, stat cards, a table, and a simple chart drawn with HTML/CSS or inline SVG
- Forms: validation with clear inline error messages and a success state
- Tools/apps (calculator, to-do, etc.): complete working logic, edge cases handled, keyboard support where natural, state saved with localStorage if useful

CODE RULES:
- Clean, readable, well-structured code
- Never use eval() or innerHTML with user input
- Do not use external images that may break; use gradients, inline SVG, or emoji instead`;
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

  try {
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: buildPrompt(prompt.trim()) }],
      max_completion_tokens: MAX_TOKENS,
      temperature: 0.7,
      reasoning_effort: "medium", // remove this line if you switch to a model that rejects it
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
    // err.status: 400 = bad model/param, 401 = bad key, 404 = model not found,
    // 413 = request too large, 429 = rate limit
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
