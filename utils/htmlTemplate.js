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
  const themes = Array.from(
    new Set(photos.map((photo) => extractTheme(photo.name)))
  ).sort();

  // Prepare the gallery HTML here (avoid backticks inside backticks)
  let galleryHtml = "";
  photos.forEach((photo, idx) => {
    const theme = extractTheme(photo.name);
    const thumbSrc = "/outputs/" + photo.name;
    const fullSrc = "/outputs/" + photo.name;
    // Add data attributes for modal info
    galleryHtml +=
      '<div class="photo-card" data-theme="' +
      theme +
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
  const themeButtons = themes
    .map(
      (theme) =>
        `<button class="theme-btn" data-theme="${theme}" onclick="filterTheme(event, '${theme}')">${theme}</button>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Photo Gallery</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Arial', sans-serif; }
        body { background-color: #f5f5f5; color: #333; transition: background-color 0.3s, color 0.3s; }
        header { background: linear-gradient(135deg, #6e8efb, #a777e3); color: white; padding: 2rem; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); transition: background 0.3s, color 0.3s, box-shadow 0.3s; }
        h1 { margin-bottom: 1rem; transition: color 0.3s; }
        .container { max-width: 1200px; margin: 2rem auto; padding: 0 1rem; transition: max-width 0.3s, margin 0.3s, padding 0.3s; }
        .upload-section { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 15px rgba(0,0,0,0.05); margin-bottom: 2rem; text-align: center; transition: background 0.3s, box-shadow 0.3s; }
        .theme-filter { margin-bottom: 2rem; text-align: center; }
        .theme-btn { display: inline-block; margin: 0 0.3rem 0.5rem 0.3rem; padding: 0.5rem 1.2rem; border: none; border-radius: 4px; background: #e0e0e0; color: #333; cursor: pointer; font-size: 1rem; transition: background 0.3s, color 0.3s, transform 0.3s; }
        .theme-btn.active, .theme-btn:hover { background: linear-gradient(135deg, #6e8efb, #a777e3); color: #fff; transform: scale(1.05);}
        .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; padding: 1rem; transition: gap 0.3s, padding 0.3s; }
        .photo-card { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.1); transition: transform 0.3s, box-shadow 0.3s, background 0.3s; }
        .photo-card:hover { transform: translateY(-5px) scale(1.03); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
        .photo-img { width: 100%; height: 200px; object-fit: cover; transition: filter 0.3s, transform 0.3s; cursor: pointer; }
        .photo-img:hover { filter: brightness(0.95); transform: scale(1.04); }
        .photo-info { padding: 1rem; transition: padding 0.3s; }
        .photo-name { font-weight: bold; margin-bottom: 0.5rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.3s; }
        .photo-size { color: #666; font-size: 0.8rem; transition: color 0.3s; }
        .upload-btn { background: linear-gradient(135deg, #6e8efb, #a777e3); color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 4px; cursor: pointer; font-size: 1rem; transition: opacity 0.3s, background 0.3s; }
        .upload-btn:hover { opacity: 0.9; }
        .no-photos { text-align: center; padding: 2rem; color: #666; grid-column: 1 / -1; transition: color 0.3s, padding 0.3s; }
        .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s; }
        .modal.open { display: flex; opacity: 1; transition: opacity 0.3s; }
        .modal-content { display: flex; flex-direction: row; background: none; }
        .modal-img { max-width: 60vw; max-height: 90vh; border-radius: 8px; box-shadow: 0 2px 20px rgba(0,0,0,0.5); transition: transform 0.3s, box-shadow 0.3s; background: #222; }
        .modal-info { min-width: 250px; max-width: 350px; background: #fff; color: #222; border-radius: 8px; margin-left: 2rem; padding: 2rem 1.5rem; box-shadow: 0 2px 20px rgba(0,0,0,0.12); display: flex; flex-direction: column; justify-content: center; }
        .modal-info h2 { font-size: 1.2rem; margin-bottom: 1rem; }
        .modal-info .info-row { margin-bottom: 0.7rem; }
        .modal-info .info-label { font-weight: bold; color: #6e8efb; margin-right: 0.5rem; }
        .modal-info .info-value { color: #333; }
        .modal-close { position: absolute; top: 30px; right: 40px; font-size: 2.5rem; color: #fff; cursor: pointer; font-weight: bold; z-index: 1001; background: none; border: none; transition: color 0.3s; }
        .modal-close:hover { color: #a777e3; }
        @media (max-width: 900px) {
          .modal-content { flex-direction: column; align-items: center; }
          .modal-img { max-width: 90vw; margin-bottom: 1.5rem; }
          .modal-info { margin-left: 0; max-width: 90vw; }
        }
        @media (max-width: 600px) { .gallery { grid-template-columns: 1fr; } }
        .blur-up {
          filter: blur(10px);
          transition: filter 0.5s;
        }
        .blur-up.loaded {
          filter: blur(0);
        }
    </style>
</head>
<body>
    <header>
        <h1>Photo Gallery</h1>
        <p>${photos.length} photos available</p>
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
        </div>
        <div class="gallery" id="gallery">
          ${galleryHtml}
        </div>
    </div>
    <div class="modal" id="imgModal" onclick="closeModal(event)">
        <button class="modal-close" onclick="closeModal(event)">&times;</button>
        <div class="modal-content" onclick="event.stopPropagation()">
          <img id="modalImg" class="modal-img" src="" alt="Preview">
          <div class="modal-info" id="modalInfo">
            <!-- Info will be injected here -->
          </div>
        </div>
    </div>
    <script>
    // Theme filter logic
    function filterTheme(event, theme) {
        event.preventDefault();
        document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        document.querySelectorAll('.photo-card').forEach(card => {
            if (theme === 'all' || card.getAttribute('data-theme') === theme) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }
    // Modal logic
    function openModal(imgElem) {
        var src = imgElem.getAttribute('data-full');
        document.getElementById('modalImg').src = src;
        document.getElementById('imgModal').classList.add('open');
        // Gather info
        var infoHtml = '';
        infoHtml += '<h2>Image Information</h2>';
        infoHtml += '<div class="info-row"><span class="info-label">File Name:</span> <span class="info-value">' + (imgElem.getAttribute('data-name') || '') + '</span></div>';
        infoHtml += '<div class="info-row"><span class="info-label">Theme:</span> <span class="info-value">' + (imgElem.getAttribute('data-theme') || '') + '</span></div>';
        infoHtml += '<div class="info-row"><span class="info-label">Base Name:</span> <span class="info-value">' + (imgElem.getAttribute('data-base') || '') + '</span></div>';
        infoHtml += '<div class="info-row"><span class="info-label">Extension:</span> <span class="info-value">' + (imgElem.getAttribute('data-ext') || '') + '</span></div>';
        infoHtml += '<div class="info-row"><span class="info-label">Size:</span> <span class="info-value">' + (imgElem.getAttribute('data-size-str') || '') + ' (' + (imgElem.getAttribute('data-size') || '') + ' bytes)</span></div>';
        infoHtml += '<div class="info-row"><span class="info-label">Created:</span> <span class="info-value">' + (imgElem.getAttribute('data-created') || '') + '</span></div>';
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
            document.getElementById('modalInfo').appendChild(dimRow);
          }
          dimRow.innerHTML = '<span class="info-label">Dimensions:</span> <span class="info-value">' + w + ' x ' + h + ' px</span>';
        };
        document.getElementById('modalInfo').innerHTML = infoHtml;
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

module.exports = { htmlTemplate };
