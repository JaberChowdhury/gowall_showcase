const express = require("express");
const fileUpload = require("express-fileupload");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

const galleryRoutes = require("./routes/gallery");
const uploadRoutes = require("./routes/upload");
const dashboardRoutes = require("./routes/dashboard");
const imageApi = require("./api/image");
const trackApi = require("./api/track");

const app = express();
const PORT = 3000;
const PHOTOS_DIR = path.join(__dirname, "outputs");

// Middleware
app.use(morgan("dev"));
app.use(fileUpload());
app.use(express.static("public"));
app.use("/outputs", express.static(PHOTOS_DIR));

// Serve gallery.css from public directory
app.use(
  "/gallery.css",
  express.static(path.join(__dirname, "public", "gallery.css"))
);

// Ensure outputs directory exists
if (!fs.existsSync(PHOTOS_DIR)) {
  fs.mkdirSync(PHOTOS_DIR, { recursive: true });
}

// Routes
app.use("/", galleryRoutes);
app.use("/", uploadRoutes);
app.use("/", dashboardRoutes);

// API routes
app.use("/api", imageApi);
app.use("/api", trackApi);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Photos directory: ${PHOTOS_DIR}`);
});
