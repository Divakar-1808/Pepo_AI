const mongoose = require("mongoose");

const jobDescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      trim: true,
      default: "Untitled Job",
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const JobDescription = mongoose.model(
  "JobDescription",
  jobDescriptionSchema
);

module.exports = JobDescription;