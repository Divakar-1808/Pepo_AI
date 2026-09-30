const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const jobDescriptionRoutes = require("./routes/jobDescriptionRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/resume", resumeRoutes);

app.use(
  "/api/job-description",
  jobDescriptionRoutes
);

app.use("/api/analysis", analysisRoutes);

app.use("/api/chatbot", chatbotRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Pepo API is running 🚀",
  });
});

// Local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(
      `Pepo server running on port ${PORT}`
    );
  });
}

// Vercel
module.exports = app;