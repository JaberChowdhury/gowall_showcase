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
  // Get unique themes
  const allThemes = Array.from(
    new Set(photos.map((photo) => extractCategories(photo.name).theme))
  ).sort();
  const hasPixelate = photos.some(
    (photo) => extractCategories(photo.name).pixelate
  );

  // Prepare the gallery HTML here (avoid backticks inside backticks)
  let galleryHtml = "";
  photos.forEach((photo) => {
    const categories = extractCategories(photo.name);
    const theme = categories.theme;
    const pixelate = categories.pixelate;
    const thumbSrc = "/outputs/" + photo.name;
    const fullSrc = "/outputs/" + photo.name;
    galleryHtml +=
      '<div class="photo-card" data-theme="' +
      theme +
      '" data-pixelate="' +
      (pixelate || "") +
      '">' +
      '<img loading="lazy" src="' +
      thumbSrc +
      '" data-full="' +
      fullSrc +
      '" alt="' +
      photo.name +
      '" class="photo-img blur-up" ' +
      'onclick="openModal(this)" ' +
      'data-name="' +
      photo.name +
      '" ' +
      'data-theme="' +
      theme +
      '" ' +
      'data-pixelate="' +
      (pixelate || "") +
      '" ' +
      'data-size="' +
      photo.size +
      '" ' +
      'data-size-str="' +
      formatFileSize(photo.size) +
      '" ' +
      'data-created="' +
      (photo.created ? new Date(photo.created).toLocaleString() : "") +
      '" ' +
      'data-ext="' +
      extractExtension(photo.name) +
      '" ' +
      'data-base="' +
      extractBaseName(photo.name) +
      '"' +
      ">" +
      '<div class="photo-info">' +
      '<div class="photo-name">' +
      photo.name +
      "</div>" +
      '<div class="photo-size">' +
      formatFileSize(photo.size) +
      "</div>" +
      "</div>" +
      "</div>";
  });

  // Theme buttons HTML
  const themeButtons = allThemes
    .map(
      (theme) =>
        `<button class="theme-btn" data-theme="${theme}" onclick="filterTheme(event, '${theme}')">${theme}</button>`
    )
    .join("");
  const pixelateButton = hasPixelate
    ? `<button class="theme-btn" data-pixelate="pixelate" onclick="filterPixelate(event, 'pixelate')">Pixelated</button>`
    : "";

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
    </header>
    <div class="container">
        <div class="upload-section">
            <form action="/upload" method="post" enctype="multipart/form-data">
                <input type="file" name="photo" accept="image/*" multiple>
                <button type="submit" class="upload-btn">Upload Photos</button>
            </form>
        </div>
        <div class="theme-filter">
            <button class="theme-btn active" data-theme="all" onclick="filterTheme(event, 'all')">All</button>
            ${themeButtons}
            ${pixelateButton}
        </div>
        <div class="gallery" id="gallery">
          ${galleryHtml}
        </div>
    </div>
    <div class="modal" id="imgModal" onclick="closeModal(event)">
        <button class="modal-close" onclick="closeModal(event)">&times;</button>
        <div class="modal-content" onclick="event.stopPropagation()">
          <img id="modalImg" class="modal-img" src="" alt="Preview">
          <div class="modal-info" id="modalInfo" style="position:relative;">
            <div class="modal-info-bg" id="modalInfoBg"></div>
            <!-- Info will be injected here -->
          </div>
        </div>
    </div>
    <script>
    // Theme filter logic
    function filterTheme(event, theme) {
        event.preventDefault();
        // Remove active from all theme buttons
        document.querySelectorAll('.theme-btn[data-theme]').forEach(btn => btn.classList.remove('active'));
        // Remove active from pixelate button
        document.querySelectorAll('.theme-btn[data-pixelate]').forEach(btn => btn.classList.remove('active'));
        // Set active only on clicked theme button
        event.target.classList.add('active');
        // Show/hide cards
        document.querySelectorAll('.photo-card').forEach(card => {
            const matchesTheme = (theme === 'all' || card.getAttribute('data-theme') === theme);
            card.style.display = matchesTheme ? '' : 'none';
        });
    }
    function filterPixelate(event, pixelate) {
        event.preventDefault();
        // Remove active from all theme buttons
        document.querySelectorAll('.theme-btn[data-theme]').forEach(btn => btn.classList.remove('active'));
        // Remove active from pixelate button
        document.querySelectorAll('.theme-btn[data-pixelate]').forEach(btn => btn.classList.remove('active'));
        // Set active only on pixelate button
        event.target.classList.add('active');
        // Show/hide cards
        document.querySelectorAll('.photo-card').forEach(card => {
            const matchesPixelate = card.getAttribute('data-pixelate') === 'pixelate';
            card.style.display = matchesPixelate ? '' : 'none';
        });
    }
    // Modal logic
    function openModal(imgElem) {
        var src = imgElem.getAttribute('data-full');
        document.getElementById('modalImg').src = src;
        document.getElementById('imgModal').classList.add('open');
        // Set blurred background for info card only
        document.getElementById('modalInfoBg').style.backgroundImage = 'url(' + src + ')';
        // Gather info with icons
        var infoHtml = '';
        infoHtml += '<h2><span class="info-icon">🖼️</span>Image Information</h2>';
        infoHtml += '<div class="info-row"><span class="info-icon">📄</span><span class="info-label">File Name:</span> <span class="info-value">' + (imgElem.getAttribute('data-name') || '') + '</span></div>';
        infoHtml += '<div class="info-row"><span class="info-icon">🏷️</span><span class="info-label">Theme:</span> <span class="info-value">' + (imgElem.getAttribute('data-theme') || '') + '</span></div>';
        infoHtml += '<div class="info-row"><span class="info-icon">🔤</span><span class="info-label">Base Name:</span> <span class="info-value">' + (imgElem.getAttribute('data-base') || '') + '</span></div>';
        infoHtml += '<div class="info-row"><span class="info-icon">📦</span><span class="info-label">Extension:</span> <span class="info-value">' + (imgElem.getAttribute('data-ext') || '') + '</span></div>';
        infoHtml += '<div class="info-row"><span class="info-icon">💾</span><span class="info-label">Size:</span> <span class="info-value">' + (imgElem.getAttribute('data-size-str') || '') + ' (' + (imgElem.getAttribute('data-size') || '') + ' bytes)</span></div>';
        infoHtml += '<div class="info-row"><span class="info-icon">⏰</span><span class="info-label">Created:</span> <span class="info-value">' + (imgElem.getAttribute('data-created') || '') + '</span></div>';
        // Try to show dimensions if possible
        var modalImg = document.getElementById('modalImg');
        modalImg.onload = function() {
          var w = modalImg.naturalWidth;
          var h = modalImg.naturalHeight;
          var dimRow = document.getElementById('img-dim-row');
          if (!dimRow) {
            dimRow = document.createElement('div');
            dimRow.className = 'info-row';
            dimRow.id = 'img-dim-row';
            dimRow.innerHTML = '<span class="info-icon">📐</span><span class="info-label">Dimensions:</span> <span class="info-value">' + w + ' x ' + h + ' px</span>';
            document.getElementById('modalInfo').appendChild(dimRow);
          } else {
            dimRow.innerHTML = '<span class="info-icon">📐</span><span class="info-label">Dimensions:</span> <span class="info-value">' + w + ' x ' + h + ' px</span>';
          }
        };
        // Insert info after the background
        document.getElementById('modalInfo').innerHTML = '<div class="modal-info-bg" id="modalInfoBg" style="background-image:url(' + src + ')"></div>' + infoHtml;

        // Track click
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: imgElem.getAttribute('data-name'),
            theme: imgElem.getAttribute('data-theme')
          })
        });
    }
    function closeModal(event) {
        if (event.target.classList.contains('modal') || event.target.classList.contains('modal-close')) {
            document.getElementById('imgModal').classList.remove('open');
            document.getElementById('modalImg').src = '';
            document.getElementById('modalInfo').innerHTML = '';
        }
    }
    document.addEventListener('keydown', function(e) {
        if (e.key === "Escape") {
            document.getElementById('imgModal').classList.remove('open');
            document.getElementById('modalImg').src = '';
            document.getElementById('modalInfo').innerHTML = '';
        }
    });
    // Blur-up effect for images
    document.querySelectorAll('.photo-img').forEach(img => {
        img.addEventListener('load', function() {
            img.classList.add('loaded');
        });
    });
    </script>
</body>
</html>
`;
}

function extractCategories(filename) {
  // Matches _theme[_pixelate].ext or _pixelate.ext
  const match = filename.match(
    /_([a-zA-Z0-9\-]+)(?:_pixelate)?\.[a-zA-Z0-9]+$/
  );
  const pixelate = filename.includes("_pixelate");
  let theme = "unknown";
  if (pixelate) {
    // Try to extract theme before _pixelate
    const t = filename.match(/_([a-zA-Z0-9\-]+)_pixelate\.[a-zA-Z0-9]+$/);
    if (t) theme = t[1];
  } else if (match) {
    theme = match[1];
  }
  return {
    theme,
    pixelate: pixelate ? "pixelate" : null,
  };
}

module.exports = { htmlTemplate, extractCategories };
