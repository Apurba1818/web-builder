
// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./db");

const app = express();

// connect DB (non-blocking)
connectDB();

// middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// routes
const generateRoute = require("./routes/generate");
const searchesRoute = require("./routes/searches");

app.use("/api/generate", generateRoute);
app.use("/api/searches", searchesRoute);

// health route
app.get("/", (req, res) => {
  res.json({ status: "WebBuilder API is running ✅" });
});

// 🔥 FIXED: always start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
