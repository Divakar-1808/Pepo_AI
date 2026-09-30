import { useState } from "react";
import axios from "axios";
import { Briefcase, FileText } from "lucide-react";
import { motion } from "framer-motion";

function JobDescription({
  jobDescription,
  setJobDescription,
  setJobDescriptionId,
}) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSuccess("");
    setError("");

    if (!jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setSaving(true);

      const response = await axios.post(
        "http://localhost:5000/api/job-description",
        {
          title,
          description: jobDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setJobDescriptionId(
          response.data.jobDescription.id
        );

        setSuccess(
          "Job description saved successfully."
        );
      }
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        "Unable to save job description.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
          <Briefcase size={22} />
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            Job Description
          </h2>

          <p className="text-sm text-gray-500">
            Add the job you want Pepo to analyze.
          </p>
        </div>
      </div>

      {/* Job Title */}
      <div className="mt-6">
        <label
          htmlFor="job-title"
          className="mb-2 block text-sm font-medium text-gray-300"
        >
          Job Title
        </label>

        <div className="relative">
          <Briefcase
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            id="job-title"
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="e.g. AI Engineer"
            className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-red-500"
          />
        </div>
      </div>

      {/* Job Description */}
      <div className="mt-5">
        <label
          htmlFor="job-description"
          className="mb-2 block text-sm font-medium text-gray-300"
        >
          Description
        </label>

        <div className="relative">
          <FileText
            size={18}
            className="absolute left-4 top-4 text-gray-500"
          />

          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(event) =>
              setJobDescription(event.target.value)
            }
            placeholder="Paste the complete job description here..."
            rows={10}
            className="w-full resize-none rounded-xl border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm leading-6 text-white outline-none transition placeholder:text-gray-600 focus:border-red-500"
          />
        </div>
      </div>

      {/* Character Count */}
      <div className="mt-3 flex justify-end text-xs text-gray-600">
        <span>
          {jobDescription.length} characters
        </span>
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-5 w-full rounded-xl bg-red-600 py-3.5 text-sm font-semibold transition hover:bg-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Job Description"}
      </button>

      {/* Success */}
      {success && (
        <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {success}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
    </motion.div>
  );
}

export default JobDescription;