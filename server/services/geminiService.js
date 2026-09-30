const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const analyzeResume = async (resumeText, jobDescription) => {
  const prompt = `
You are Pepo, an AI-powered resume analysis assistant.

Analyze the candidate's resume against the provided job description.

IMPORTANT RULES:

1. Only use information actually present in the resume.
2. Do not invent skills, experience, projects, education, certifications, or achievements.
3. Do not make hiring decisions.
4. Give a match score from 0 to 100.
5. Identify skills clearly present in both the resume and job description.
6. Identify important skills from the job description that are missing from the resume.
7. Identify genuine strengths of the resume for this particular job.
8. Provide exactly 3 important resume improvements.
9. The improvements must be practical and specific.
10. Return ONLY valid JSON.
11. Do NOT use Markdown code fences.
12. Do NOT write \`\`\`json.
13. Do NOT write any explanation before or after the JSON.

Return exactly this structure:

{
  "score": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "strengths": [],
  "topFixes": [
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
  ],
  "summary": ""
}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}
`;

  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `Gemini analysis attempt ${attempt}/${maxRetries}`
      );

      const interaction = await ai.interactions.create({
        model: "gemini-3.5-flash",
        input: prompt,
      });

      const text = interaction.output_text;

      if (!text) {
        throw new Error(
          "Gemini returned an empty response."
        );
      }

      console.log("\nRAW GEMINI RESPONSE:");
      console.log(text);

      /*
       * Gemini may sometimes return:
       *
       * ```json
       * {
       *   ...
       * }
       * ```
       *
       * JSON.parse() cannot parse the Markdown code fences.
       * So we remove them before parsing.
       */

      let cleanedText = text.trim();

      // Remove opening ```json
      cleanedText = cleanedText.replace(
        /^```json\s*/i,
        ""
      );

      // Remove opening ```
      cleanedText = cleanedText.replace(
        /^```\s*/,
        ""
      );

      // Remove closing ```
      cleanedText = cleanedText.replace(
        /\s*```$/i,
        ""
      );

      cleanedText = cleanedText.trim();

      console.log("\nCLEANED GEMINI RESPONSE:");
      console.log(cleanedText);

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

      /*
       * Validate the structure returned by Gemini.
       */

      if (
        typeof analysis.score !== "number" ||
        !Array.isArray(analysis.matchedSkills) ||
        !Array.isArray(analysis.missingSkills) ||
        !Array.isArray(analysis.strengths) ||
        !Array.isArray(analysis.topFixes) ||
        typeof analysis.summary !== "string"
      ) {
        console.error(
          "\nINVALID ANALYSIS STRUCTURE:"
        );

        console.error(analysis);

        throw new Error(
          "Gemini returned an unexpected analysis format."
        );
      }

      /*
       * Make sure the score stays between 0 and 100.
       */

      analysis.score = Math.max(
        0,
        Math.min(100, analysis.score)
      );

      /*
       * Make sure Pepo receives exactly 3 fixes.
       */

      if (analysis.topFixes.length < 3) {
        throw new Error(
          "Gemini returned fewer than 3 resume improvements."
        );
      }

      /*
       * Keep only the first 3 fixes.
       */

      analysis.topFixes =
        analysis.topFixes.slice(0, 3);

      console.log(
        "\nGEMINI ANALYSIS SUCCESSFUL"
      );

      console.log(
        `Score: ${analysis.score}`
      );

      return analysis;
    } catch (error) {
      console.error(
        `\nGemini attempt ${attempt} failed:`,
        error.message
      );

      /*
       * Retry temporary API errors.
       */

      if (
        (error.status === 503 ||
          error.status === 429 ||
          error.status === 500) &&
        attempt < maxRetries
      ) {
        const delay =
          2000 * Math.pow(2, attempt - 1);

        console.log(
          `Retrying Gemini in ${
            delay / 1000
          } seconds...`
        );

        await sleep(delay);

        continue;
      }

      /*
       * If this is the final attempt,
       * return a clean error to the controller.
       */

      if (attempt === maxRetries) {
        throw new Error(
          "Unable to analyze resume with Gemini."
        );
      }

      /*
       * Retry other errors as well if attempts remain.
       */

      const delay =
        2000 * Math.pow(2, attempt - 1);

      console.log(
        `Retrying Gemini in ${
          delay / 1000
        } seconds...`
      );

      await sleep(delay);
    }
  }

  throw new Error(
    "Unable to analyze resume with Gemini."
  );
};

module.exports = {
  analyzeResume,
};