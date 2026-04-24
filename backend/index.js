
// index.js
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

// ✅ FIXED — always listen, works on both local and Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
