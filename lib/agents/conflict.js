import { callAgent } from "@/lib/groq";
import { getSchemeContext } from "@/lib/precheck";

const SYSTEM_PROMPT = `You are the Conflict Agent for JanSahayak.

Input: JSON with eligible_schemes and profile.
Output: JSON listing pairs of schemes that cannot be held simultaneously.

Output schema (strict):
{
  "conflicts": [ { "schemes": [string, string], "reason": string } ],
  "confidence": number
}

Rules:
- Flag a conflict ONLY if:
  a) the scheme's official documentation states mutual exclusion with another named scheme, OR
  b) both schemes serve an identical core purpose (e.g. two separate pension schemes, two separate housing subsidies) and combining them is disallowed by policy.
- Cite the specific exclusion clause or overlap reason in "reason". Do not guess based on scheme category alone.
- An empty conflicts array is a valid, common output.
- Use the mutual_exclusions field in the scheme knowledge base to identify conflicts.
- Output valid JSON only. No markdown, no extra text.`;

/**
 * Run the Conflict Agent
 * @param {string[]} eligibleSchemes - Scheme IDs from Eligibility Agent
 * @param {object} sanitizedProfile - Sanitized citizen profile
 * @returns {object} { conflicts, confidence }
 */
export async function runConflictAgent(eligibleSchemes, sanitizedProfile) {
  const schemeContext = getSchemeContext(eligibleSchemes);

  const userMessage = JSON.stringify({
    eligible_schemes: eligibleSchemes,
    profile: sanitizedProfile,
    scheme_knowledge_base: JSON.parse(schemeContext),
  });

  const result = await callAgent(SYSTEM_PROMPT, userMessage);

  if (!result) {
    return {
      conflicts: [],
      confidence: 0,
    };
  }

  return {
    conflicts: Array.isArray(result.conflicts) ? result.conflicts : [],
    confidence: typeof result.confidence === "number" ? result.confidence : 0,
  };
}
