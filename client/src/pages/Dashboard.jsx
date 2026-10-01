import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Sparkles,
  Bot,
  LogOut,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  X,
  MessageCircle,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function Dashboard() {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeId, setResumeId] = useState(null);

  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobDescriptionId, setJobDescriptionId] = useState(null);

  const [analysis, setAnalysis] = useState(null);

  const [uploadingResume, setUploadingResume] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Floating chatbot
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const token = localStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // -----------------------------------------
  // LOGOUT
  // -----------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // -----------------------------------------
  // RESUME UPLOAD
  // -----------------------------------------

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setError("Please select a PDF resume first.");
      return;
    }

    if (resumeFile.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    setError("");
    setSuccess("");
    setUploadingResume(true);

    try {
      const formData = new FormData();

      formData.append("resume", resumeFile);

      const response = await axios.post(
        `${API_URL}/resume/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setResumeId(
          response.data.resume?.id ||
            response.data.resume?._id ||
            response.data.resumeId
        );

        setSuccess("Resume uploaded successfully.");
      } else {
        setError(
          response.data?.error?.message ||
            response.data?.message ||
            "Resume upload failed."
        );
      }
    } catch (err) {
      console.error("Resume upload error:", err);

      setError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          "Unable to upload resume."
      );
    } finally {
      setUploadingResume(false);
    }
  };

  // -----------------------------------------
  // SAVE JOB DESCRIPTION
  // -----------------------------------------

  const handleSaveJobDescription = async () => {
    if (!jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }

    setError("");
    setSuccess("");
    setSavingJob(true);

    try {
      const response = await axios.post(
        `${API_URL}/job-description`,
        {
          title: jobTitle || "Untitled Job",
          description: jobDescription,
        },
        authConfig
      );

      if (response.data.success) {
        setJobDescriptionId(
          response.data.jobDescription?.id ||
            response.data.jobDescription?._id ||
            response.data.jobDescriptionId
        );

        setSuccess("Job description saved successfully.");
      } else {
        setError(
          response.data?.error?.message ||
            response.data?.message ||
            "Unable to save job description."
        );
      }
    } catch (err) {
      console.error("Job description error:", err);

      setError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          "Unable to save job description."
      );
    } finally {
      setSavingJob(false);
    }
  };

  // -----------------------------------------
  // ANALYZE RESUME
  // -----------------------------------------

  const handleAnalyze = async () => {
    if (!resumeId) {
      setError("Please upload your resume first.");
      return;
    }

    if (!jobDescriptionId) {
      setError("Please save the job description first.");
      return;
    }

    setError("");
    setSuccess("");
    setAnalyzing(true);

    try {
      const response = await axios.post(
        `${API_URL}/analysis`,
        {
          resumeId,
          jobDescriptionId,
        },
        authConfig
      );

      if (response.data.success) {
        setAnalysis(
          response.data.analysis ||
            response.data.result ||
            response.data
        );

        setSuccess("Resume analysis completed.");
      } else {
        setError(
          response.data?.error?.message ||
            response.data?.message ||
            "Analysis failed."
        );
      }
    } catch (err) {
      console.error("Analysis error:", err);

      setError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          "Unable to analyze resume."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // -----------------------------------------
  // CHATBOT
  // -----------------------------------------

  const handleSendMessage = async () => {
    const message = chatMessage.trim();

    if (!message) return;

    if (!resumeId || !jobDescriptionId) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: message,
        },
        {
          role: "assistant",
          content:
            "Please upload your resume and save a job description first. Then I can understand your career context and help you better.",
        },
      ]);

      setChatMessage("");
      return;
    }

    setChatMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: message,
      },
    ]);

    setChatMessage("");
    setChatLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/chatbot`,
        {
          resumeId,
          jobDescriptionId,
          message,
        },
        authConfig
      );

      const reply =
        response.data?.reply ||
        response.data?.message ||
        response.data?.response ||
        response.data?.answer;

      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            reply || "I couldn't generate a response. Please try again.",
        },
      ]);
    } catch (err) {
      console.error("Chatbot error:", err);

      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err.response?.data?.error?.message ||
            err.response?.data?.message ||
            "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // -----------------------------------------
  // HELPERS
  // -----------------------------------------

  const getScore = (key) => {
    if (!analysis) return null;

    return (
      analysis[key] ??
      analysis.scores?.[key] ??
      analysis.result?.[key] ??
      null
    );
  };

  const overallScore = getScore("overallScore");
  const atsScore = getScore("atsScore");
  const keywordScore = getScore("keywordMatchScore");
  const skillsScore = getScore("skillsMatchScore");
  const experienceScore = getScore("experienceMatchScore");
  const structureScore = getScore("structureScore");

  const matchedKeywords =
    analysis?.matchedKeywords ||
    analysis?.keywords?.matched ||
    [];

  const missingKeywords =
    analysis?.missingKeywords ||
    analysis?.keywords?.missing ||
    [];

  const strengths = analysis?.strengths || [];

  const atsIssues =
    analysis?.atsIssues ||
    analysis?.atsCompatibilityIssues ||
    [];

  const topFixes =
    analysis?.top3Fixes ||
    analysis?.topFixes ||
    analysis?.recommendations ||
    [];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* -------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------- */}

      <header className="sticky top-0 z-40 border-b border-red-900/30 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="text-white">PEPO</span>
              <span className="text-red-500"> AI</span>
            </h1>

            <p className="text-xs text-gray-500">
              AI Resume & Career Assistant
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-red-900/40 px-4 py-2 text-sm text-gray-300 transition hover:border-red-500 hover:text-white"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      {/* -------------------------------- */}
      {/* MAIN */}
      {/* -------------------------------- */}

      <main className="mx-auto max-w-7xl px-6 py-8 pb-32">
        {/* ERROR */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-red-300"
          >
            <AlertCircle size={20} />

            <span className="flex-1">{error}</span>

            <button onClick={() => setError("")}>
              <X size={18} />
            </button>
          </motion.div>
        )}

        {/* SUCCESS */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-950/20 p-4 text-green-300"
          >
            <CheckCircle2 size={20} />

            <span>{success}</span>
          </motion.div>
        )}

        {/* -------------------------------- */}
        {/* WELCOME */}
        {/* -------------------------------- */}

        <section className="mb-10">
          <div className="mb-2 flex items-center gap-3">
            <Sparkles className="text-red-500" size={24} />

            <h2 className="text-3xl font-bold">
              Welcome to PEPO AI
            </h2>
          </div>

          <p className="max-w-2xl text-gray-400">
            Upload your resume, compare it with a job description,
            and use AI to understand how you can improve your
            application.
          </p>
        </section>

        {/* -------------------------------- */}
        {/* INPUT GRID */}
        {/* -------------------------------- */}

        <section className="grid gap-6 lg:grid-cols-2">
          {/* RESUME */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-900/30 bg-zinc-950 p-6"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-red-600/10 p-3">
                <FileText className="text-red-500" size={22} />
              </div>

              <div>
                <h3 className="font-semibold">
                  Your Resume
                </h3>

                <p className="text-sm text-gray-500">
                  Upload your PDF resume
                </p>
              </div>
            </div>

            <label className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-black p-6 text-center transition hover:border-red-500">
              <Upload className="mb-4 text-red-500" size={30} />

              <p className="mb-1 text-sm font-medium">
                {resumeFile
                  ? resumeFile.name
                  : "Choose your resume PDF"}
              </p>

              <p className="text-xs text-gray-500">
                Maximum file size: 5MB
              </p>

              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(event) => {
                  setResumeFile(
                    event.target.files?.[0] || null
                  );
                  setError("");
                }}
              />
            </label>

            <button
              onClick={handleResumeUpload}
              disabled={uploadingResume || !resumeFile}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {uploadingResume ? (
                <>
                  <Loader2
                    className="animate-spin"
                    size={18}
                  />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload Resume
                </>
              )}
            </button>

            {resumeId && (
              <div className="mt-4 flex items-center gap-2 text-sm text-green-400">
                <CheckCircle2 size={16} />
                Resume ready for analysis
              </div>
            )}
          </motion.div>

          {/* JOB DESCRIPTION */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-red-900/30 bg-zinc-950 p-6"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-red-600/10 p-3">
                <Briefcase
                  className="text-red-500"
                  size={22}
                />
              </div>

              <div>
                <h3 className="font-semibold">
                  Job Description
                </h3>

                <p className="text-sm text-gray-500">
                  Add the position you're applying for
                </p>
              </div>
            </div>

            <input
              type="text"
              value={jobTitle}
              onChange={(event) =>
                setJobTitle(event.target.value)
              }
              placeholder="Job title (optional)"
              className="mb-4 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm outline-none transition placeholder:text-gray-600 focus:border-red-500"
            />

            <textarea
              value={jobDescription}
              onChange={(event) =>
                setJobDescription(event.target.value)
              }
              placeholder="Paste the job description here..."
              className="min-h-[180px] w-full resize-none rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm outline-none transition placeholder:text-gray-600 focus:border-red-500"
            />

            <button
              onClick={handleSaveJobDescription}
              disabled={
                savingJob || !jobDescription.trim()
              }
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500 bg-red-600/10 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {savingJob ? (
                <>
                  <Loader2
                    className="animate-spin"
                    size={18}
                  />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Save Job Description
                </>
              )}
            </button>

            {jobDescriptionId && (
              <div className="mt-4 flex items-center gap-2 text-sm text-green-400">
                <CheckCircle2 size={16} />
                Job description ready
              </div>
            )}
          </motion.div>
        </section>

        {/* -------------------------------- */}
        {/* ANALYZE BUTTON */}
        {/* -------------------------------- */}

        <section className="mt-8">
          <button
            onClick={handleAnalyze}
            disabled={
              analyzing ||
              !resumeId ||
              !jobDescriptionId
            }
            className="mx-auto flex w-full max-w-xl items-center justify-center gap-3 rounded-xl bg-red-600 px-6 py-4 text-lg font-bold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {analyzing ? (
              <>
                <Loader2
                  className="animate-spin"
                  size={22}
                />
                PEPO is analyzing your resume...
              </>
            ) : (
              <>
                <Sparkles size={22} />
                Analyze Resume with PEPO AI
              </>
            )}
          </button>
        </section>

        {/* -------------------------------- */}
        {/* ANALYSIS */}
        {/* -------------------------------- */}

        {analysis && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                Resume Analysis
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                AI-generated analysis based on your resume
                and target job description.
              </p>
            </div>

            {/* SCORES */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ScoreCard
                title="Overall Score"
                score={overallScore}
              />

              <ScoreCard
                title="ATS Compatibility"
                score={atsScore}
              />

              <ScoreCard
                title="Keyword Match"
                score={keywordScore}
              />

              <ScoreCard
                title="Skills Match"
                score={skillsScore}
              />

              <ScoreCard
                title="Experience Match"
                score={experienceScore}
              />

              <ScoreCard
                title="Structure"
                score={structureScore}
              />
            </div>

            {/* SUMMARY */}

            {analysis.summary && (
              <AnalysisCard title="Summary">
                <p className="leading-7 text-gray-300">
                  {analysis.summary}
                </p>
              </AnalysisCard>
            )}

            {/* KEYWORDS */}

            <div className="grid gap-6 lg:grid-cols-2">
              <AnalysisCard title="Matched Keywords">
                {matchedKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {matchedKeywords.map(
                      (keyword, index) => (
                        <span
                          key={index}
                          className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-sm text-green-400"
                        >
                          {keyword}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No matched keywords found.
                  </p>
                )}
              </AnalysisCard>

              <AnalysisCard title="Missing Keywords">
                {missingKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {missingKeywords.map(
                      (keyword, index) => (
                        <span
                          key={index}
                          className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-sm text-red-400"
                        >
                          {keyword}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No major missing keywords identified.
                  </p>
                )}
              </AnalysisCard>
            </div>

            {/* STRENGTHS + ATS */}

            <div className="grid gap-6 lg:grid-cols-2">
              <AnalysisCard title="Strengths">
                {strengths.length > 0 ? (
                  <ul className="space-y-3">
                    {strengths.map(
                      (item, index) => (
                        <li
                          key={index}
                          className="flex gap-3 text-gray-300"
                        >
                          <CheckCircle2
                            className="mt-1 shrink-0 text-green-500"
                            size={17}
                          />

                          <span>{item}</span>
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-gray-500">
                    No strengths returned.
                  </p>
                )}
              </AnalysisCard>

              <AnalysisCard title="ATS Issues">
                {atsIssues.length > 0 ? (
                  <ul className="space-y-3">
                    {atsIssues.map(
                      (item, index) => (
                        <li
                          key={index}
                          className="flex gap-3 text-gray-300"
                        >
                          <AlertCircle
                            className="mt-1 shrink-0 text-red-500"
                            size={17}
                          />

                          <span>{item}</span>
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-gray-500">
                    No major ATS issues returned.
                  </p>
                )}
              </AnalysisCard>
            </div>

            {/* TOP FIXES */}

            <AnalysisCard title="Top 3 Fixes">
              {topFixes.length > 0 ? (
                <div className="space-y-4">
                  {topFixes.slice(0, 3).map(
                    (item, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-red-900/30 bg-black p-4"
                      >
                        <div className="mb-2 flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-sm font-bold">
                            {index + 1}
                          </span>

                          <span className="font-semibold">
                            Priority {index + 1}
                          </span>
                        </div>

                        <p className="text-sm leading-6 text-gray-300">
                          {typeof item === "string"
                            ? item
                            : item?.recommendation ||
                              item?.fix ||
                              item?.description ||
                              JSON.stringify(item)}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-gray-500">
                  No recommendations returned.
                </p>
              )}
            </AnalysisCard>
          </motion.section>
        )}
      </main>

      {/* ================================================== */}
      {/* FLOATING PEPO AI CHATBOT */}
      {/* ================================================== */}

      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
                y: 20,
              }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-20 right-0 flex h-[600px] w-[380px] flex-col overflow-hidden rounded-2xl border border-red-900/40 bg-zinc-950 shadow-2xl shadow-red-950/30"
            >
              {/* CHAT HEADER */}

              <div className="flex items-center justify-between border-b border-red-900/30 bg-black px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600">
                    <Bot size={21} />
                  </div>

                  <div>
                    <h3 className="font-bold">
                      PEPO AI
                    </h3>

                    <p className="text-xs text-green-400">
                      AI Career Assistant
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setChatOpen(false)}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-zinc-900 hover:text-white"
                >
                  <X size={19} />
                </button>
              </div>

              {/* CHAT MESSAGES */}

              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {chatMessages.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-600/10">
                      <Bot
                        size={30}
                        className="text-red-500"
                      />
                    </div>

                    <h4 className="mb-2 text-lg font-semibold">
                      Hi, I'm PEPO 👋
                    </h4>

                    <p className="max-w-[280px] text-sm leading-6 text-gray-500">
                      Ask me about your resume, ATS,
                      interviews, programming, AI,
                      career preparation, or job
                      applications.
                    </p>
                  </div>
                )}

                {chatMessages.map(
                  (message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                          message.role === "user"
                            ? "rounded-br-md bg-red-600 text-white"
                            : "rounded-bl-md border border-zinc-800 bg-black text-gray-300"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  )
                )}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-zinc-800 bg-black px-4 py-3 text-sm text-gray-400">
                      <Loader2
                        size={15}
                        className="animate-spin text-red-500"
                      />

                      PEPO is thinking...
                    </div>
                  </div>
                )}
              </div>

              {/* CHAT INPUT */}

              <div className="border-t border-red-900/30 bg-black p-3">
                <div className="flex items-end gap-2 rounded-xl border border-zinc-800 bg-zinc-950 p-2 focus-within:border-red-500">
                  <textarea
                    value={chatMessage}
                    onChange={(event) =>
                      setChatMessage(event.target.value)
                    }
                    onKeyDown={handleChatKeyDown}
                    placeholder="Ask PEPO anything..."
                    rows={1}
                    className="max-h-24 min-h-[42px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-gray-600"
                  />

                  <button
                    onClick={handleSendMessage}
                    disabled={
                      chatLoading ||
                      !chatMessage.trim()
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Send size={17} />
                  </button>
                </div>

                <p className="mt-2 text-center text-[10px] text-gray-600">
                  PEPO AI can make mistakes. Verify important
                  information.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FLOATING BUTTON */}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setChatOpen((prev) => !prev)}
          className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-xl shadow-red-950/50 transition hover:bg-red-700"
        >
          {chatOpen ? (
            <X size={25} />
          ) : (
            <>
              <MessageCircle size={27} />

              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-red-600">
                AI
              </span>
            </>
          )}

          {!chatOpen && (
            <span className="pointer-events-none absolute right-[72px] whitespace-nowrap rounded-lg border border-red-900/30 bg-zinc-950 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100">
              Ask PEPO AI
            </span>
          )}
        </motion.button>
      </div>
    </div>
  );
}

// ==================================================
// SCORE CARD
// ==================================================

function ScoreCard({ title, score }) {
  const numericScore =
    typeof score === "number"
      ? score
      : Number(score);

  const validScore =
    Number.isFinite(numericScore)
      ? numericScore
      : null;

  return (
    <div className="rounded-2xl border border-red-900/30 bg-zinc-950 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-gray-400">
          {title}
        </span>

        <Sparkles
          size={17}
          className="text-red-500"
        />
      </div>

      <div className="flex items-end gap-2">
        <span className="text-4xl font-bold">
          {validScore !== null ? validScore : "--"}
        </span>

        {validScore !== null && (
          <span className="mb-1 text-sm text-gray-500">
            / 100
          </span>
        )}
      </div>

      {validScore !== null && (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-red-600 transition-all"
            style={{
              width: `${Math.min(
                Math.max(validScore, 0),
                100
              )}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

// ==================================================
// ANALYSIS CARD
// ==================================================

function AnalysisCard({ title, children }) {
  return (
    <div className="mt-6 rounded-2xl border border-red-900/30 bg-zinc-950 p-6">
      <h3 className="mb-5 text-lg font-semibold">
        {title}
      </h3>

      {children}
    </div>
  );
}

export default Dashboard;