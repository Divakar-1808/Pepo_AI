const Resume = require("../models/Resume");
const JobDescription = require("../models/JobDescription");

const {
  chatWithPepo,
} = require("../services/chatbotService");

const chat = async (req, res) => {
  try {
    const {
      resumeId,
      jobDescriptionId,
      analysis,
      message,
      conversation,
    } = req.body;

    /*
     * Validate request
     */

    if (
      !resumeId ||
      !jobDescriptionId ||
      !message?.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_DATA",
          message:
            "Resume ID, job description ID and message are required.",
        },
      });
    }

    /*
     * Find user's resume
     */

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user.userId,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: {
          code: "RESUME_NOT_FOUND",
          message: "Resume not found.",
        },
      });
    }

    /*
     * Find user's job description
     */

    const jobDescription =
      await JobDescription.findOne({
        _id: jobDescriptionId,
        userId: req.user.userId,
      });

    if (!jobDescription) {
      return res.status(404).json({
        success: false,
        error: {
          code: "JOB_DESCRIPTION_NOT_FOUND",
          message: "Job description not found.",
        },
      });
    }

    /*
     * Ask Pepo
     */

    const reply = await chatWithPepo({
      resumeText: resume.extractedText,
      jobDescription: jobDescription.description,
      analysis: analysis || {},
      message: message.trim(),
      conversation: conversation || [],
    });

    /*
     * Successful response
     */

    return res.status(200).json({
      success: true,
      message:
        "Pepo response generated successfully.",
      reply,
    });
  } catch (error) {
    console.error(
      "CHATBOT CONTROLLER ERROR:",
      error
    );

    /*
     * Return a useful JSON error.
     */

    return res.status(500).json({
      success: false,
      error: {
        code: "CHATBOT_ERROR",
        message:
          error.message ||
          "Unable to get a response from Pepo.",
      },
    });
  }
};

module.exports = {
  chat,
};