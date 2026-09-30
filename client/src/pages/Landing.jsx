import { motion } from "framer-motion";
import { ArrowRight, Bot, FileText, Sparkles } from "lucide-react";

function Landing() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 font-bold">
            P
          </div>

          <span className="text-xl font-bold tracking-wide">
            Pepo
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
  href="/login"
  className="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:text-white"
>
  Login
</a>

          <a
  href="/signup"
  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-500"
>
  Get Started
</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 md:px-12 md:py-32">
        {/* Background glow */}
        <div className="pointer-events-none absolute left-1/2 top-10 h-96 w-96 -translate-x-1/2 rounded-full bg-red-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-4 py-2 text-sm text-red-400"
          >
            <Sparkles size={16} />
            AI-Powered Resume Assistant
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl font-black tracking-tight md:text-7xl"
          >
            Make your resume
            <span className="block text-red-500">
              job-ready.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400"
          >
            Upload your resume, add a job description, and let Pepo
            analyze your match, identify missing skills, and tell you
            the most important improvements to make.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <button className="group flex items-center gap-2 rounded-xl bg-red-600 px-7 py-4 font-semibold transition duration-300 hover:-translate-y-1 hover:bg-red-500 hover:shadow-[0_0_35px_rgba(239,68,68,0.35)]">
              Analyze My Resume
              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            </button>

            <button className="rounded-xl border border-white/10 px-7 py-4 font-semibold text-gray-300 transition hover:border-red-500/50 hover:text-white">
              Learn More
            </button>
          </motion.div>
        </div>

        {/* Feature cards */}
        <div className="relative mx-auto mt-20 grid max-w-5xl gap-5 md:grid-cols-3">
          <FeatureCard
            icon={<FileText size={22} />}
            title="Resume Analysis"
            description="Upload your PDF and let Pepo understand your resume."
            delay={0.4}
          />

          <FeatureCard
            icon={<Sparkles size={22} />}
            title="AI Recommendations"
            description="Get the top 3 improvements that matter most for the job."
            delay={0.5}
          />

          <FeatureCard
            icon={<Bot size={22} />}
            title="AI Assistant"
            description="Chat with Pepo about your resume and job description."
            delay={0.6}
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, description, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -6 }}
      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-red-500/40 hover:bg-red-500/[0.03]"
    >
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-500 transition group-hover:bg-red-500 group-hover:text-white">
        {icon}
      </div>

      <h3 className="mb-2 text-lg font-semibold">
        {title}
      </h3>

      <p className="text-sm leading-6 text-gray-400">
        {description}
      </p>
    </motion.div>
  );
}

export default Landing;