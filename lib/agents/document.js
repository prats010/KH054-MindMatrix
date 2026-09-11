import { callAgent } from "@/lib/groq";
import { getSchemeContext } from "@/lib/precheck";

const SYSTEM_PROMPT = `You are the Document Agent for JanSahayak.

Input: JSON with a list of schemes and the citizen's has_documents map.
Output: JSON listing documents the citizen still needs to acquire.

Output schema (strict):
{
  "missing_documents": [string],
  "confidence": number
}

Rules:
- For each scheme in "schemes", look up its required document list from the knowledge base.
- Take the union of all required documents across all schemes.
- Subtract any document where has_documents[doc] == true.
- Do not duplicate document names in the output.
- If a scheme's document requirements are not found in the knowledge base, exclude that scheme's requirements and lower confidence — do not guess.
- Output valid JSON only. No markdown, no extra text.`;

/**
 * Run the Document Agent
 * @param {string[]} schemes - Scheme IDs to check documents for
 * @param {object} hasDocuments - Map of document name → boolean
 * @returns {object} { missing_documents, confidence }
 */
export async function runDocumentAgent(schemes, hasDocuments) {
  const schemeContext = getSchemeContext(schemes);

  const userMessage = JSON.stringify({
    schemes: schemes,
    profile: { has_documents: hasDocuments },
    scheme_knowledge_base: JSON.parse(schemeContext),
  });

  const result = await callAgent(SYSTEM_PROMPT, userMessage);

  if (!result) {
    return {
      missing_documents: [],
      confidence: 0,
    };
  }

  return {
    missing_documents: Array.isArray(result.missing_documents) ? result.missing_documents : [],
    confidence: typeof result.confidence === "number" ? result.confidence : 0,
  };
}
