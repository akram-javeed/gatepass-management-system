const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const pool = require("../db");
const fs = require("fs"); // Add this

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // save files in /uploads folder
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "_" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// POST /api/files/upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { gate_pass_id } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "File not uploaded" });
    }

    const file_url = `/uploads/${file.filename}`;
    const file_type = path.extname(file.originalname).slice(1); // remove dot

    const result = await pool.query(
      `INSERT INTO gate_pass_files (gate_pass_id, file_name, file_url, file_type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [gate_pass_id, file.originalname, file_url, file_type]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "File upload failed" });
  }
});

// GET files for a gate_pass_id
router.get("/:gate_pass_id", async (req, res) => {
  try {
    const { gate_pass_id } = req.params;
    const result = await pool.query(
      "SELECT * FROM gate_pass_files WHERE gate_pass_id = $1",
      [gate_pass_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// ADD THIS NEW ROUTE - Serve uploaded files
router.get("/view/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, "..", "uploads", filename);
    
    console.log("Attempting to serve file:", filepath);
    
    // Check if file exists
    if (!fs.existsSync(filepath)) {
      console.error("File not found:", filepath);
      return res.status(404).json({ error: "File not found", filename: filename });
    }
    
    // Determine content type based on extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";
    
    if (ext === ".pdf") contentType = "application/pdf";
    else if ([".jpg", ".jpeg"].includes(ext)) contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".doc") contentType = "application/msword";
    else if (ext === ".docx") contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    
    // Set headers and send file
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Cache-Control", "public, max-age=3600");
    
    // Stream the file
    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);
    
    fileStream.on("error", (error) => {
      console.error("Error streaming file:", error);
      res.status(500).json({ error: "Failed to stream file" });
    });
    
  } catch (error) {
    console.error("Error serving file:", error);
    res.status(500).json({ error: "Failed to serve file", details: error.message });
  }
});

// POST new file
router.post("/", async (req, res) => {
  try {
    const { gate_pass_id, file_name, file_url, file_type } = req.body;
    const result = await pool.query(
      `INSERT INTO gate_pass_files (gate_pass_id, file_name, file_url, file_type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [gate_pass_id, file_name, file_url, file_type]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error inserting file:", error);
    res.status(500).json({ error: "Failed to insert file" });
  }
});

module.exports = router;