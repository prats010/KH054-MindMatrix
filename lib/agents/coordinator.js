import { runEligibilityAgent } from "@/lib/agents/eligibility";
import { runConflictAgent } from "@/lib/agents/conflict";
import { runDocumentAgent } from "@/lib/agents/document";
import { runRecommendationAgent } from "@/lib/agents/recommendation";
import { preCheckSchemes } from "@/lib/precheck";
import { sanitizeProfile, validateProfile } from "@/lib/sanitize";

/**
 * Coordinator Agent — orchestrates the full pipeline.
 *
 * Flow:
 * 1. Validate + sanitize profile
 * 2. Run precheck filters (rule-based, no LLM)
 * 3. Eligibility Agent (LLM)
 * 4. Conflict Agent + Document Agent (LLM, parallel)
 * 5. Recommendation Agent (LLM)
 * 6. Aggregate and return final response
 *
 * @param {object} profile - Raw citizen profile from the API request
 * @param {string} language - Language code (en, hi, mr)
 * @returns {object} Final recommendation response
 */
export async function runPipeline(profile, language = "en") {
  // Step 0: Validate input
  const validation = validateProfile(profile);
  if (!validation.valid) {
    return {
      recommended_bundle: [],
      reasoning:
        language === "hi"
          ? `प्रोफ़ाइल में आवश्यक जानकारी गायब है: ${validation.missingFields.join(", ")}। कृपया सभी आवश्यक फ़ील्ड भरें।`
          : language === "mr"
          ? `प्रोफाइलमध्ये आवश्यक माहिती गहाळ आहे: ${validation.missingFields.join(", ")}. कृपया सर्व आवश्यक फील्ड भरा.`
          : `Missing required profile fields: ${validation.missingFields.join(", ")}. Please complete all required fields.`,
      missing_documents: [],
      confidence: 0,
      needs_review: true,
    };
  }

  // Step 1: Sanitize profile data
  const { rawProfile, sanitizedProfile } = sanitizeProfile(profile);

  // Step 2: Rule-based precheck (no LLM cost)
  const preCheckedSchemeIds = preCheckSchemes(rawProfile);

  if (preCheckedSchemeIds.length === 0) {
    return {
      recommended_bundle: [],
      reasoning:
        language === "hi"
          ? "आपकी प्रोफ़ाइल के आधार पर, वर्तमान में कोई योजना आपकी मूल पात्रता मानदंडों से मेल नहीं खाती। यह आपकी आयु, आय, या अन्य कारकों के कारण हो सकता है।"
          : language === "mr"
          ? "आपल्या प्रोफाइलवर आधारित, सध्या कोणतीही योजना आपल्या मूलभूत पात्रता निकषांशी जुळत नाही. हे आपले वय, उत्पन्न किंवा इतर घटकांमुळे असू शकते."
          : "Based on your profile, no schemes currently match your basic eligibility criteria. This may be due to your age, income, or other factors.",
      missing_documents: [],
      confidence: 0.9,
      needs_review: false,
    };
  }

  try {
    // Step 3: Eligibility Agent
    const eligibilityResult = await runEligibilityAgent(
      sanitizedProfile,
      preCheckedSchemeIds
    );

    if (eligibilityResult.eligible_schemes.length === 0) {
      return {
        recommended_bundle: [],
        reasoning:
          language === "hi"
            ? "विस्तृत पात्रता जांच के बाद, आपकी प्रोफ़ाइल से कोई योजना मेल नहीं खाती।"
            : language === "mr"
            ? "तपशीलवार पात्रता तपासणीनंतर, आपल्या प्रोफाइलशी कोणतीही योजना जुळत नाही."
            : "After detailed eligibility checking, no schemes matched your profile.",
        missing_documents: [],
        confidence: eligibilityResult.confidence,
        needs_review: eligibilityResult.confidence < 0.5,
      };
    }

    // Step 4: Conflict Agent + Document Agent (parallel)
    const [conflictResult, documentResult] = await Promise.all([
      runConflictAgent(eligibilityResult.eligible_schemes, sanitizedProfile),
      runDocumentAgent(
        eligibilityResult.eligible_schemes,
        sanitizedProfile.has_documents
      ),
    ]);

    // Step 5: Recommendation Agent
    const recommendationResult = await runRecommendationAgent(
      eligibilityResult.eligible_schemes,
      conflictResult.conflicts,
      documentResult.missing_documents,
      sanitizedProfile,
      language
    );

    // Step 6: Aggregate final response
    const minConfidence = Math.min(
      eligibilityResult.confidence,
      conflictResult.confidence,
      documentResult.confidence,
      recommendationResult.confidence
    );

    return {
      recommended_bundle: recommendationResult.final_bundle,
      reasoning: recommendationResult.explanation,
      missing_documents: recommendationResult.missing_documents,
      confidence: recommendationResult.confidence,
      needs_review: minConfidence < 0.5,
      // Extra metadata for the results page
      _meta: {
        pre_checked_count: preCheckedSchemeIds.length,
        eligible_count: eligibilityResult.eligible_schemes.length,
        conflicts_found: conflictResult.conflicts.length,
        eligible_schemes: eligibilityResult.eligible_schemes,
        explanations: eligibilityResult.explanations,
        conflicts: conflictResult.conflicts,
      },
    };
  } catch (error) {
    console.error("Pipeline error:", error);
    return {
      recommended_bundle: [],
      reasoning:
        language === "hi"
          ? "सेवा अस्थायी रूप से अनुपलब्ध है, कृपया पुनः प्रयास करें।"
          : language === "mr"
          ? "सेवा तात्पुरती अनुपलब्ध आहे, कृपया पुन्हा प्रयत्न करा."
          : "Service temporarily unavailable, please try again.",
      missing_documents: [],
      confidence: 0,
      needs_review: true,
    };
  }
}
