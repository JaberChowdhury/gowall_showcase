const path = require("path");
const { buildHtml } = require("./htmlBuilder");

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

// Extract theme and pixelate info from filename
function extractCategories(filename) {
  const theme = extractTheme(filename);
  const pixelate = filename.includes("pixelate");
  return { theme, pixelate };
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

  // Theme filter buttons using buildHtml
  const themeFilterHtml = buildHtml({
    type: "div",
    className: "theme-filter",
    children: [
      {
        type: "button",
        className: "theme-btn active",
        "data-theme": "all",
        onclick: "filterTheme('all', this)",
        children: "All Themes",
      },
      {
        type: "button",
        className: "theme-btn",
        "data-theme": "pixelate",
        onclick: "filterTheme('pixelate', this)",
        children: "Pixelated",
      },
      ...themes.map((theme) => ({
        type: "button",
        className: "theme-btn",
        "data-theme": theme,
        onclick: `filterTheme('${theme}', this)`,
        children: theme,
      })),
    ],
  });

  // Flat gallery HTML using buildHtml
  const galleryHtml = buildHtml({
    type: "div",
    className: "gallery",
    children: photos.map((photo) => ({
      type: "div",
      className: "photo-card",
      "data-theme": extractTheme(photo.name),
      children: [
        {
          type: "img",
          loading: "lazy",
          src: `/outputs/${photo.name}`,
          alt: photo.name,
          className: "photo-img blur-up",
          onload: "this.classList.add('loaded')",
          onclick: `openModal('/outputs/${photo.name}', '${photo.name}')`,
        },
        {
          type: "div",
          className: "photo-info",
          children: [
            {
              type: "div",
              className: "photo-name",
              children: photo.name,
            },
            {
              type: "div",
              className: "photo-size",
              children: formatFileSize(photo.size),
            },
          ],
        },
      ],
    })),
  });

  // Grouped gallery HTML using buildHtml
  const groupedHtml = buildHtml({
    type: "div",
    children: Object.entries(groupedImages).map(([base, imgs]) => ({
      type: "div",
      className: "img-group-card",
      children: [
        {
          type: "div",
          className: "img-group-title",
          children: base,
        },
        {
          type: "div",
          className: "img-group-variants",
          children: imgs.map((photo) => ({
            type: "div",
            className: "img-group-variant",
            children: [
              {
                type: "img",
                src: `/outputs/${photo.name}`,
                alt: photo.name,
                className: "photo-img blur-up",
                onload: "this.classList.add('loaded')",
                onclick: `openModal('/outputs/${photo.name}', '${photo.name}')`,
              },
              {
                type: "div",
                className: "img-theme",
                children: extractTheme(photo.name),
              },
              {
                type: "div",
                className: "photo-size",
                children: formatFileSize(photo.size),
              },
            ],
          })),
        },
      ],
    })),
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Photo Gallery</title>
    <link rel="stylesheet" href="/gallery.css">
</head>
<body>
    <header>
        <h1>Photo Gallery</h1>
        <p>${photos.length} photos available</p>
        <a href="/dashboard" class="dashboard-btn" style="display:inline-block;margin-top:1rem;padding:0.5rem 1.2rem;background:linear-gradient(135deg,#6e8efb,#a777e3);color:#fff;border-radius:4px;text-decoration:none;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.08);transition:background 0.3s;">📊 View Dashboard</a>
        <button id="themeSwitcher" class="theme-switcher-btn" style="margin-left:1rem;padding:0.5rem 1.2rem;border-radius:4px;border:none;cursor:pointer;font-weight:bold;background:var(--color-theme-btn-bg);color:var(--color-theme-btn-text);transition:background 0.3s;">🌗 Switch Theme</button>
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
          ${galleryHtml}
        </div>
        <div id="groupedImagesSection" style="display:none;">
          ${groupedHtml}
        </div>
    </div>
    <!-- Modal HTML -->
    <div class="modal" id="imgModal" onclick="closeModal(event)">
      <span class="modal-close" onclick="closeModal(event)">&times;</span>
      <div class="modal-content">
        <img class="modal-img" id="modalImg" src="" alt="">
        <div class="modal-info" id="modalInfo">
          <div class="info-loading" id="modalInfoLoading" style="display:none;">Loading...</div>
          <div class="info-content" id="modalInfoContent" style="display:none;"></div>
        </div>
      </div>
      <div class="modal-caption" id="modalCaption" style="display:none;"></div>
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
          if (
            theme === 'all' ||
            card.getAttribute('data-theme') === theme ||
            (theme === 'pixelate' && card.querySelector('.photo-name').textContent.includes('pixelate'))
          ) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      }
      // Modal logic
      function openModal(src, caption) {
        var modal = document.getElementById('imgModal');
        var modalImg = document.getElementById('modalImg');
        var modalCaption = document.getElementById('modalCaption');
        var modalInfo = document.getElementById('modalInfo');
        var infoLoading = document.getElementById('modalInfoLoading');
        var infoContent = document.getElementById('modalInfoContent');
        modal.classList.add('open');
        modalImg.src = src;
        modalCaption.textContent = caption;

        // Show loading
        infoLoading.style.display = '';
        infoContent.style.display = 'none';
        infoContent.innerHTML = '';

        // Extract filename from src
        var filename = src.split('/').pop();
        fetch('/api/image-info/' + encodeURIComponent(filename))
          .then(res => res.json())
          .then(data => {
            infoLoading.style.display = 'none';
            infoContent.style.display = '';
            infoContent.innerHTML =
              "<h2>" + data.name + "</h2>" +
              '<div class="info-row"><span class="info-label">Theme:</span> <span class="info-value">' + data.theme + "</span></div>" +
              '<div class="info-row"><span class="info-label">Pixelate:</span> <span class="info-value">' + (data.pixelate ? "Yes" : "No") + "</span></div>" +
              '<div class="info-row"><span class="info-label">Size:</span> <span class="info-value">' + (data.size/1024).toFixed(1) + " KB</span></div>" +
              '<div class="info-row"><span class="info-label">Dimensions:</span> <span class="info-value">' + (data.width && data.height ? data.width + " × " + data.height + " px" : "Unknown") + "</span></div>" +
              '<div class="info-row"><span class="info-label">Aspect Ratio:</span> <span class="info-value">' + (data.aspectRatio || "Unknown") + "</span></div>" +
              '<div class="info-row"><span class="info-label">Type:</span> <span class="info-value">' + (data.type || "Unknown") + "</span></div>" +
              '<div class="info-row"><span class="info-label">MIME:</span> <span class="info-value">' + (data.mime || "Unknown") + "</span></div>" +
              '<div class="info-row"><span class="info-label">Created:</span> <span class="info-value">' + new Date(data.created).toLocaleString() + "</span></div>" +
              '<div class="info-row"><span class="info-label">Modified:</span> <span class="info-value">' + new Date(data.modified).toLocaleString() + "</span></div>" +
              '<div class="info-row"><span class="info-label">Extension:</span> <span class="info-value">' + data.ext + "</span></div>" +
              '<div class="info-row"><span class="info-label">Base:</span> <span class="info-value">' + data.base + "</span></div>" +
              '<div class="info-row"><span class="info-label">SHA-256:</span> <span class="info-value" style="font-size:0.85em;word-break:break-all;">' + data.hash + "</span></div>";
          })
          .catch(() => {
            infoLoading.style.display = 'none';
            infoContent.style.display = '';
            infoContent.innerHTML = '<div style="color:#a00;">Failed to load image info.</div>';
          });
      }
      function closeModal(event) {
        if (event.target.classList.contains('modal') || event.target.classList.contains('modal-close')) {
          document.getElementById('imgModal').classList.remove('open');
        }
      }
      // Optional: ESC key closes modal
      document.addEventListener('keydown', function(e) {
        if (e.key === "Escape") {
          document.getElementById('imgModal').classList.remove('open');
        }
      });
      // Theme switcher logic
      (function() {
        const btn = document.getElementById('themeSwitcher');
        if (!btn) return;
        // Save theme in localStorage
        function setTheme(theme) {
          if (theme) {
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            btn.textContent = theme === "mocha" ? "☀️ Light Theme" : "🌗 Mocha Theme";
          } else {
            document.body.removeAttribute('data-theme');
            localStorage.removeItem('theme');
            btn.textContent = "🌗 Mocha Theme";
          }
        }
        // On load, set theme from localStorage
        const saved = localStorage.getItem('theme');
        setTheme(saved);

        btn.addEventListener('click', function() {
          const current = document.body.getAttribute('data-theme');
          setTheme(current === "mocha" ? null : "mocha");
        });
      })();
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
  extractCategories,
};
