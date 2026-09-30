const crypto = require("crypto");

const Resume = require("../models/Resume");
const extractTextFromPDF = require("../utils/pdfParser");

const { put } = require("@vercel/blob");

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

    const fileBuffer = req.file.buffer;

    // Extract resume text from the PDF buffer
    const extractedText =
      await extractTextFromPDF(fileBuffer);

    if (!extractedText) {
      return res.status(400).json({
        success: false,
        error: {
          code: "EMPTY_RESUME",
          message:
            "Unable to extract text from the uploaded resume.",
        },
      });
    }

    // Unique Blob filename
    const uniqueName = `resumes/${req.user.userId}/${Date.now()}-${crypto.randomUUID()}-${req.file.originalname}`;

    let blobUrl = null;
    let blobPathname = null;

    /*
     * Vercel production:
     * Upload the resume to private Vercel Blob.
     */
    if (process.env.VERCEL) {
      const blob = await put(
        uniqueName,
        fileBuffer,
        {
          access: "private",
          contentType: "application/pdf",
          addRandomSuffix: false,
        }
      );

      blobUrl = blob.url;
      blobPathname = blob.pathname;
    }

    /*
     * Local development:
     * We don't need permanent disk storage because
     * MongoDB stores the extracted resume text.
     */
    const resume = await Resume.create({
      userId: req.user.userId,
      originalName: req.file.originalname,
      fileName: req.file.originalname,
      filePath: blobUrl || "local-memory-upload",
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      extractedText,
    });

    return res.status(201).json({
      success: true,
      message: "Resume uploaded successfully.",
      resume: {
        id: resume._id,
        originalName: resume.originalName,
        fileSize: resume.fileSize,
        blobPathname,
        extractedText: resume.extractedText,
      },
    });
  } catch (error) {
    console.error("RESUME UPLOAD ERROR:", error);

    return res.status(500).json({
      success: false,
      error: {
        code: "RESUME_UPLOAD_ERROR",
        message:
          error.message ||
          "Unable to upload resume.",
      },
    });
  }
};

module.exports = {
  uploadResume,
};