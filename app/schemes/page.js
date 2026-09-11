"use client";

import Navbar from "@/components/Navbar";
import { useLanguage } from "@/lib/i18n";
import schemes from "@/data/schemes.json";
import { useState } from "react";

const TAG_FILTERS = [
  "All",
  "Agriculture & Farming",
  "Business & Entrepreneurship",
  "Healthcare & Medical",
  "Education & Scholarships",
  "Housing & Shelter",
  "Pensions & Social Security"
];

export default function SchemesPage() {
  const { language, t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const getName = (s) =>
    language === "hi" ? s.name_hi || s.name :
    language === "mr" ? s.name_mr || s.name :
    s.name;

  const getDesc = (s) =>
    language === "hi" ? s.description_hi || s.description :
    language === "mr" ? s.description_mr || s.description :
    s.description;

  const filtered = schemes.filter((s) => {
    // Tag filter
    if (activeFilter !== "All") {
      const tags = s.tags || [];
      if (!tags.includes(activeFilter)) return false;
    }
    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const name = getName(s).toLowerCase();
      const desc = getDesc(s).toLowerCase();
      if (!name.includes(q) && !desc.includes(q) && !s.id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const filterLabel = (f) => {
    if (f === "All") return language === "hi" ? "सभी" : language === "mr" ? "सर्व" : "All";
    return t(`goals.${f}`);
  };

  return (
    <>
      <Navbar />

      <div className="form-page">
        <div className="results-header">
          <h1>{language === "hi" ? "सभी सरकारी योजनाएं" : language === "mr" ? "सर्व सरकारी योजना" : "All Government Schemes"}</h1>
          <div className="results-count">
            {language === "hi" ? `${filtered.length} योजनाएं उपलब्ध` : language === "mr" ? `${filtered.length} योजना उपलब्ध` : `${filtered.length} schemes available`}
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "var(--space-lg)" }}>
          <input
            type="text"
            className="form-input"
            placeholder={language === "hi" ? "योजना खोजें..." : language === "mr" ? "योजना शोधा..." : "Search schemes..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", maxWidth: 500 }}
          />
        </div>

        {/* Tag Filters */}
        <div className="missing-tags" style={{ marginBottom: "var(--space-xl)", flexWrap: "wrap", gap: 8 }}>
          {TAG_FILTERS.map((f) => (
            <button
              key={f}
              className={activeFilter === f ? "btn-primary" : "btn-back"}
              onClick={() => setActiveFilter(f)}
              style={{ fontSize: "0.85rem", padding: "6px 14px", borderRadius: 4, cursor: "pointer" }}
            >
              {filterLabel(f)}
            </button>
          ))}
        </div>

        {/* Scheme Cards */}
        {filtered.map((scheme) => (
          <div className="scheme-card" key={scheme.id} style={{ marginBottom: "var(--space-lg)" }}>
            <div className="scheme-card-header">
              <h3 className="scheme-title">{getName(scheme)}</h3>
              <span className="scheme-id-badge">{scheme.id}</span>
            </div>

            <p className="scheme-desc">{getDesc(scheme)}</p>

            <div className="scheme-meta">
              <span className="meta-item">
                {language === "hi" ? "लाभ" : language === "mr" ? "लाभ" : "Benefit"}: {scheme.benefit_value}
              </span>
              <span className="meta-item" style={{ marginLeft: 16 }}>
                {language === "hi" ? "प्रकार" : language === "mr" ? "प्रकार" : "Type"}: {scheme.benefit_type}
              </span>
            </div>

            {/* Eligibility Rules */}
            <div style={{ margin: "var(--space-md) 0", padding: "var(--space-md)", background: "var(--cream)", borderRadius: 4 }}>
              <strong>{language === "hi" ? "पात्रता नियम:" : language === "mr" ? "पात्रता नियम:" : "Eligibility Rules:"}</strong>
              <ul style={{ marginTop: 8, paddingLeft: 20, fontSize: "0.9rem", lineHeight: 1.7 }}>
                {scheme.eligibility_rules.min_age && (
                  <li>{language === "hi" ? "न्यूनतम आयु" : language === "mr" ? "किमान वय" : "Minimum Age"}: {scheme.eligibility_rules.min_age}</li>
                )}
                {scheme.eligibility_rules.max_age && (
                  <li>{language === "hi" ? "अधिकतम आयु" : language === "mr" ? "कमाल वय" : "Maximum Age"}: {scheme.eligibility_rules.max_age}</li>
                )}
                {scheme.eligibility_rules.max_income && (
                  <li>{language === "hi" ? "अधिकतम आय" : language === "mr" ? "कमाल उत्पन्न" : "Max Income"}: ₹{scheme.eligibility_rules.max_income.toLocaleString()}</li>
                )}
                {scheme.eligibility_rules.gender && (
                  <li>{language === "hi" ? "लिंग" : language === "mr" ? "लिंग" : "Gender"}: {scheme.eligibility_rules.gender}</li>
                )}
                {scheme.eligibility_rules.category && (
                  <li>{language === "hi" ? "श्रेणी" : language === "mr" ? "प्रवर्ग" : "Category"}: {Array.isArray(scheme.eligibility_rules.category) ? scheme.eligibility_rules.category.join(", ") : scheme.eligibility_rules.category}</li>
                )}
                {scheme.eligibility_rules.occupation && (
                  <li>{language === "hi" ? "व्यवसाय" : language === "mr" ? "व्यवसाय" : "Occupation"}: {Array.isArray(scheme.eligibility_rules.occupation) ? scheme.eligibility_rules.occupation.join(", ") : scheme.eligibility_rules.occupation}</li>
                )}
                {scheme.eligibility_rules.is_farmer === true && (
                  <li>{language === "hi" ? "किसान होना आवश्यक" : language === "mr" ? "शेतकरी असणे आवश्यक" : "Must be a farmer"}</li>
                )}
                {scheme.eligibility_rules.is_disabled === true && (
                  <li>{language === "hi" ? "विकलांगता आवश्यक" : language === "mr" ? "अपंगत्व आवश्यक" : "Disability required"}</li>
                )}
              </ul>
            </div>

            {/* Required Documents */}
            {scheme.required_documents && scheme.required_documents.length > 0 && (
              <div style={{ marginBottom: "var(--space-md)" }}>
                <strong>{language === "hi" ? "आवश्यक दस्तावेज़:" : language === "mr" ? "आवश्यक कागदपत्रे:" : "Required Documents:"}</strong>
                <div className="missing-tags" style={{ marginTop: 8 }}>
                  {scheme.required_documents.map((doc) => (
                    <span className="missing-tag" key={doc} style={{ background: "var(--cream)", color: "var(--navy)", borderColor: "var(--navy)" }}>
                      {t(`documents.${doc}`)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {scheme.how_to_apply && (
              <div className="scheme-apply">
                <strong>{language === "hi" ? "प्रक्रिया" : language === "mr" ? "प्रक्रिया" : "Process"}:</strong> {scheme.how_to_apply}
              </div>
            )}

            {scheme.source_url && (
              <a href={scheme.source_url} target="_blank" rel="noopener noreferrer" className="scheme-link">
                {t("results.visit_portal")}
              </a>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
