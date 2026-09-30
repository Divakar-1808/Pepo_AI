const JobDescription = require("../models/JobDescription");

const createJobDescription = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_DESCRIPTION",
          message: "Job description is required.",
        },
      });
    }

    const jobDescription = await JobDescription.create({
      userId: req.user.userId,
      title: title?.trim() || "Untitled Job",
      description: description.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Job description saved successfully.",
      jobDescription: {
        id: jobDescription._id,
        title: jobDescription.title,
        description: jobDescription.description,
      },
    });
  } catch (error) {
    console.error(
      "JOB DESCRIPTION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error: {
        code: "JOB_DESCRIPTION_ERROR",
        message: "Unable to save job description.",
      },
    });
  }
};

module.exports = {
  createJobDescription,
};