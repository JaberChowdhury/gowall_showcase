const express = require("express");
const path = require("path");
const fs = require("fs");
const { extractBaseName } = require("../utils/htmlTemplate");

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

  // Group images by base name
  const groupedImages = {};
  for (const img of Object.keys(stats.images || {})) {
    const base = extractBaseName(img);
    if (!groupedImages[base]) groupedImages[base] = [];
    groupedImages[base].push(img);
  }

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
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: "Arial", sans-serif;
          }
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
          .toggle-btn-row {
            margin: 2rem 0 1.5rem 0;
            text-align: center;
          }
          .group-toggle-btn {
            display: inline-block;
            margin: 0 0.5rem 1.5rem 0.5rem;
            padding: 0.4rem 1.1rem;
            background: #eee;
            color: #6e8efb;
            border-radius: 4px;
            border: none;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.2s, color 0.2s;
          }
          .group-toggle-btn.active {
            background: linear-gradient(135deg,#6e8efb,#a777e3);
            color: #fff;
          }
          .img-group-card {
            background: #fafbff;
            border-radius: 8px;
            box-shadow: 0 1px 6px rgba(110,142,251,0.07);
            padding: 1rem;
            margin-bottom: 1.5rem;
          }
          .img-group-title {
            font-weight: bold;
            margin-bottom: 0.7rem;
            color: #a777e3;
          }
          .img-group-variants {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
          }
          .img-group-variant {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 120px;
          }
          .img-group-variant img {
            max-width: 110px;
            max-height: 70px;
            border-radius: 6px;
            background: #eee;
            margin-bottom: 0.3rem;
          }
          .img-group-variant .img-theme {
            font-size: 0.92rem;
            color: #6e8efb;
            word-break: break-all;
            text-align: center;
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
          <div class="toggle-btn-row">
            <button class="group-toggle-btn active" id="showAllBtn" onclick="toggleGroup(false)">All Clicked Images</button>
            <button class="group-toggle-btn" id="showGroupedBtn" onclick="toggleGroup(true)">Group by Base Name</button>
          </div>
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
            <div class="img-list" id="allImagesSection">
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
            <div id="groupedImagesSection" style="display:none;">
              ${
                Object.entries(groupedImages)
                  .map(([base, imgs]) => {
                    return `
                      <div class="img-group-card">
                        <div class="img-group-title">${base}</div>
                        <div class="img-group-variants">
                          ${imgs
                            .map((img) => {
                              // Extract theme from filename
                              const themeMatch = img.match(
                                /_([a-zA-Z0-9\-]+)\.[a-zA-Z0-9]+$/
                              );
                              const theme = themeMatch
                                ? themeMatch[1]
                                : "unknown";
                              return `
                                  <div class="img-group-variant">
                                    <img src="/outputs/${img}" alt="${img}">
                                    <div class="img-theme">${theme}</div>
                                    <div class="img-count">${
                                      stats.images[img] || 0
                                    } clicks</div>
                                  </div>
                                `;
                            })
                            .join("")}
                        </div>
                      </div>
                    `;
                  })
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
        <script>
          function toggleGroup(grouped) {
            document.getElementById('allImagesSection').style.display = grouped ? 'none' : '';
            document.getElementById('groupedImagesSection').style.display = grouped ? '' : 'none';
            document.getElementById('showAllBtn').classList.toggle('active', !grouped);
            document.getElementById('showGroupedBtn').classList.toggle('active', grouped);
          }
        </script>
      </body>
    </html>
  `);
});

module.exports = router;
