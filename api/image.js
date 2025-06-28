const express = require("express");
const path = require("path");
const fs = require("fs");

const PHOTOS_DIR = path.join(__dirname, "..", "outputs");
const { extractCategories } = require("../utils/htmlTemplate");

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

  res.json({
    name: filename,
    size: stats.size,
    created: stats.birthtime,
    theme,
    pixelate,
    ext: path.extname(filename).replace(".", ""),
    base: filename.replace(/_[^_]+(\.[a-zA-Z0-9]+)$/, ""),
  });
});

module.exports = router;
