const express = require("express");
const path = require("path");
const fs = require("fs");

const PHOTOS_DIR = path.join(__dirname, "..", "outputs");
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

// Dashboard route
router.get("/dashboard", (req, res) => {
  const stats = loadStats();

  // Find most clicked image
  let mostClickedImage = null;
  let mostClickedImageCount = 0;
  for (const [img, count] of Object.entries(stats.images || {})) {
    if (count > mostClickedImageCount) {
      mostClickedImage = img;
      mostClickedImageCount = count;
    }
  }

  // Find most popular theme
  let mostPopularTheme = null;
  let mostPopularThemeCount = 0;
  for (const [theme, count] of Object.entries(stats.themes || {})) {
    if (count > mostPopularThemeCount) {
      mostPopularTheme = theme;
      mostPopularThemeCount = count;
    }
  }

  res.send(`
    <html>
      <head>
        <title>Gallery Dashboard</title>
        <link rel="stylesheet" href="/gallery.css">
      </head>
      <body>
        <h1>Gallery Dashboard</h1>
        <div style="margin:2rem;">
          <h2>Most Clicked Image</h2>
          ${
            mostClickedImage
              ? `<div><b>${mostClickedImage}</b> (${mostClickedImageCount} clicks)</div>
                 <img src="/outputs/${mostClickedImage}" style="max-width:300px;max-height:200px;border-radius:8px;margin-top:1rem;">`
              : "<div>No image clicks tracked yet.</div>"
          }
        </div>
        <div style="margin:2rem;">
          <h2>Most Popular Theme</h2>
          ${
            mostPopularTheme
              ? `<div><b>${mostPopularTheme}</b> (${mostPopularThemeCount} clicks)</div>`
              : "<div>No theme clicks tracked yet.</div>"
          }
        </div>
        <div style="margin:2rem;">
          <h2>All Image Clicks</h2>
          <ul>
            ${Object.entries(stats.images || {})
              .sort((a, b) => b[1] - a[1])
              .map(([img, count]) => `<li>${img}: <b>${count}</b> clicks</li>`)
              .join("")}
          </ul>
        </div>
        <div style="margin:2rem;">
          <h2>All Theme Clicks</h2>
          <ul>
            ${Object.entries(stats.themes || {})
              .sort((a, b) => b[1] - a[1])
              .map(
                ([theme, count]) => `<li>${theme}: <b>${count}</b> clicks</li>`
              )
              .join("")}
          </ul>
        </div>
        <a href="/" style="margin-left:2rem;">← Back to Gallery</a>
      </body>
    </html>
  `);
});

// API endpoint to record a click
router.post("/api/track", express.json(), (req, res) => {
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
