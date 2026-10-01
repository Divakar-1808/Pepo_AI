const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const analyzeResume = async (
  resumeText,
  jobDescription
) => {
  const prompt = `
You are Pepo, an AI-powered resume analysis assistant.

Your task is to analyze a candidate's resume against a specific job description.

The analysis must be based ONLY on information actually present in the resume and job description.

IMPORTANT RULES:

1. Never invent skills, experience, projects, education, certifications, achievements, or technologies.
2. Do not assume that the candidate knows a technology just because it is related to another technology.
3. If a skill is not explicitly present in the resume, treat it as missing.
4. Do not make hiring decisions.
5. Do not guarantee interviews or employment.
6. Evaluate the resume specifically against THIS job description.
7. Consider both exact keywords and meaningful contextual matches.
8. Do not reward keyword stuffing.
9. Consider ATS compatibility, resume structure, skills alignment, experience alignment, and job-specific keywords.
10. Give scores from 0 to 100.
11. Return exactly 3 practical resume improvements.
12. Every improvement must be based on an actual gap or opportunity found in the resume/JD.
13. Do not tell the candidate to add a skill unless the resume actually shows evidence that they have that skill.
14. If the candidate does not have a required skill, recommend gaining that skill or demonstrating relevant existing experience rather than falsely adding it.
15. Return ONLY valid JSON.
16. Do NOT use Markdown.
17. Do NOT use code fences.
18. Do NOT write any explanation before or after the JSON.

SCORING:

overallScore:
Overall alignment between the resume and the job description.

atsScore:
How compatible the resume is with ATS systems based on structure, clarity, standard sections, formatting, and job-relevant terminology.

keywordMatchScore:
How well important keywords and concepts from the job description are represented in the resume.

skillsMatchScore:
How well the candidate's explicitly stated skills match the skills required by the job description.

experienceMatchScore:
How well the candidate's explicitly stated projects, work, academic, or practical experience aligns with the responsibilities of the job.

structureScore:
How clear, organized, readable, and ATS-friendly the resume structure is.

IMPORTANT:
Do not automatically give high scores.
Scores must reflect the actual resume and job description.

KEYWORD RULES:

matchedKeywords:
Include important job-description keywords that are clearly present in the resume.

missingKeywords:
Include important job-description keywords that are absent from the resume.

Do not include every word from the job description.
Focus on meaningful technical skills, tools, responsibilities, qualifications, and domain terminology.

ATS ISSUES:

List concrete ATS or resume-formatting problems only if they are actually visible from the resume text.

STRENGTHS:

List genuine strengths supported by the resume and relevant to this job.

TOP FIXES:

Return exactly 3 objects.

Each object must contain:
- title
- explanation

The explanation must clearly explain what the candidate should improve and why it matters for this particular job.

SUMMARY:

Write a concise explanation of how the resume currently aligns with the job description.

Return EXACTLY this JSON structure:

{
  "overallScore": 0,
  "atsScore": 0,
  "keywordMatchScore": 0,
  "skillsMatchScore": 0,
  "experienceMatchScore": 0,
  "structureScore": 0,

  "summary": "",

  "matchedKeywords": [],

  "missingKeywords": [],

  "strengths": [],

  "atsIssues": [],

  "top3Fixes": [
    {
      "title": "",
      "explanation": ""
    },
    {
      "title": "",
      "explanation": ""
    },
    {
      "title": "",
      "explanation": ""
    }
  ]
}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}
`;

  const maxRetries = 3;

  for (
    let attempt = 1;
    attempt <= maxRetries;
    attempt++
  ) {
    try {
      console.log(
        `Gemini analysis attempt ${attempt}/${maxRetries}`
      );

      const interaction =
        await ai.interactions.create({
          model: "gemini-3.5-flash",
          input: prompt,
        });

      const text = interaction.output_text;

      if (!text) {
        throw new Error(
          "Gemini returned an empty response."
        );
      }

      console.log(
        "\nRAW GEMINI RESPONSE:"
      );
      console.log(text);

      // ----------------------------------------
      // CLEAN GEMINI RESPONSE
      // ----------------------------------------

      let cleanedText = text.trim();

      cleanedText = cleanedText.replace(
        /^```json\s*/i,
        ""
      );

      cleanedText = cleanedText.replace(
        /^```\s*/,
        ""
      );

      cleanedText = cleanedText.replace(
        /\s*```$/i,
        ""
      );

      cleanedText = cleanedText.trim();

      console.log(
        "\nCLEANED GEMINI RESPONSE:"
      );
      console.log(cleanedText);

      // ----------------------------------------
      // PARSE JSON
      // ----------------------------------------

      let analysis;

      try {
        analysis = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error(
          "\nGEMINI JSON PARSE ERROR:",
          parseError.message
        );

        console.error(
          "\nINVALID GEMINI OUTPUT:"
        );

        console.error(cleanedText);

        throw new Error(
          "Gemini returned invalid JSON."
        );
      }

      // ----------------------------------------
      // VALIDATE SCORE FIELDS
      // ----------------------------------------

      const scoreFields = [
        "overallScore",
        "atsScore",
        "keywordMatchScore",
        "skillsMatchScore",
        "experienceMatchScore",
        "structureScore",
      ];

      for (const field of scoreFields) {
        if (
          typeof analysis[field] !== "number"
        ) {
          throw new Error(
            `Invalid or missing score field: ${field}`
          );
        }

        analysis[field] = Math.max(
          0,
          Math.min(100, analysis[field])
        );
      }

      // ----------------------------------------
      // VALIDATE ARRAYS
      // ----------------------------------------

      const arrayFields = [
        "matchedKeywords",
        "missingKeywords",
        "strengths",
        "atsIssues",
      ];

      for (const field of arrayFields) {
        if (!Array.isArray(analysis[field])) {
          throw new Error(
            `Invalid or missing array field: ${field}`
          );
        }
      }

      // ----------------------------------------
      // VALIDATE SUMMARY
      // ----------------------------------------

      if (
        typeof analysis.summary !== "string"
      ) {
        throw new Error(
          "Invalid or missing summary."
        );
      }

      // ----------------------------------------
      // VALIDATE TOP 3 FIXES
      // ----------------------------------------

      if (
        !Array.isArray(analysis.top3Fixes)
      ) {
        throw new Error(
          "Invalid or missing top3Fixes."
        );
      }

      if (analysis.top3Fixes.length < 3) {
        throw new Error(
          "Gemini returned fewer than 3 fixes."
        );
      }

      analysis.top3Fixes =
        analysis.top3Fixes
          .slice(0, 3)
          .map((fix) => ({
            title:
              typeof fix.title === "string"
                ? fix.title
                : "Resume Improvement",

            explanation:
              typeof fix.explanation ===
              "string"
                ? fix.explanation
                : "",
          }));

      // ----------------------------------------
      // FINAL RESULT
      // ----------------------------------------

      console.log(
        "\nGEMINI ANALYSIS SUCCESSFUL"
      );

      console.log(
        "Overall Score:",
        analysis.overallScore
      );

      console.log(
        "ATS Score:",
        analysis.atsScore
      );

      console.log(
        "Keyword Match:",
        analysis.keywordMatchScore
      );

      console.log(
        "Skills Match:",
        analysis.skillsMatchScore
      );

      console.log(
        "Experience Match:",
        analysis.experienceMatchScore
      );

      console.log(
        "Structure Score:",
        analysis.structureScore
      );

      return analysis;
    } catch (error) {
      console.error(
        `\nGemini attempt ${attempt} failed:`,
        error.message
      );

      // ----------------------------------------
      // RETRY TEMPORARY API ERRORS
      // ----------------------------------------

      if (
        (
          error.status === 503 ||
          error.status === 429 ||
          error.status === 500
        ) &&
        attempt < maxRetries
      ) {
        const delay =
          2000 *
          Math.pow(2, attempt - 1);

        console.log(
          `Retrying Gemini in ${
            delay / 1000
          } seconds...`
        );

        await sleep(delay);

        continue;
      }

      // ----------------------------------------
      // RETRY OTHER ERRORS
      // ----------------------------------------

      if (attempt < maxRetries) {
        const delay =
          2000 *
          Math.pow(2, attempt - 1);

        console.log(
          `Retrying Gemini in ${
            delay / 1000
          } seconds...`
        );

        await sleep(delay);

        continue;
      }

      throw new Error(
        "Unable to analyze resume with Gemini."
      );
    }
  }

  throw new Error(
    "Unable to analyze resume with Gemini."
  );
};

module.exports = {
  analyzeResume,
};