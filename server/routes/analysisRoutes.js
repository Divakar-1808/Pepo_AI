const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const {
  analyzeResumeAgainstJob,
} = require("../controllers/analysisController");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  analyzeResumeAgainstJob
);

module.exports = router;