import schemes from "@/data/schemes.json";

/**
 * Rule-based pre-check filters.
 * Runs BEFORE any LLM call — cheaper, faster, and more reliable for hard cutoffs.
 * Returns the set of scheme IDs that pass basic arithmetic/boolean checks.
 *
 * @param {object} profile - Raw profile with exact income value
 * @returns {string[]} Array of scheme IDs that pass pre-checks
 */
export function preCheckSchemes(profile) {
  const { age, gender, income, is_farmer, is_disabled, category, occupation, education } = profile;

  return schemes
    .filter((scheme) => {
      const rules = scheme.eligibility_rules;

      // Age checks
      if (rules.min_age != null && (age == null || age < rules.min_age)) {
        return false;
      }
      if (rules.max_age != null && (age == null || age > rules.max_age)) {
        return false;
      }

      // Income check (hard cutoff)
      if (rules.max_income != null && income != null && income > rules.max_income) {
        return false;
      }

      // Gender check
      if (rules.gender != null && gender != null && rules.gender !== gender) {
        return false;
      }

      // Farmer check
      if (rules.is_farmer === true && !is_farmer) {
        return false;
      }

      // Disability check
      if (rules.is_disabled === true && !is_disabled) {
        return false;
      }

      // Category check (e.g., SC/ST only schemes)
      if (rules.category != null && Array.isArray(rules.category)) {
        if (category && !rules.category.includes(category)) {
          return false;
        }
        if (!category) {
          // If category is required but not provided, exclude (conservative)
          return false;
        }
      }

      // Occupation check
      if (rules.occupation != null && Array.isArray(rules.occupation)) {
        if (occupation && !rules.occupation.includes(occupation)) {
          return false;
        }
        if (!occupation) {
          return false;
        }
      }

      // Education check
      if (rules.education != null && Array.isArray(rules.education)) {
        if (education && !rules.education.includes(education)) {
          return false;
        }
        if (!education) {
          return false;
        }
      }

      return true;
    })
    .map((scheme) => scheme.id);
}

/**
 * Get scheme data by ID from the knowledge base
 * @param {string} schemeId
 * @returns {object|null}
 */
export function getSchemeById(schemeId) {
  return schemes.find((s) => s.id === schemeId) || null;
}

/**
 * Get all schemes data for a list of IDs
 * @param {string[]} schemeIds
 * @returns {object[]}
 */
export function getSchemesData(schemeIds) {
  return schemeIds
    .map((id) => getSchemeById(id))
    .filter(Boolean);
}

/**
 * Get the full scheme knowledge base as a context string for LLM agents
 * @param {string[]} schemeIds - Optional filter to only include specific schemes
 * @returns {string}
 */
export function getSchemeContext(schemeIds = null) {
  const relevantSchemes = schemeIds
    ? schemes.filter((s) => schemeIds.includes(s.id))
    : schemes;

  return JSON.stringify(
    relevantSchemes.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      benefit_type: s.benefit_type,
      benefit_value: s.benefit_value,
      eligibility_rules: s.eligibility_rules,
      required_documents: s.required_documents,
      mutual_exclusions: s.mutual_exclusions,
    })),
    null,
    2
  );
}
