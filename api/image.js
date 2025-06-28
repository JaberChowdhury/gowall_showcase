const express = require("express");
const path = require("path");
const fs = require("fs");
const { extractCategories } = require("../utils/htmlTemplate");
const { imageSize } = require("image-size");
const mime = require("mime-types");
const crypto = require("crypto");

const PHOTOS_DIR = path.join(__dirname, "..", "outputs");

const router = express.Router();

// GET /api/image-info/:filename
router.get("/image-info/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(PHOTOS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Image not found" });
  }

  const stats = fs.statSync(filePath);
  const { theme, pixelate } = extractCategories(filename);

  // Get image dimensions (only for supported types)
  let dimensions = { width: null, height: null, type: null };
  const supportedExt = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".bmp",
    ".tiff",
  ];
  if (supportedExt.includes(path.extname(filename).toLowerCase())) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      dimensions = imageSize(fileBuffer);
    } catch (e) {
      console.error("image-size error:", e.message);
      dimensions = { width: null, height: null, type: null };
    }
  }

  // Calculate aspect ratio as a string (e.g. "16:9")
  let aspectRatio = "Unknown";
  if (dimensions.width && dimensions.height) {
    function gcd(a, b) {
      return b === 0 ? a : gcd(b, a % b);
    }
    const divisor = gcd(dimensions.width, dimensions.height);
    aspectRatio = `${dimensions.width / divisor}:${
      dimensions.height / divisor
    }`;
  }

  // Get MIME type
  const mimeType = mime.lookup(filePath) || "unknown";

  // Get hash
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

  res.json({
    name: filename,
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
    theme,
    pixelate,
    ext: path.extname(filename).replace(".", ""),
    base: filename.replace(/_[^_]+(\.[a-zA-Z0-9]+)$/, ""),
    width: dimensions.width,
    height: dimensions.height,
    type: dimensions.type,
    mime: mimeType,
    hash,
    absPath: filePath,
    readable: fs.accessSync(filePath, fs.constants.R_OK) === undefined,
    writable: fs.accessSync(filePath, fs.constants.W_OK) === undefined,
    aspectRatio,
  });
});

module.exports = router;
