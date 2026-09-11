"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import schemes from "@/data/schemes.json";
import { useLanguage } from "@/lib/i18n";

export default function ResultsPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [results, setResults] = useState(null);

  useEffect(() => {
    const storedResults = sessionStorage.getItem("jansahayak-results");
    if (!storedResults) {
      router.push("/profile");
      return;
    }
    setResults(JSON.parse(storedResults));
  }, [router]);

  if (!results) {
    return (
      <>
        <Navbar />
        <div className="form-page">
          <div className="loading-box">
            <div className="spinner"></div>
          </div>
        </div>
      </>
    );
  }

  /** Get scheme data with localized name and description */
  const getSchemeData = (schemeId) => {
    const scheme = schemes.find((s) => s.id === schemeId);
    if (!scheme) return null;

    // Pick the localized name/description, falling back to English
    const localizedName =
      language === "hi" ? scheme.name_hi || scheme.name :
      language === "mr" ? scheme.name_mr || scheme.name :
      scheme.name;

    const localizedDesc =
      language === "hi" ? scheme.description_hi || scheme.description :
      language === "mr" ? scheme.description_mr || scheme.description :
      scheme.description;

    return { ...scheme, localizedName, localizedDesc };
  };

  /** Get localized document name */
  const getDocName = (doc) => t(`documents.${doc}`) || doc.replace(/([A-Z])/g, ' $1').trim();

  const hasSchemes = results.recommended_bundle && results.recommended_bundle.length > 0;

  return (
    <>
      <Navbar />
      <div className="disclaimer-banner">
        {t("disclaimer")}
      </div>

      <div className="form-page">
        <div className="results-header">
          <h1>{t("results.title")}</h1>
          {hasSchemes ? (
            <div className="results-count">✓ {t("results.found").replace("{0}", results.recommended_bundle.length)}</div>
          ) : (
            <div className="results-count" style={{color: 'var(--navy)'}}>{t("results.no_schemes")}</div>
          )}
        </div>

        {results.needs_review && (
          <div className="review-notice">
            {t("results.low_confidence")}
          </div>
        )}

        {hasSchemes ? (
          <>
            {/* Missing Documents */}
            {results.missing_documents && results.missing_documents.length > 0 && (
              <div className="missing-docs-card">
                <h3>{t("results.docs_title")}</h3>
                <p>{t("results.docs_subtitle")}</p>
                <div className="missing-tags">
                  {results.missing_documents.map((doc) => (
                    <span className="missing-tag" key={doc}>
                      ✗ {getDocName(doc)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reasoning */}
            {results.reasoning && (
              <div className="scheme-card" style={{borderLeftColor: 'var(--navy)', marginBottom: 'var(--space-2xl)'}}>
                <h3 style={{marginBottom: 8}}>{t("results.summary_title")}</h3>
                <p>{results.reasoning}</p>
              </div>
            )}

            {/* Scheme Cards */}
            {results.recommended_bundle.map((schemeId) => {
              const scheme = getSchemeData(schemeId);
              if (!scheme) return null;

              return (
                <div className="scheme-card" key={schemeId}>
                  <div className="scheme-card-header">
                    <h3 className="scheme-title">{scheme.localizedName}</h3>
                    <span className="scheme-id-badge">{scheme.id}</span>
                  </div>

                  <p className="scheme-desc">{scheme.localizedDesc}</p>

                  <div className="scheme-meta">
                    <span className="meta-item">{t("results.benefit")}: {scheme.benefit_value}</span>
                  </div>

                  {scheme.how_to_apply && (
                    <div className="scheme-apply">
                      <strong>{t("results.process")}:</strong> {scheme.how_to_apply}
                    </div>
                  )}

                  {scheme.source_url && (
                    <a href={scheme.source_url} target="_blank" rel="noopener noreferrer" className="scheme-link">
                      {t("results.visit_portal")}
                    </a>
                  )}
                </div>
              );
            })}
          </>
        ) : (
          <div className="scheme-card" style={{borderLeftColor: 'var(--navy)'}}>
            <h3>{t("results.no_result_title")}</h3>
            <p>{results.reasoning}</p>
          </div>
        )}

        <div className="form-actions" style={{justifyContent: 'flex-start', gap: '16px'}}>
          <Link href="/profile" className="btn-primary">
            {t("results.new_eval")}
          </Link>
          <Link href="/" className="btn-back">
            {t("results.return_home")}
          </Link>
        </div>
      </div>
    </>
  );
}
