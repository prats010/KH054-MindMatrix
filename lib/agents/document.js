import { getSchemesData } from "@/lib/precheck";

/**
 * Document Agent — deterministic (no LLM).
 *
 * For each eligible scheme, look up its required_documents array from
 * schemes.json, take the union, subtract documents the user already has,
 * and return the missing set.
 *
 * This was previously an LLM call, but document-matching is a pure set
 * operation — using an LLM introduced hallucinated documents like
 * "DeathCert" for a living farmer. Deterministic code is both faster
 * and 100% accurate here.
 *
 * @param {string[]} schemeIds - Scheme IDs from Eligibility Agent
 * @param {object} hasDocuments - Map of document name → boolean
 * @returns {{ missing_documents: string[], confidence: number }}
 */
export async function runDocumentAgent(schemeIds, hasDocuments) {
  const schemes = getSchemesData(schemeIds);

  // Build the union of all required documents across eligible schemes
  const allRequired = new Set();
  for (const scheme of schemes) {
    if (Array.isArray(scheme.required_documents)) {
      for (const doc of scheme.required_documents) {
        allRequired.add(doc);
      }
    }
  }

  // Subtract documents the user already has
  const missing = [];
  for (const doc of allRequired) {
    if (!hasDocuments || !hasDocuments[doc]) {
      missing.push(doc);
    }
  }

  return {
    missing_documents: missing,
    confidence: 1.0, // Deterministic — always fully confident
  };
}
