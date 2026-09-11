const fs = require('fs');
const path = require('path');
const { getGroqClient } = require('../groq');

// We use dynamic import for transformers
let extractor = null;

async function getExtractor() {
  if (!extractor) {
    const { pipeline } = await import('@xenova/transformers');
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
}

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Global cache for vector store
let vectorStoreCache = null;
function getVectorStore() {
  if (!vectorStoreCache) {
    const vsPath = path.join(process.cwd(), 'data/vector_store.json');
    if (fs.existsSync(vsPath)) {
      vectorStoreCache = JSON.parse(fs.readFileSync(vsPath, 'utf-8'));
    } else {
      vectorStoreCache = { documents: [], embeddings: [] };
    }
  }
  return vectorStoreCache;
}

async function retrieveRelevantGuidelines(profileText, topK = 5) {
  const vectorStore = getVectorStore();
  if (vectorStore.documents.length === 0) return ""; // No guidelines ingested yet

  const extract = await getExtractor();
  const output = await extract(profileText, { pooling: 'mean', normalize: true });
  const queryEmbedding = Array.from(output.data);

  // Calculate similarities
  const scoredDocs = vectorStore.documents.map((doc, index) => {
    const similarity = cosineSimilarity(queryEmbedding, vectorStore.embeddings[index]);
    return { ...doc, score: similarity };
  });

  // Sort descending and take top K
  scoredDocs.sort((a, b) => b.score - a.score);
  const topDocs = scoredDocs.slice(0, topK);

  let contextString = "--- OFFICIAL LEGAL GUIDELINES (RAG CONTEXT) ---\n";
  for (const doc of topDocs) {
    contextString += `[Scheme: ${doc.schemeId}]\n${doc.text}\n\n`;
  }
  contextString += "----------------------------------------------\n";

  return contextString;
}

/**
 * Validates a user's profile against a set of pre-checked schemes.
 * Uses RAG (Retrieval-Augmented Generation) to ground the evaluation in real PDF text.
 */
async function evaluateEligibility(profile, schemes) {
  if (!schemes || schemes.length === 0) return [];

  // Generate a text summary of the profile to use as the embedding query
  const profileSummary = `I am a ${profile.age} year old ${profile.gender} living in ${profile.state}. ` +
    `My occupation is ${profile.occupation} and annual income is ₹${profile.income}. ` +
    (profile.is_farmer ? "I am a landholding farmer. " : "I am not a farmer. ") +
    (profile.is_disabled ? "I have a certified disability. " : "");

  // Perform RAG Retrieval
  const legalContext = await retrieveRelevantGuidelines(profileSummary);

  const groq = getGroqClient();
  
  const systemPrompt = `You are a strict Indian Government Scheme Evaluator.
You must determine which of the candidate schemes the user is fully eligible for.

USER PROFILE:
${JSON.stringify(profile, null, 2)}

CANDIDATE SCHEMES:
${JSON.stringify(schemes.map(s => ({ id: s.id, name: s.name, rules: s.eligibility_rules })), null, 2)}

${legalContext}

INSTRUCTIONS:
1. Cross-reference the user profile with the Candidate Schemes.
2. If official legal guidelines are provided in the RAG Context above, give them highest priority. Do not assume rules not stated.
3. Return ONLY a pure JSON array of scheme IDs the user is eligible for. Example: ["PM-KISAN", "AYUSHMAN-BHARAT"]
4. If eligible for none, return []. Do not include markdown formatting or explanation.`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'system', content: systemPrompt }],
    model: 'openai/gpt-oss-120b',
    temperature: 0.1,
  });

  try {
    const rawResult = completion.choices[0].message.content.trim();
    // Clean up potential markdown blocks
    const cleanResult = rawResult.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanResult);
  } catch (e) {
    console.error("Failed to parse eligibility output:", completion.choices[0].message.content);
    // Fallback: return pre-checked schemes if parsing fails to avoid catastrophic failure
    return schemes.map(s => s.id);
  }
}

module.exports = { evaluateEligibility };
