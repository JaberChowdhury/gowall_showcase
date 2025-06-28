const express = require("express");
const path = require("path");
const fs = require("fs");
const { htmlTemplate } = require("../utils/htmlTemplate");

const router = express.Router();
const PHOTOS_DIR = path.join(__dirname, "..", "outputs");

// Route to display the gallery
router.get("/", (req, res) => {
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

module.exports = router;
