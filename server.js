const express = require("express");
const fileUpload = require("express-fileupload");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

const galleryRoutes = require("./routes/gallery");
const uploadRoutes = require("./routes/upload");

const app = express();
const PORT = 3000;
const PHOTOS_DIR = path.join(__dirname, "outputs");

// Middleware
app.use(morgan("dev"));
app.use(fileUpload());
app.use(express.static("public"));
app.use("/outputs", express.static(PHOTOS_DIR));

// Ensure outputs directory exists
if (!fs.existsSync(PHOTOS_DIR)) {
  fs.mkdirSync(PHOTOS_DIR, { recursive: true });
}

// Routes
app.use("/", galleryRoutes);
app.use("/", uploadRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Photos directory: ${PHOTOS_DIR}`);
});
