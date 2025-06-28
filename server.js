const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const PHOTOS_DIR = path.join(__dirname, "outputs");

// Middleware
app.use(fileUpload());
app.use(express.static("public"));
app.use("/outputs", express.static(PHOTOS_DIR));

// Ensure outputs directory exists
if (!fs.existsSync(PHOTOS_DIR)) {
  fs.mkdirSync(PHOTOS_DIR, { recursive: true });
}

// HTML template for the gallery
const htmlTemplate = (photos) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Photo Gallery</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
        }
        body {
            background-color: #f5f5f5;
            color: #333;
        }
        header {
            background: linear-gradient(135deg, #6e8efb, #a777e3);
            color: white;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            margin-bottom: 1rem;
        }
        .container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 1rem;
        }
        .upload-section {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.05);
            margin-bottom: 2rem;
            text-align: center;
        }
        .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1.5rem;
            padding: 1rem;
        }
        .photo-card {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .photo-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .photo-img {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
        .photo-info {
            padding: 1rem;
        }
        .photo-name {
            font-weight: bold;
            margin-bottom: 0.5rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .photo-size {
            color: #666;
            font-size: 0.8rem;
        }
        .upload-btn {
            background: linear-gradient(135deg, #6e8efb, #a777e3);
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
            transition: opacity 0.3s;
        }
        .upload-btn:hover {
            opacity: 0.9;
        }
        .no-photos {
            text-align: center;
            padding: 2rem;
            color: #666;
            grid-column: 1 / -1;
        }
        @media (max-width: 600px) {
            .gallery {
                grid-template-columns: 1fr;
            }
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
        
        <div class="gallery">
            ${
              photos.length > 0
                ? photos
                    .map(
                      (photo) => `
                    <div class="photo-card">
                        <img loading="lazy" src="/outputs/${photo.name}" alt="${
                        photo.name
                      }" class="photo-img">
                        <div class="photo-info">
                            <div class="photo-name">${photo.name}</div>
                            <div class="photo-size">${formatFileSize(
                              photo.size
                            )}</div>
                        </div>
                    </div>
                `
                    )
                    .join("")
                : '<div class="no-photos">No photos found. Upload some images to get started!</div>'
            }
        </div>
    </div>
</body>
</html>
`;

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Route to display the gallery
app.get("/", (req, res) => {
  fs.readdir(PHOTOS_DIR, (err, files) => {
    if (err) {
      console.error("Error reading photos directory:", err);
      return res.status(500).send("Error reading photos directory");
    }

    const photos = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
      })
      .map((file) => {
        const stats = fs.statSync(path.join(PHOTOS_DIR, file));
        return {
          name: file,
          size: stats.size,
          created: stats.birthtime,
        };
      })
      .sort((a, b) => b.created - a.created); // Sort by newest first

    res.send(htmlTemplate(photos));
  });
});

// Route to handle file uploads
app.post("/upload", (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const uploadedFiles = Array.isArray(req.files.photo)
    ? req.files.photo
    : [req.files.photo];

  uploadedFiles.forEach((file) => {
    const filePath = path.join(PHOTOS_DIR, file.name);

    file.mv(filePath, (err) => {
      if (err) {
        console.error("Error saving file:", err);
        return res.status(500).send(err);
      }
    });
  });

  res.redirect("/");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Photos directory: ${PHOTOS_DIR}`);
});
