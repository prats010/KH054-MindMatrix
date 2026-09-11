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
          <h1>{t("hero.title")}</h1>
          <p>{t("hero.desc")}</p>
          
          <div className="hero-actions">
            <Link href="/profile" className="btn-primary">
              {t("hero.cta")}
            </Link>
            <Link href="#" className="btn-secondary">
              {t("hero.browse")}
            </Link>
          </div>
          
          <div className="trust-badges">
            <span>{t("hero.badge_free")}</span>
            <span>{t("hero.badge_login")}</span>
            <span>{t("hero.badge_a11y")}</span>
          </div>
        </div>
      </section>

      {/* Info Grid */}
      <section className="info-section">
        <div className="info-container">
          <div className="info-grid">
            <div className="info-card">
              <h3>{t("hero.card_1_title")}</h3>
              <p>{t("hero.card_1_desc")}</p>
            </div>
            <div className="info-card">
              <h3>{t("hero.card_2_title")}</h3>
              <p>{t("hero.card_2_desc")}</p>
            </div>
            <div className="info-card">
              <h3>{t("hero.card_3_title")}</h3>
              <p>{t("hero.card_3_desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="stats-band">
        <div className="stats-grid">
          <div>
            <div className="stat-val">{t("hero.stat_1_val")}</div>
            <div className="stat-label">{t("hero.stat_1_label")}</div>
          </div>
          <div>
            <div className="stat-val">{t("hero.stat_2_val")}</div>
            <div className="stat-label">{t("hero.stat_2_label")}</div>
          </div>
          <div>
            <div className="stat-val">{t("hero.stat_3_val")}</div>
            <div className="stat-label">{t("hero.stat_3_label")}</div>
          </div>
          <div>
            <div className="stat-val">{t("hero.stat_4_val")}</div>
            <div className="stat-label">{t("hero.stat_4_label")}</div>
          </div>
        </div>
      </section>
    </>
  );
}
