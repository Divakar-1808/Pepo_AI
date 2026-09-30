const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const {
  createJobDescription,
} = require("../controllers/jobDescriptionController");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createJobDescription
);

module.exports = router;