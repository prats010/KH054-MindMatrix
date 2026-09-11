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
          Government of India | Ministry of Citizen Empowerment
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
          JanSahayak
        </Link>

        <div className="nav-links">
          <Link href="/" className="nav-link">Schemes</Link>
          <Link href="/profile" className="nav-link">Eligibility Check</Link>
          <Link href="#" className="nav-link">Grievance</Link>
          
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

          <Link href="#" className="nav-link btn-login">Login</Link>
        </div>
      </nav>
    </header>
  );
}
