"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export default function Navbar() {
  const { language, changeLanguage, t, languages } = useLanguage();

  return (
    <header>
      {/* Government Utility Strip */}
      <div className="header-top-strip">
        <div className="strip-left">
          {t("nav.gov_strip")}
        </div>
        <div className="strip-right">
          <span>A- | A | A+</span>
          <span>High Contrast</span>
          <span>🇮🇳</span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar" id="navbar">
        <Link href="/" className="navbar-brand">
          <span className="brand-emblem"></span>
          {t("app_name")}
        </Link>

        <div className="nav-links">
          <Link href="/" className="nav-link">{t("nav.schemes")}</Link>
          <Link href="/profile" className="nav-link">{t("nav.eligibility")}</Link>
          <Link href="#" className="nav-link">{t("nav.grievance")}</Link>
          
          <select 
            value={language} 
            onChange={(e) => changeLanguage(e.target.value)}
            style={{ 
              background: 'transparent', 
              color: 'white', 
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            {Object.entries(languages).map(([code, name]) => (
              <option key={code} value={code} style={{color: '#000'}}>{name}</option>
            ))}
          </select>
        </div>
      </nav>
    </header>
  );
}
