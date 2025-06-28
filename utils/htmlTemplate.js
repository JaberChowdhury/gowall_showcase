function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Extract theme name from filename (e.g., blockchain-9007249_atomdark.jpg -> atomdark)
function extractTheme(filename) {
  const match = filename.match(/_([a-zA-Z0-9\-]+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : "unknown";
}

// Extract base name (without theme and extension)
function extractBaseName(filename) {
  const match = filename.match(/^(.+)_([a-zA-Z0-9\-]+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : filename;
}

// Extract extension
function extractExtension(filename) {
  const match = filename.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1] : "";
}

function htmlTemplate(photos) {
  // Group images by base name
  const groupedImages = {};
  const themesSet = new Set();
  photos.forEach((photo) => {
    const base = extractBaseName(photo.name);
    const theme = extractTheme(photo.name);
    themesSet.add(theme);
    if (!groupedImages[base]) groupedImages[base] = [];
    groupedImages[base].push(photo);
  });
  const themes = Array.from(themesSet).sort();

  // Flat gallery HTML
  let galleryHtml = "";
  photos.forEach((photo) => {
    const theme = extractTheme(photo.name);
    galleryHtml += `<div class="photo-card" data-theme="${theme}">
        <img loading="lazy" src="/outputs/${photo.name}" alt="${
      photo.name
    }" class="photo-img blur-up">
        <div class="photo-info">
          <div class="photo-name">${photo.name}</div>
          <div class="photo-size">${formatFileSize(photo.size)}</div>
        </div>
      </div>`;
  });

  // Theme filter buttons
  let themeFilterHtml = `
    <div class="theme-filter">
      <button class="theme-btn active" data-theme="all" onclick="filterTheme('all', this)">All Themes</button>
      ${themes
        .map(
          (theme) =>
            `<button class="theme-btn" data-theme="${theme}" onclick="filterTheme('${theme}', this)">${theme}</button>`
        )
        .join("")}
    </div>
  `;

  // Grouped gallery HTML
  let groupedHtml = "";
  Object.entries(groupedImages).forEach(([base, imgs]) => {
    groupedHtml += `
      <div class="img-group-card">
        <div class="img-group-title">${base}</div>
        <div class="img-group-variants">
          ${imgs
            .map((photo) => {
              const theme = extractTheme(photo.name);
              return `
                  <div class="img-group-variant">
                    <img src="/outputs/${photo.name}" alt="${
                photo.name
              }" class="photo-img blur-up">
                    <div class="img-theme">${theme}</div>
                    <div class="photo-size">${formatFileSize(photo.size)}</div>
                  </div>
                `;
            })
            .join("")}
        </div>
      </div>
    `;
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Photo Gallery</title>
    <link rel="stylesheet" href="/gallery.css">
    <style>
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
      .theme-filter {
        margin-bottom: 2rem;
        text-align: center;
      }
      .theme-btn {
        display: inline-block;
        margin: 0 0.3rem 0.5rem 0.3rem;
        padding: 0.5rem 1.2rem;
        border: none;
        border-radius: 4px;
        background: #e0e0e0;
        color: #333;
        cursor: pointer;
        font-size: 1rem;
        transition: background 0.3s, color 0.3s, transform 0.3s;
      }
      .theme-btn.active,
      .theme-btn:hover {
        background: linear-gradient(135deg, #6e8efb, #a777e3);
        color: #fff;
        transform: scale(1.05);
      }
    </style>
</head>
<body>
    <header>
        <h1>Photo Gallery</h1>
        <p>${photos.length} photos available</p>
        <a href="/dashboard" class="dashboard-btn" style="display:inline-block;margin-top:1rem;padding:0.5rem 1.2rem;background:linear-gradient(135deg,#6e8efb,#a777e3);color:#fff;border-radius:4px;text-decoration:none;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.08);transition:background 0.3s;">📊 View Dashboard</a>
    </header>
    <div class="container">
        <div class="upload-section">
            <form action="/upload" method="post" enctype="multipart/form-data">
                <input type="file" name="photo" accept="image/*" multiple>
                <button type="submit" class="upload-btn">Upload Photos</button>
            </form>
        </div>
        <div class="toggle-btn-row">
          <button class="group-toggle-btn active" id="showAllBtn" onclick="toggleGroup(false)">All Images</button>
          <button class="group-toggle-btn" id="showGroupedBtn" onclick="toggleGroup(true)">Group by Base Name</button>
        </div>
        <div id="allImagesSection">
          ${themeFilterHtml}
          <div class="gallery">
            ${galleryHtml}
          </div>
        </div>
        <div id="groupedImagesSection" style="display:none;">
          ${groupedHtml}
        </div>
    </div>
    <script>
      function toggleGroup(grouped) {
        document.getElementById('allImagesSection').style.display = grouped ? 'none' : '';
        document.getElementById('groupedImagesSection').style.display = grouped ? '' : 'none';
        document.getElementById('showAllBtn').classList.toggle('active', !grouped);
        document.getElementById('showGroupedBtn').classList.toggle('active', grouped);
      }
      function filterTheme(theme, btn) {
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.photo-card').forEach(card => {
          if (theme === 'all' || card.getAttribute('data-theme') === theme) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      }
    </script>
</body>
</html>
`;
}

module.exports = {
  htmlTemplate,
  extractTheme,
  extractBaseName,
  extractExtension,
};
