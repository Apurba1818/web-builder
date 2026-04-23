// db.js — MongoDB connection (reused across routes)
require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
let client = null;
let db = null;

async function connectDB() {
  if (db) return db;
  if (!uri) throw new Error("MONGODB_URI environment variable not set");
  client = new MongoClient(uri);
  await client.connect();
  db = client.db("webbuilder");
  console.log("MongoDB connected ✅");
  return db;
}

function getDB() {
  if (!db) throw new Error("DB not connected. Call connectDB() first.");
  return db;
}

module.exports = { connectDB, getDB };