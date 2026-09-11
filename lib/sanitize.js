/**
 * Data Sanitization Layer
 *
 * Converts raw citizen profile data into a sanitized version safe for LLM consumption.
 * - Converts exact income to bracket strings
 * - Strips PII (name, Aadhaar number, phone, address, DOB)
 * - Only sends boolean flags for documents, never document numbers
 */

const INCOME_BRACKETS = [
  { max: 100000, label: "0-100000" },
  { max: 200000, label: "100001-200000" },
  { max: 300000, label: "200001-300000" },
  { max: 500000, label: "300001-500000" },
  { max: 800000, label: "500001-800000" },
  { max: 1200000, label: "800001-1200000" },
  { max: Infinity, label: "1200001+" },
];

/**
 * Convert exact income to a bracket string
 * @param {number} income - Annual income in INR
 * @returns {string} Income bracket label
 */
function incomeToBracket(income) {
  if (income == null || isNaN(income)) return "unknown";
  for (const bracket of INCOME_BRACKETS) {
    if (income <= bracket.max) return bracket.label;
  }
  return "1200001+";
}

/**
 * Sanitize profile data before sending to LLM agents.
 * Keeps exact income for server-side precheck, returns a separate sanitized version for LLM.
 *
 * @param {object} profile - Raw citizen profile from the form
 * @returns {object} { rawProfile, sanitizedProfile }
 */
export function sanitizeProfile(profile) {
  // Fields explicitly allowed for LLM consumption
  const sanitizedProfile = {
    age: profile.age ?? null,
    gender: profile.gender ?? null,
    state: profile.state ?? null,
    income_bracket: incomeToBracket(profile.income),
    occupation: profile.occupation ?? null,
    education: profile.education ?? null,
    category: profile.category ?? null,
    is_farmer: profile.is_farmer ?? false,
    is_disabled: profile.is_disabled ?? false,
    has_documents: {},
  };

  // Only send boolean flags for documents and goals
  if (profile.has_documents && typeof profile.has_documents === "object") {
    for (const [docName, value] of Object.entries(profile.has_documents)) {
      sanitizedProfile.has_documents[docName] = Boolean(value);
    }
  }

  sanitizedProfile.goals = [];
  if (profile.goals && typeof profile.goals === "object") {
    for (const [goalName, value] of Object.entries(profile.goals)) {
      if (value) sanitizedProfile.goals.push(goalName);
    }
  }

  // Raw profile retains exact income for server-side precheck filters
  const rawProfile = {
    ...profile,
    // Explicitly strip any PII fields that might accidentally be sent
    name: undefined,
    aadhaar_number: undefined,
    phone: undefined,
    address: undefined,
    dob: undefined,
    email: undefined,
  };

  return { rawProfile, sanitizedProfile };
}

/**
 * Validate that a profile has all required fields for pipeline processing.
 * @param {object} profile - Raw profile data
 * @returns {{ valid: boolean, missingFields: string[] }}
 */
export function validateProfile(profile) {
  const requiredFields = ["age", "gender", "state", "income", "occupation"];
  const missingFields = [];

  for (const field of requiredFields) {
    if (profile[field] == null || profile[field] === "") {
      missingFields.push(field);
    }
  }

  if (typeof profile.age === "number" && profile.age < 0) {
    missingFields.push("age (invalid)");
  }

  if (typeof profile.income === "number" && profile.income < 0) {
    missingFields.push("income (invalid)");
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}
