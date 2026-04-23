// routes/searches.js
const express = require("express");
const { ObjectId } = require("mongodb");
const { connectDB, getDB } = require("../db");

const router = express.Router();

// GET /api/searches?userId=xxx  — fetch last 5 searches
router.get("/", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId is required" });

  try {
    await connectDB();
    const db = getDB();
    const searches = await db
      .collection("searches")
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    return res.status(200).json({ searches });
  } catch (err) {
    console.error("DB error:", err.message);
    return res.status(500).json({ error: "Database error" });
  }
});

// DELETE /api/searches/:id?userId=xxx  — delete one search
router.delete("/:id", async (req, res) => {
  const { userId } = req.query;
  const { id } = req.params;

  if (!userId || !id) {
    return res.status(400).json({ error: "userId and id are required" });
  }

  try {
    await connectDB();
    const db = getDB();
    await db.collection("searches").deleteOne({
      _id: new ObjectId(id),
      userId, // user can only delete their own
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("DB error:", err.message);
    return res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;