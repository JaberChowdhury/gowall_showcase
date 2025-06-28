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
        <style>
          body {
            background: #f5f6fa;
            color: #222;
            font-family: 'Segoe UI', Arial, sans-serif;
          }
          .dashboard-container {
            max-width: 1100px;
            margin: 2rem auto;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(110,142,251,0.08);
            padding: 2.5rem 2rem 2rem 2rem;
          }
          .dashboard-btn {
            display: inline-block;
            margin-bottom: 2rem;
            padding: 0.5rem 1.2rem;
            background: linear-gradient(135deg,#6e8efb,#a777e3);
            color: #fff;
            border-radius: 4px;
            text-decoration: none;
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            transition: background 0.3s;
          }
          h1 {
            text-align: center;
            margin-bottom: 2rem;
            color: #6e8efb;
            letter-spacing: 1px;
          }
          .dashboard-section {
            margin-bottom: 2.5rem;
          }
          .dashboard-section h2 {
            color: #a777e3;
            margin-bottom: 1.2rem;
            font-size: 1.3rem;
            letter-spacing: 0.5px;
          }
          .most-img {
            display: flex;
            align-items: center;
            gap: 2rem;
            margin-bottom: 1.5rem;
          }
          .most-img img {
            max-width: 220px;
            max-height: 140px;
            border-radius: 8px;
            box-shadow: 0 2px 12px rgba(110,142,251,0.12);
            background: #eee;
          }
          .img-list {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
          }
          .img-card {
            background: #fafbff;
            border-radius: 8px;
            box-shadow: 0 1px 6px rgba(110,142,251,0.07);
            padding: 1rem;
            width: 210px;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 1rem;
            transition: box-shadow 0.2s;
          }
          .img-card img {
            max-width: 160px;
            max-height: 90px;
            border-radius: 6px;
            margin-bottom: 0.7rem;
            background: #eee;
          }
          .img-card .img-name {
            font-size: 0.98rem;
            color: #444;
            margin-bottom: 0.3rem;
            text-align: center;
            word-break: break-all;
          }
          .img-card .img-count {
            font-size: 0.93rem;
            color: #6e8efb;
            font-weight: bold;
          }
          .theme-list {
            display: flex;
            flex-wrap: wrap;
            gap: 1.2rem;
            margin-top: 1rem;
          }
          .theme-card {
            background: #f3f6fd;
            border-radius: 6px;
            padding: 0.7rem 1.2rem;
            color: #a777e3;
            font-weight: bold;
            font-size: 1rem;
            box-shadow: 0 1px 4px rgba(110,142,251,0.07);
            display: flex;
            align-items: center;
            gap: 0.7rem;
          }
          .theme-card .theme-count {
            color: #6e8efb;
            font-size: 0.98rem;
            font-weight: bold;
          }
          @media (max-width: 900px) {
            .dashboard-container { padding: 1rem; }
            .img-list { gap: 1rem; }
            .img-card { width: 45vw; min-width: 140px; }
          }
          @media (max-width: 600px) {
            .img-list { flex-direction: column; }
            .img-card { width: 100%; }
            .theme-list { flex-direction: column; }
          }
        </style>
      </head>
      <body>
        <div class="dashboard-container">
          <a href="/" class="dashboard-btn">← Back to Gallery</a>
          <h1>📊 Gallery Dashboard</h1>
          <div class="dashboard-section">
            <h2>🏆 Most Clicked Image</h2>
            ${
              mostClickedImage
                ? `<div class="most-img">
                    <img src="/outputs/${mostClickedImage}" alt="${mostClickedImage}">
                    <div>
                      <div style="font-size:1.1rem;"><b>${mostClickedImage}</b></div>
                      <div style="color:#6e8efb;font-weight:bold;">${mostClickedImageCount} clicks</div>
                    </div>
                  </div>`
                : "<div>No image clicks tracked yet.</div>"
            }
          </div>
          <div class="dashboard-section">
            <h2>🔥 Most Popular Theme</h2>
            ${
              mostPopularTheme
                ? `<div class="theme-card">${mostPopularTheme} <span class="theme-count">${mostPopularThemeCount} clicks</span></div>`
                : "<div>No theme clicks tracked yet.</div>"
            }
          </div>
          <div class="dashboard-section">
            <h2>🖼️ All Clicked Images</h2>
            <div class="img-list">
              ${
                Object.entries(stats.images || {})
                  .sort((a, b) => b[1] - a[1])
                  .map(
                    ([img, count]) =>
                      `<div class="img-card">
                        <img src="/outputs/${img}" alt="${img}">
                        <div class="img-name">${img}</div>
                        <div class="img-count">${count} clicks</div>
                      </div>`
                  )
                  .join("") || "<div>No image clicks tracked yet.</div>"
              }
            </div>
          </div>
          <div class="dashboard-section">
            <h2>🎨 Theme Click Counts</h2>
            <div class="theme-list">
              ${
                Object.entries(stats.themes || {})
                  .sort((a, b) => b[1] - a[1])
                  .map(
                    ([theme, count]) =>
                      `<div class="theme-card">${theme} <span class="theme-count">${count} clicks</span></div>`
                  )
                  .join("") || "<div>No theme clicks tracked yet.</div>"
              }
            </div>
          </div>
        </div>
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
