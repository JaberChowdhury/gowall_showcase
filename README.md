# Photo Gallery

A simple Node.js photo gallery with theme support, image grouping, and dashboard analytics.

## 📸 Screenshot

![Photo Gallery Screenshot](https://i.ibb.co/q3RsZ9Gw/Screenshot-2025-06-29-011420.png)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the server

```bash
npm run dev
```

The server will start on [http://localhost:3000](http://localhost:3000).

### 3. Using the Gallery

- Visit [http://localhost:3000](http://localhost:3000) to view and upload photos.
- Uploaded images appear in the gallery and can be grouped or filtered by theme.
- Click an image to view details in a modal.
- Use the "Switch Theme" button to toggle between light and dark (Mocha) themes.
- Click "View Dashboard" to see image/theme click analytics.

### 4. Uploading Images

- Use the upload form on the main page to add images (`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`).
- Uploaded files are saved in the `outputs` directory.

### 5. Customizing Themes

- Theme names are extracted from filenames (e.g., `wallpaper_tokyo-storm.jpg` → theme: `tokyo-storm`).
- Pixelated images should include `_pixelate` in the filename for proper filtering.

### 6. Batch Processing (Optional)

- See `command.txt` for PowerShell scripts to batch convert and rename images using `gowall.exe`.

---

**Note:**

- Make sure the `outputs` directory exists (it will be created automatically if missing).
- All analytics are stored in
