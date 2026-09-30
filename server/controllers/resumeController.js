const Resume = require("../models/Resume");
const extractTextFromPDF = require("../utils/pdfParser");

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: "NO_RESUME",
          message: "Please upload a PDF resume.",
        },
      });
    }

    const resumeText = await extractTextFromPDF(
      req.file.path
    );

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        error: {
          code: "EMPTY_RESUME",
          message:
            "Unable to extract text from this PDF. Please upload a text-based resume.",
        },
      });
    }

    const resume = await Resume.create({
      userId: req.user.userId,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      extractedText: resumeText,
    });

    return res.status(201).json({
      success: true,
      message: "Resume uploaded and saved successfully.",
      resume: {
        id: resume._id,
        originalName: resume.originalName,
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        extractedText: resume.extractedText,
      },
    });
  } catch (error) {
    console.error("RESUME UPLOAD ERROR:", error);

    return res.status(500).json({
      success: false,
      error: {
        code: "RESUME_UPLOAD_ERROR",
        message: "Unable to process resume.",
      },
    });
  }
};

module.exports = {
  uploadResume,
};