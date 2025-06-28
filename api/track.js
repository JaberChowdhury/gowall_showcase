const express = require("express");
const path = require("path");
const fs = require("fs");

const STATS_FILE = path.join(__dirname, "..", "stats.json");

const router = express.Router();

// Helper to load stats
function loadStats() {
  if (!fs.existsSync(STATS_FILE)) return { images: {}, themes: {} };
  return JSON.parse(fs.readFileSync(STATS_FILE, "utf-8"));
}

// Helper to save stats
function saveStats(stats) {
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), "utf-8");
}

// POST /api/track
router.post("/track", express.json(), (req, res) => {
  const { image, theme } = req.body;
  if (!image || !theme) return res.status(400).json({ ok: false });

  const stats = loadStats();
  stats.images = stats.images || {};
  stats.themes = stats.themes || {};

  stats.images[image] = (stats.images[image] || 0) + 1;
  stats.themes[theme] = (stats.themes[theme] || 0) + 1;

  saveStats(stats);
  res.json({ ok: true });
});

module.exports = router;
