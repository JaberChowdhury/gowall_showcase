const express = require("express");
const path = require("path");
const PHOTOS_DIR = path.join(__dirname, "..", "outputs");

const router = express.Router();

// Route to handle file uploads
router.post("/upload", (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const uploadedFiles = Array.isArray(req.files.photo)
    ? req.files.photo
    : [req.files.photo];

  let errorOccurred = false;

  uploadedFiles.forEach((file) => {
    const filePath = path.join(PHOTOS_DIR, file.name);

    file.mv(filePath, (err) => {
      if (err) {
        console.error("Error saving file:", err);
        errorOccurred = true;
      }
    });
  });

  if (errorOccurred) {
    return res.status(500).send("Error saving one or more files.");
  }

  res.redirect("/");
});

module.exports = router;
