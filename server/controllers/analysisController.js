const Resume = require("../models/Resume");
const JobDescription = require("../models/JobDescription");
const { analyzeResume } = require("../services/geminiService");

const analyzeResumeAgainstJob = async (req, res) => {
  try {
    const { resumeId, jobDescriptionId } = req.body;

    if (!resumeId || !jobDescriptionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_IDS",
          message:
            "Resume ID and job description ID are required.",
        },
      });
    }

    // Find resume belonging to logged-in user
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

    // Find job description belonging to logged-in user
    const jobDescription = await JobDescription.findOne({
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

    // Send resume + JD to Gemini
    const analysis = await analyzeResume(
      resume.extractedText,
      jobDescription.description
    );

    return res.status(200).json({
      success: true,
      message: "Resume analyzed successfully.",
      analysis,
    });
  } catch (error) {
    console.error(
      "RESUME ANALYSIS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error: {
        code: "RESUME_ANALYSIS_ERROR",
        message: "Unable to analyze resume.",
      },
    });
  }
};

module.exports = {
  analyzeResumeAgainstJob,
};