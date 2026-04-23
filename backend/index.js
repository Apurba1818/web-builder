// index.js — Express server (works locally + Vercel serverless)
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./db");

connectDB();

const generateRoute = require("./routes/generate");
const searchesRoute = require("./routes/searches");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Routes
app.use("/api/generate", generateRoute);
app.use("/api/searches", searchesRoute);

app.get("/", (req, res) => {
  res.json({ status: "WebBuilder API is running ✅" });
});

// Local dev server
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;