"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import schemes from "@/data/schemes.json";

export default function ResultsPage() {
  const router = useRouter();
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

  const getSchemeData = (schemeId) => schemes.find((s) => s.id === schemeId);
  const hasSchemes = results.recommended_bundle && results.recommended_bundle.length > 0;

  return (
    <>
      <Navbar />
      <div className="disclaimer-banner">
        ⚠️ This is an AI-powered tool, not official government advice. Verify critical eligibility with authorized department portals.
      </div>

      <div className="form-page">
        <div className="results-header">
          <h1>Eligibility Results</h1>
          {hasSchemes ? (
            <div className="results-count">✓ Found {results.recommended_bundle.length} eligible schemes</div>
          ) : (
            <div className="results-count" style={{color: 'var(--navy)'}}>No matching schemes found.</div>
          )}
        </div>

        {results.needs_review && (
          <div className="review-notice">
            ⚠️ Low confidence match — we recommend consulting a local CSC centre or NGO caseworker for verification.
          </div>
        )}

        {hasSchemes ? (
          <>
            {/* Missing Documents */}
            {results.missing_documents && results.missing_documents.length > 0 && (
              <div className="missing-docs-card">
                <h3>Documents Required Before Applying</h3>
                <p>Please collect the following missing documents to ensure successful application.</p>
                <div className="missing-tags">
                  {results.missing_documents.map((doc) => (
                    <span className="missing-tag" key={doc}>
                      ✗ {doc.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reasoning */}
            {results.reasoning && (
              <div className="scheme-card" style={{borderLeftColor: 'var(--navy)', marginBottom: 'var(--space-2xl)'}}>
                <h3 style={{marginBottom: 8}}>Automated Evaluation Summary</h3>
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
                    <h3 className="scheme-title">{scheme.name}</h3>
                    <span className="scheme-id-badge">{scheme.id}</span>
                  </div>

                  <p className="scheme-desc">{scheme.description}</p>

                  <div className="scheme-meta">
                    <span className="meta-item">Benefit: {scheme.benefit_value}</span>
                  </div>

                  {scheme.how_to_apply && (
                    <div className="scheme-apply">
                      <strong>Process:</strong> {scheme.how_to_apply}
                    </div>
                  )}

                  {scheme.source_url && (
                    <a href={scheme.source_url} target="_blank" rel="noopener noreferrer" className="scheme-link">
                      Access Official Portal →
                    </a>
                  )}
                </div>
              );
            })}
          </>
        ) : (
          <div className="scheme-card" style={{borderLeftColor: 'var(--navy)'}}>
            <h3>Evaluation Summary</h3>
            <p>{results.reasoning}</p>
          </div>
        )}

        <div className="form-actions" style={{justifyContent: 'flex-start', gap: '16px'}}>
          <Link href="/profile" className="btn-primary">
            Start New Evaluation
          </Link>
          <Link href="/" className="btn-back">
            Return to Home
          </Link>
        </div>
      </div>
    </>
  );
}
