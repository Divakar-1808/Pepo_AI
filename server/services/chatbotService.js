const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const chatWithPepo = async ({
  resumeText,
  jobDescription,
  analysis,
  message,
  conversation = [],
}) => {
  const systemInstruction = `
You are Pepo, an intelligent AI career assistant.

Your job is to help the user with ANY question related to their career,
job search, resume, learning, technical skills, interviews, and professional
development.

You are NOT only an ATS analyzer.

You can help with:

- Resume writing
- Resume improvement
- ATS optimization
- Job descriptions
- Job applications
- Career preparation
- Interview preparation
- Technical skills
- Programming
- AI and Machine Learning
- Web development
- Learning roadmaps
- Professional summaries
- Resume bullet points
- Cover letters
- LinkedIn profiles
- Portfolio projects
- Project ideas
- Career development
- Explaining technical concepts
- Comparing technologies or skills
- Interview questions
- Interview answers
- Learning plans

GENERAL BEHAVIOR:

1. Understand the user's question before answering.

2. If the question is general, answer it normally.
   Do NOT force the answer to be about the user's resume.

3. If the question is about the user's resume, use the provided resume.

4. If the question is about a specific job, use the provided job description.

5. If the question is about ATS optimization, use the provided ATS analysis.

6. If the user asks to improve or rewrite something from their resume,
   preserve the user's real experience.

7. NEVER invent:
   - Work experience
   - Skills
   - Projects
   - Certifications
   - Education
   - Achievements
   - Job titles
   - Responsibilities

8. If information is missing from the resume, clearly say that it is
   not demonstrated in the resume.

9. If the user asks whether they should learn a missing skill, explain:
   - What the skill is
   - Why it may matter for the target job
   - What they should learn
   - How they can start learning it

10. If the user asks for interview preparation, create a practical plan
    based on the job description when one is available.

11. If the user asks for interview questions, generate questions relevant
    to the target role and job description.

12. If the user asks for a cover letter, use only truthful information
    from the resume and job description.

13. If the user asks to rewrite a resume section, make it clear and
    ATS-friendly while keeping the original facts truthful.

14. If the user asks a technical question, explain it clearly at the
    appropriate level.

15. If the user asks a programming question, provide useful examples
    when appropriate.

16. If the user asks for a learning roadmap, organize it into practical
    steps.

17. If the user's question is ambiguous and you genuinely need more
    information, ask a short clarifying question.

18. Do not make hiring decisions.

19. Do not claim that any ATS will definitely accept or reject a resume.

20. Do not guarantee that a resume will get an interview or job.

21. Be honest when information is unavailable.

22. Do not pretend that the user has experience that is not present
    in the resume.

23. Keep answers clear, practical, and useful.

24. Answer the user's actual question directly.

25. You can answer general knowledge questions, but when the question
    is unrelated to career, jobs, learning, or the provided context,
    answer normally and clearly.

You are the user's AI career assistant, not just an ATS analyzer.
`;

  const prompt = `
USER RESUME:

${resumeText || "No resume has been provided."}


JOB DESCRIPTION:

${jobDescription || "No job description has been provided."}


LATEST ATS ANALYSIS:

${JSON.stringify(analysis || {}, null, 2)}


PREVIOUS CONVERSATION:

${JSON.stringify(conversation || [], null, 2)}


USER'S QUESTION:

${message}
`;

  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `Pepo chatbot attempt ${attempt}/${maxRetries}`
      );

      const interaction = await ai.interactions.create({
        model: "gemini-3.1-flash-lite",
        system_instruction: systemInstruction,
        input: prompt,
        generation_config: {
          thinking_level: "minimal",
        },
        store: false,
      });

      const reply = interaction.output_text;

      if (!reply) {
        throw new Error(
          "Pepo returned an empty response."
        );
      }

      console.log(
        "Pepo chatbot response generated successfully."
      );

      return reply.trim();
    } catch (error) {
      console.error(
        `Pepo chatbot attempt ${attempt} failed:`,
        error.message
      );

      const status =
        error?.status ||
        error?.response?.status ||
        error?.error?.code;

      const retryableErrors = [
        429,
        500,
        502,
        503,
        504,
      ];

      if (
        retryableErrors.includes(Number(status)) &&
        attempt < maxRetries
      ) {
        const delay =
          2000 * Math.pow(2, attempt - 1);

        console.log(
          `Gemini temporarily unavailable. Retrying in ${
            delay / 1000
          } seconds...`
        );

        await sleep(delay);

        continue;
      }

      if (Number(status) === 503) {
        throw new Error(
          "Pepo is temporarily unavailable. Please try again in a moment."
        );
      }

      if (Number(status) === 429) {
        throw new Error(
          "Pepo has temporarily reached its API limit. Please try again shortly."
        );
      }

      console.error(
        "PEPO API ERROR:",
        error
      );

      throw new Error(
        "Unable to get a response from Pepo."
      );
    }
  }

  throw new Error(
    "Unable to get a response from Pepo."
  );
};

module.exports = {
  chatWithPepo,
};