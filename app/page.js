"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/lib/i18n";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <h1>Find Government Schemes You Are Eligible For</h1>
          <p>
            An official public welfare discovery portal powered by AI. Check your eligibility across 12+ Central and State welfare programs with zero Aadhaar data storage.
          </p>
          
          <div className="hero-actions">
            <Link href="/profile" className="btn-primary">
              Check Eligibility Now →
            </Link>
            <Link href="#" className="btn-secondary">
              Browse All Schemes
            </Link>
          </div>
          
          <div className="trust-badges">
            <span>✓ 100% Free Public Service</span>
            <span>✓ No Login Required</span>
            <span>✓ Screen Reader Friendly</span>
          </div>
        </div>
      </section>

      {/* Info Grid */}
      <section className="info-section">
        <div className="info-container">
          <div className="info-grid">
            <div className="info-card">
              <h3>Instant AI Matching</h3>
              <p>Automated criteria check against age, income, and landholding rules with verified gazette criteria.</p>
            </div>
            <div className="info-card">
              <h3>12+ Verified Schemes</h3>
              <p>Direct linkage to active Central and State schemes including PM-KISAN, Ayushman Bharat, and scholarships.</p>
            </div>
            <div className="info-card">
              <h3>100% Privacy Preserved</h3>
              <p>Data stays on your device, zero biometric or PII storage, strictly compliant with DPDP guidelines.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="stats-band">
        <div className="stats-grid">
          <div>
            <div className="stat-val">₹18K+ Cr</div>
            <div className="stat-label">Welfare Subsidies Tracked</div>
          </div>
          <div>
            <div className="stat-val">12+</div>
            <div className="stat-label">Active Central & State Schemes</div>
          </div>
          <div>
            <div className="stat-val">36</div>
            <div className="stat-label">States & UTs Supported</div>
          </div>
          <div>
            <div className="stat-val">100%</div>
            <div className="stat-label">Free & Open Access</div>
          </div>
        </div>
      </section>
    </>
  );
}
