"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import en from "@/data/i18n/en.json";
import hi from "@/data/i18n/hi.json";
import mr from "@/data/i18n/mr.json";

const translations = { en, hi, mr };

const LANGUAGE_NAMES = {
  en: "English",
  hi: "हिन्दी",
  mr: "मराठी",
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("jansahayak-lang");
    if (saved && translations[saved]) {
      setLanguage(saved);
    }
  }, []);

  const changeLanguage = useCallback((lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem("jansahayak-lang", lang);
    }
  }, []);

  const t = useCallback(
    (key) => {
      const keys = key.split(".");
      let value = translations[language];
      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = value[k];
        } else {
          // Fallback to English
          let fallback = translations.en;
          for (const fk of keys) {
            if (fallback && typeof fallback === "object" && fk in fallback) {
              fallback = fallback[fk];
            } else {
              return key; // Return key as-is if not found
            }
          }
          return fallback;
        }
      }
      return value;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
        languages: LANGUAGE_NAMES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
