const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { chat } = require("../controllers/chatbotController");

const router = express.Router();

router.post("/", authMiddleware, chat);

module.exports = router;