const express = require("express");

const upload = require("../middleware/uploadMiddleware");
const { uploadResume } = require("../controllers/resumeController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Protected resume upload route
router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);

module.exports = router;