import { callAgent } from "@/lib/groq";

/**
 * Build the Recommendation Agent system prompt with language instruction
 * @param {string} language - Language code (en, hi, mr)
 * @returns {string}
 */
function getSystemPrompt(language) {
  const langInstruction = {
    en: "Respond in English.",
    hi: "Respond in Hindi. Keep JSON keys in English; only 'explanation' and human-readable text values are translated to Hindi.",
    mr: "Respond in Marathi. Keep JSON keys in English; only 'explanation' and human-readable text values are translated to Marathi.",
  };

  return `You are the Recommendation Agent for JanSahayak.

Input: JSON with eligible_schemes, conflicts, missing_documents, and profile.
Output: JSON with the final recommended scheme bundle.

${langInstruction[language] || langInstruction.en}

Output schema (strict):
{
  "final_bundle": [string],
  "explanation": string,
  "missing_documents": [string],
  "confidence": number
}

Rules:
- Start with all eligible_schemes.
- For each conflict pair, remove the lower-benefit scheme (fewer cash/benefit value, or narrower scope) — never remove both schemes in a conflicting pair.
- Maximize the number of retained, non-conflicting schemes.
- "explanation" must justify, in plain language, every scheme kept and every scheme dropped due to conflict. If the user provided specific 'goals' in their profile, explicitly mention how the recommended schemes align with their goals (e.g., "Since you are looking for business funding..."). One or two sentences is sufficient.
- Carry through the missing_documents list unchanged unless a scheme was dropped, in which case remove documents that were only required by the dropped scheme.
- Output valid JSON only. No markdown, no extra text.`;
}

/**
 * Run the Recommendation Agent
 * @param {string[]} eligibleSchemes - Scheme IDs from Eligibility Agent
 * @param {object[]} conflicts - Conflicts from Conflict Agent
 * @param {string[]} missingDocuments - Missing docs from Document Agent
 * @param {object} sanitizedProfile - Sanitized citizen profile
 * @param {string} language - Language code (en, hi, mr)
 * @returns {object} { final_bundle, explanation, missing_documents, confidence }
 */
export async function runRecommendationAgent(
  eligibleSchemes,
  conflicts,
  missingDocuments,
  sanitizedProfile,
  language = "en"
) {
  const systemPrompt = getSystemPrompt(language);

  const userMessage = JSON.stringify({
    eligible_schemes: eligibleSchemes,
    conflicts: conflicts,
    missing_documents: missingDocuments,
    profile: sanitizedProfile,
  });

  const result = await callAgent(systemPrompt, userMessage);

  if (!result) {
    return {
      final_bundle: [],
      explanation: language === "hi"
        ? "सेवा अस्थायी रूप से अनुपलब्ध है, कृपया पुनः प्रयास करें।"
        : language === "mr"
        ? "सेवा तात्पुरती अनुपलब्ध आहे, कृपया पुन्हा प्रयत्न करा."
        : "Service temporarily unavailable, please try again.",
      missing_documents: [],
      confidence: 0,
    };
  }

  return {
    final_bundle: Array.isArray(result.final_bundle) ? result.final_bundle : [],
    explanation: typeof result.explanation === "string" ? result.explanation : "",
    missing_documents: Array.isArray(result.missing_documents) ? result.missing_documents : [],
    confidence: typeof result.confidence === "number" ? result.confidence : 0,
  };
}
