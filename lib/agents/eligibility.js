import { callAgent } from "@/lib/groq";
import { getSchemeContext, getSchemesData } from "@/lib/precheck";
import fs from "fs";
import path from "path";

// ── Local Vector Store (RAG) ─────────────────────────────────────────
let vectorStoreCache = null;

function getVectorStore() {
  if (!vectorStoreCache) {
    const vsPath = path.join(process.cwd(), "data/vector_store.json");
    try {
      if (fs.existsSync(vsPath)) {
        vectorStoreCache = JSON.parse(fs.readFileSync(vsPath, "utf-8"));
      }
    } catch {
      // Silently fall back — RAG is optional
    }
    if (!vectorStoreCache) {
      vectorStoreCache = { documents: [], embeddings: [] };
    }
  }
  return vectorStoreCache;
}

function cosineSimilarity(vecA, vecB) {
  let dot = 0, nA = 0, nB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    nA  += vecA[i] * vecA[i];
    nB  += vecB[i] * vecB[i];
  }
  return nA && nB ? dot / (Math.sqrt(nA) * Math.sqrt(nB)) : 0;
}

/**
 * Retrieve top-K relevant guideline chunks from the local vector store.
 * If @xenova/transformers is not available or the store is empty,
 * gracefully returns "" so the pipeline still works without RAG.
 */
async function retrieveGuidelines(profileText, topK = 5) {
  const store = getVectorStore();
  if (store.documents.length === 0) return "";

  try {
    const { pipeline } = await import("@xenova/transformers");
    const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    const output = await extractor(profileText, { pooling: "mean", normalize: true });
    const qVec = Array.from(output.data);

    const scored = store.documents
      .map((doc, i) => ({ ...doc, score: cosineSimilarity(qVec, store.embeddings[i]) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    let ctx = "--- OFFICIAL LEGAL GUIDELINES (RAG CONTEXT) ---\n";
    for (const d of scored) ctx += `[Scheme: ${d.schemeId}]\n${d.text}\n\n`;
    ctx += "----------------------------------------------\n";
    return ctx;
  } catch {
    // @xenova/transformers not installed or model download failed — skip RAG
    return "";
  }
}

// ── System Prompt ────────────────────────────────────────────────────
function buildSystemPrompt(profile, schemeContext, ragContext) {
  return `You are the Eligibility Agent for JanSahayak.

Input: JSON with profile and a knowledge base of candidate schemes.
Output: JSON listing scheme IDs the citizen is eligible for, with per-scheme explanations.

Output schema (strict):
{
  "eligible_schemes": [string],
  "explanations": { "<scheme_id>": string },
  "confidence": number
}

Rules:
- For EACH candidate scheme, evaluate every eligibility rule against the profile.
- If a rule field is null in the scheme, it means "no restriction" — do not reject the user.
- If the profile field is missing or empty for a non-null rule, be conservative and exclude.
- A scheme passes ONLY if ALL non-null rules are satisfied.
- "explanations" must contain one sentence per scheme explaining why it was included or excluded.
- "confidence" is your overall confidence in the evaluation (0-1).
- Output valid JSON only. No markdown, no extra text.

${ragContext}

SCHEME KNOWLEDGE BASE:
${schemeContext}`;
}

/**
 * Eligibility Agent — evaluates the sanitized profile against pre-checked schemes.
 * Uses optional RAG context from the local vector store.
 *
 * @param {object} sanitizedProfile
 * @param {string[]} preCheckedSchemeIds
 * @returns {{ eligible_schemes: string[], explanations: object, confidence: number }}
 */
export async function runEligibilityAgent(sanitizedProfile, preCheckedSchemeIds) {
  const schemeContext = getSchemeContext(preCheckedSchemeIds);

  // Build a natural-language summary for RAG retrieval
  const profileText =
    `${sanitizedProfile.age} year old ${sanitizedProfile.gender} in ${sanitizedProfile.state}, ` +
    `occupation ${sanitizedProfile.occupation}, income bracket ${sanitizedProfile.income_bracket}, ` +
    `farmer: ${sanitizedProfile.is_farmer}, disabled: ${sanitizedProfile.is_disabled}`;

  const ragContext = await retrieveGuidelines(profileText);

  const systemPrompt = buildSystemPrompt(sanitizedProfile, schemeContext, ragContext);

  const userMessage = JSON.stringify({
    profile: sanitizedProfile,
    candidate_scheme_ids: preCheckedSchemeIds,
  });

  const result = await callAgent(systemPrompt, userMessage);

  if (!result) {
    return {
      eligible_schemes: [],
      explanations: {},
      confidence: 0,
    };
  }

  return {
    eligible_schemes: Array.isArray(result.eligible_schemes) ? result.eligible_schemes : [],
    explanations: result.explanations || {},
    confidence: typeof result.confidence === "number" ? result.confidence : 0,
  };
}
