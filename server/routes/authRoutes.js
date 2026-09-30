const express = require("express");

const {
  signup,
  login,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected test route
router.get("/me", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Authentication successful.",
    userId: req.user.userId,
  });
});

module.exports = router;