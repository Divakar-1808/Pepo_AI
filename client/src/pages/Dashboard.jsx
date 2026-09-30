import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  FileText,
  LogOut,
  Sparkles,
  Upload,
  Send,
  X,
  MessageCircle,
  Minimize2,
} from "lucide-react";

import JobDescription from "../components/JobDescription";

function Dashboard() {
  const [jobDescription, setJobDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [resumeId, setResumeId] = useState(null);
  const [jobDescriptionId, setJobDescriptionId] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");

  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  // Chatbot states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  const chatEndRef = useRef(null);

  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // Scroll chatbot to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chatMessages, chatLoading]);

  // Initial Pepo greeting
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([
        {
          role: "assistant",
          content:
            "Hi! I'm Pepo 👋 Your AI career assistant. Ask me anything about your resume, ATS score, job description, interviews, skills, learning, or career preparation.",
        },
      ]);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // ==============================
  // RESUME FILE SELECTION
  // ==============================

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setUploadMessage("");
    setUploadError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setSelectedFile(null);

      setUploadError(
        "Please upload a PDF resume."
      );

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSelectedFile(null);

      setUploadError(
        "Resume must be smaller than 5 MB."
      );

      return;
    }

    setSelectedFile(file);
  };

  // ==============================
  // RESUME UPLOAD
  // ==============================

  const handleUploadResume = async () => {
    if (!selectedFile) {
      setUploadError(
        "Please select a resume PDF first."
      );

      return;
    }

    try {
      setUploading(true);
      setUploadMessage("");
      setUploadError("");

      const formData = new FormData();

      formData.append(
        "resume",
        selectedFile
      );

      const response = await axios.post(
        "http://localhost:5000/api/resume/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = response.data;

      if (data.success) {
        setResumeId(
          data.resume.id
        );

        setUploadMessage(
          "Resume uploaded successfully."
        );

        setAnalysis(null);
        setAnalysisError("");

        setChatMessages([
          {
            role: "assistant",
            content:
              "Your resume has been uploaded successfully. You can now ask me questions about your resume or analyze it against a job description.",
          },
        ]);
      }
    } catch (error) {
      console.error(
        "RESUME UPLOAD ERROR:",
        error
      );

      setUploadError(
        error?.response?.data?.error?.message ||
          "Unable to upload resume."
      );
    } finally {
      setUploading(false);
    }
  };

  // ==============================
  // ANALYZE RESUME
  // ==============================

  const handleAnalyze = async () => {
    if (!resumeId || !jobDescriptionId) {
      setAnalysisError(
        "Please upload your resume and save the job description first."
      );

      return;
    }

    try {
      setAnalyzing(true);
      setAnalysisError("");
      setAnalysis(null);

      const response = await axios.post(
        "http://localhost:5000/api/analysis",
        {
          resumeId,
          jobDescriptionId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      if (data.success) {
        setAnalysis(data.analysis);

        setChatMessages([
          {
            role: "assistant",
            content:
              "Your resume analysis is ready. Ask me anything about your ATS score, matched skills, missing skills, or how to improve your resume.",
          },
        ]);
      }
    } catch (error) {
      console.error(
        "ANALYSIS ERROR:",
        error
      );

      setAnalysisError(
        error?.response?.data?.error?.message ||
          "Unable to analyze resume."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // ==============================
  // OPEN CHAT
  // ==============================

  const handleOpenChat = () => {
    setChatOpen(true);
    setChatError("");
  };

  // ==============================
  // CLOSE CHAT
  // ==============================

  const handleCloseChat = () => {
    setChatOpen(false);
  };

  // ==============================
  // SEND CHAT MESSAGE
  // ==============================

  const handleSendMessage = async () => {
    const message = chatMessage.trim();

    if (!message || chatLoading) {
      return;
    }

    if (!resumeId || !jobDescriptionId) {
      setChatError(
        "Please upload your resume and save a job description before chatting with Pepo."
      );

      return;
    }

    const userMessage = {
      role: "user",
      content: message,
    };

    const updatedMessages = [
      ...chatMessages,
      userMessage,
    ];

    setChatMessages(updatedMessages);
    setChatMessage("");
    setChatError("");
    setChatLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/chatbot",
        {
          resumeId,
          jobDescriptionId,
          analysis: analysis || {},
          message,
          conversation: updatedMessages,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      if (data.success) {
        setChatMessages([
          ...updatedMessages,
          {
            role: "assistant",
            content: data.reply,
          },
        ]);
      } else {
        throw new Error(
          data?.error?.message ||
            "Unable to get a response."
        );
      }
    } catch (error) {
      console.error(
        "CHAT ERROR:",
        error
      );

      setChatError(
        error?.response?.data?.error?.message ||
          error.message ||
          "Pepo could not respond right now."
      );
    } finally {
      setChatLoading(false);
    }
  };

  // ==============================
  // ENTER KEY
  // ==============================

  const handleChatKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* ==============================
          NAVBAR
      ============================== */}

      <nav className="border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 shadow-lg shadow-red-600/30">
              <Sparkles
                size={21}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold">
                Pepo
              </h1>

              <p className="text-xs text-gray-500">
                AI Career Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {user?.name || "User"}
              </p>

              <p className="text-xs text-gray-500">
                {user?.email || ""}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-white"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ==============================
          MAIN
      ============================== */}

      <main className="mx-auto max-w-7xl px-5 py-10">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
        >
          <div className="mb-10">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Resume{" "}
              <span className="text-red-500">
                Analysis
              </span>
            </h2>

            <p className="mt-3 max-w-2xl text-gray-400">
              Upload your resume, add a job
              description, and let Pepo analyze
              your ATS compatibility.
            </p>
          </div>

          {/* ==============================
              GRID
          ============================== */}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* RESUME CARD */}

            <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-6 shadow-2xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-red-500/10 p-3">
                  <FileText
                    size={22}
                    className="text-red-500"
                  />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Upload Resume
                  </h3>

                  <p className="text-sm text-gray-500">
                    PDF only · Maximum 5 MB
                  </p>
                </div>
              </div>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-black/40 px-6 py-10 text-center transition hover:border-red-500/50 hover:bg-red-500/5">
                <Upload
                  size={30}
                  className="mb-3 text-red-500"
                />

                <p className="font-medium">
                  {selectedFile
                    ? selectedFile.name
                    : "Choose your resume"}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Click to browse PDF files
                </p>

                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={
                    handleFileChange
                  }
                />
              </label>

              {uploadError && (
                <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  {uploadError}
                </div>
              )}

              {uploadMessage && (
                <div className="mt-4 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
                  {uploadMessage}
                </div>
              )}

              <button
                onClick={
                  handleUploadResume
                }
                disabled={
                  !selectedFile ||
                  uploading
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Upload size={18} />

                {uploading
                  ? "Uploading..."
                  : "Upload Resume"}
              </button>
            </div>

            {/* JOB DESCRIPTION */}

            <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-6 shadow-2xl">
              <JobDescription
                jobDescription={
                  jobDescription
                }
                setJobDescription={
                  setJobDescription
                }
                setJobDescriptionId={
                  setJobDescriptionId
                }
              />
            </div>
          </div>

          {/* ==============================
              ANALYZE BUTTON
          ============================== */}

          <div className="mt-6 rounded-2xl border border-white/10 bg-[#0b0b0b] p-6">
            <button
              onClick={handleAnalyze}
              disabled={
                !resumeId ||
                !jobDescriptionId ||
                analyzing
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-6 py-4 font-bold shadow-lg shadow-red-600/20 transition hover:from-red-500 hover:to-red-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Sparkles size={19} />

              {analyzing
                ? "Analyzing Resume..."
                : "Analyze Resume with Pepo"}
            </button>

            {analysisError && (
              <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {analysisError}
              </div>
            )}
          </div>

          {/* ==============================
              ANALYSIS RESULT
          ============================== */}

          {analysis && (
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mt-8"
            >
              <div className="mb-5">
                <h2 className="text-2xl font-bold">
                  Your Pepo Analysis
                </h2>

                <p className="mt-1 text-gray-500">
                  Here's how your resume aligns
                  with the job description.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {/* SCORE */}

                <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-6">
                  <p className="text-sm text-gray-500">
                    Overall Match
                  </p>

                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-5xl font-bold text-red-500">
                      {analysis.score}
                    </span>

                    <span className="mb-2 text-gray-500">
                      / 100
                    </span>
                  </div>
                </div>

                {/* MATCHED */}

                <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-6">
                  <p className="text-sm text-gray-500">
                    Matched Skills
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {analysis.matchedSkills
                      ?.length > 0 ? (
                      analysis.matchedSkills.map(
                        (skill, index) => (
                          <span
                            key={index}
                            className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs text-green-400"
                          >
                            {skill}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-sm text-gray-500">
                        No matched skills found.
                      </span>
                    )}
                  </div>
                </div>

                {/* MISSING */}

                <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-6">
                  <p className="text-sm text-gray-500">
                    Missing Skills
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {analysis.missingSkills
                      ?.length > 0 ? (
                      analysis.missingSkills.map(
                        (skill, index) => (
                          <span
                            key={index}
                            className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-400"
                          >
                            {skill}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-sm text-gray-500">
                        No major missing skills.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* SUMMARY */}

              <div className="mt-6 rounded-2xl border border-white/10 bg-[#0b0b0b] p-6">
                <h3 className="mb-3 font-semibold">
                  Summary
                </h3>

                <p className="leading-7 text-gray-400">
                  {analysis.summary}
                </p>
              </div>

              {/* STRENGTHS */}

              <div className="mt-6 rounded-2xl border border-white/10 bg-[#0b0b0b] p-6">
                <h3 className="mb-4 font-semibold">
                  Strengths
                </h3>

                <div className="space-y-3">
                  {analysis.strengths?.map(
                    (strength, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-white/5 bg-black/40 p-4 text-sm text-gray-300"
                      >
                        {strength}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* TOP FIXES */}

              <div className="mt-6 rounded-2xl border border-white/10 bg-[#0b0b0b] p-6">
                <h3 className="mb-4 font-semibold">
                  Top 3 Improvements
                </h3>

                <div className="space-y-4">
                  {analysis.topFixes?.map(
                    (fix, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-red-500/10 bg-red-500/5 p-5"
                      >
                        <div className="flex gap-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-bold">
                            {index + 1}
                          </div>

                          <div>
                            <h4 className="font-semibold">
                              {fix.title}
                            </h4>

                            <p className="mt-2 text-sm leading-6 text-gray-400">
                              {fix.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* =====================================================
          FLOATING PEPO AI CHAT BUTTON
      ===================================================== */}

      <AnimatePresence>
        {!chatOpen && (
          <motion.button
            initial={{
              opacity: 0,
              scale: 0.5,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.5,
            }}
            whileHover={{
              scale: 1.08,
            }}
            whileTap={{
              scale: 0.95,
            }}
            onClick={handleOpenChat}
            className="group fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border border-red-500/30 bg-black px-4 py-3 shadow-2xl shadow-red-600/30"
          >
            {/* Glow */}

            <span className="absolute inset-0 -z-10 animate-pulse rounded-full bg-red-600/20 blur-xl" />

            {/* Logo */}

            <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-800 shadow-lg shadow-red-600/40">
              <Bot
                size={24}
                className="text-white"
              />

              <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-black bg-green-400" />
            </span>

            <span className="pr-1 text-sm font-semibold">
              Pepo AI
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* =====================================================
          PEPO CHAT WINDOW
      ===================================================== */}

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 30,
              scale: 0.95,
            }}
            transition={{
              duration: 0.2,
            }}
            className="fixed bottom-5 right-5 z-50 flex h-[min(650px,calc(100vh-40px))] w-[min(390px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-red-500/20 bg-[#080808] shadow-2xl shadow-red-900/30"
          >
            {/* CHAT HEADER */}

            <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-red-950/60 to-black px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-800 shadow-lg shadow-red-600/30">
                  <Bot
                    size={24}
                    className="text-white"
                  />

                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#080808] bg-green-400" />
                </div>

                <div>
                  <h3 className="font-bold">
                    Pepo AI
                  </h3>

                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />

                    <span className="text-xs text-gray-400">
                      AI Career Assistant
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleCloseChat}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
                  title="Minimize Pepo"
                >
                  <Minimize2 size={17} />
                </button>

                <button
                  onClick={handleCloseChat}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* CHAT CONTEXT */}

            <div className="border-b border-white/5 bg-black/30 px-4 py-2.5">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Sparkles
                  size={13}
                  className="text-red-500"
                />

                <span>
                  Resume + Job Description +
                  ATS context
                </span>
              </div>
            </div>

            {/* CHAT MESSAGES */}

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
              {chatMessages.map(
                (message, index) => {
                  const isUser =
                    message.role === "user";

                  return (
                    <motion.div
                      key={index}
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className={`flex ${
                        isUser
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex max-w-[85%] gap-2 ${
                          isUser
                            ? "flex-row-reverse"
                            : "flex-row"
                        }`}
                      >
                        {/* Avatar */}

                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            isUser
                              ? "bg-white/10"
                              : "bg-red-600/20"
                          }`}
                        >
                          {isUser ? (
                            <span className="text-xs font-bold">
                              You
                            </span>
                          ) : (
                            <Bot
                              size={16}
                              className="text-red-500"
                            />
                          )}
                        </div>

                        {/* Message */}

                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                            isUser
                              ? "rounded-tr-sm bg-red-600 text-white"
                              : "rounded-tl-sm border border-white/10 bg-[#111111] text-gray-300"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                }
              )}

              {/* LOADING */}

              {chatLoading && (
                <motion.div
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/20">
                    <Bot
                      size={16}
                      className="text-red-500"
                    />
                  </div>

                  <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-[#111111] px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-red-500" />

                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-red-500"
                        style={{
                          animationDelay:
                            "150ms",
                        }}
                      />

                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-red-500"
                        style={{
                          animationDelay:
                            "300ms",
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* ERROR */}

            {chatError && (
              <div className="mx-4 mb-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {chatError}
              </div>
            )}

            {/* INPUT */}

            <div className="border-t border-white/10 bg-black/50 p-3">
              {!resumeId ||
              !jobDescriptionId ? (
                <div className="mb-2 rounded-lg bg-yellow-500/5 px-3 py-2 text-xs text-yellow-500">
                  Upload your resume and save a
                  job description to unlock
                  personalized Pepo responses.
                </div>
              ) : null}

              <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-[#111111] p-2 focus-within:border-red-500/50">
                <textarea
                  value={chatMessage}
                  onChange={(event) =>
                    setChatMessage(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleChatKeyDown
                  }
                  placeholder="Ask Pepo anything..."
                  rows={1}
                  className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-gray-600"
                />

                <button
                  onClick={
                    handleSendMessage
                  }
                  disabled={
                    !chatMessage.trim() ||
                    chatLoading
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Send size={17} />
                </button>
              </div>

              <p className="mt-2 text-center text-[10px] text-gray-600">
                Pepo can make mistakes. Always
                verify important information.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dashboard;