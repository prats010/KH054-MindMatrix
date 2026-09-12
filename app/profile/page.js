"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/lib/i18n";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const OCCUPATIONS = [
  "Farmer", "Labourer", "Student", "Self-Employed", "Salaried",
  "Domestic Worker", "Street Vendor", "Rickshaw Puller",
  "Construction Worker", "Fisherman", "Unemployed", "Retired", "Other"
];

const EDUCATION_LEVELS = [
  "None", "Primary", "Secondary", "Higher Secondary",
  "UG", "PG", "Professional", "Other"
];

const CATEGORIES = ["General", "SC", "ST", "OBC", "EWS"];

const DOCUMENTS = [
  "Aadhaar", "BankAccount", "LandProof", "IncomeCert",
  "BPLCard", "RationCard", "CasteCert", "CollegeID",
  "AgeCert", "DisabilityCert", "ExServiceCert", "DeathCert",
  "BirthCert", "MCHCard", "AddressProof", "PANCard",
  "BusinessProof", "EducationCert", "ProjectReport"
];

const GOALS = [
  "Agriculture & Farming",
  "Business & Entrepreneurship",
  "Healthcare & Medical",
  "Education & Scholarships",
  "Housing & Shelter",
  "Pensions & Social Security",
  "Women & Children",
  "Financial Services"
];

export default function ProfilePage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [profile, setProfile] = useState({
    age: 25,
    gender: "",
    state: "",
    income: 100000,
    occupation: "",
    education: "",
    category: "",
    is_farmer: false,
    is_disabled: false,
    has_documents: {},
    goals: {},
  });

  const updateField = useCallback((field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleDocument = useCallback((doc) => {
    setProfile((prev) => ({
      ...prev,
      has_documents: {
        ...prev.has_documents,
        [doc]: !prev.has_documents[doc],
      },
    }));
  }, []);

  const toggleGoal = useCallback((goal) => {
    setProfile((prev) => ({
      ...prev,
      goals: {
        ...prev.goals,
        [goal]: !prev.goals[goal],
      },
    }));
  }, []);

  const validateStep = () => {
    const newErrors = {};
    if (step === 0) {
      if (!profile.gender) newErrors.gender = true;
      if (!profile.state) newErrors.state = true;
    }
    if (step === 1) {
      if (!profile.occupation) newErrors.occupation = true;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, 3));
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, language }),
      });
      const data = await res.json();
      sessionStorage.setItem("jansahayak-results", JSON.stringify(data));
      sessionStorage.setItem("jansahayak-profile", JSON.stringify(profile));
      router.push("/results");
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
      alert("Something went wrong. Please try again.");
    }
  };

  const stepLabels = [
    `1. ${t("steps.personal")}`,
    `2. ${t("steps.economic")}`,
    `3. ${t("steps.category")}`,
    `4. ${t("steps.documents")}`
  ];

  const progressWidth = `${((step + 1) / 4) * 100}%`;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="form-page">
          <div className="loading-box">
            <div className="spinner"></div>
            <h2>{t("form.processing")}</h2>
            <p>{t("form.processing_sub")}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="form-page">
        {/* Stepper */}
        <div className="stepper">
          <div className="stepper-header">{t("form.step_of").replace("{0}", step + 1)} {stepLabels[step].substring(3)}</div>
          <div className="stepper-track">
            <div className="stepper-fill" style={{ width: progressWidth }}></div>
          </div>
          <div className="stepper-labels">
            {stepLabels.map((label, i) => (
              <span key={i} className={i === step ? "active" : ""}>{label}</span>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="form-container">
          <div className="form-header">
            <h2>{stepLabels[step].substring(3)}</h2>
            <p>{t("form.form_subtitle")}</p>
          </div>

          <div className="form-body">
            {step === 0 && <StepPersonal profile={profile} updateField={updateField} toggleGoal={toggleGoal} errors={errors} t={t} />}
            {step === 1 && <StepEconomic profile={profile} updateField={updateField} errors={errors} t={t} />}
            {step === 2 && <StepCategory profile={profile} updateField={updateField} t={t} />}
            {step === 3 && <StepDocuments profile={profile} toggleDocument={toggleDocument} t={t} />}
          </div>

          {/* Actions */}
          <div className="form-actions">
            {step < 3 ? (
              <button className="btn-primary" onClick={nextStep}>{t("form.continue").replace("{0}", step + 2)}</button>
            ) : (
              <button className="btn-primary" onClick={handleSubmit}>{t("form.submit")}</button>
            )}
            
            {step > 0 && (
              <button className="btn-back" onClick={prevStep}>{t("form.back")}</button>
            )}
          </div>
          
          <div className="form-trust">
            {t("form.privacy_note")}
          </div>
        </div>
      </div>
    </>
  );
}

/* ======== STEP COMPONENTS ======== */

function StepPersonal({ profile, updateField, toggleGoal, errors, t }) {
  return (
    <>
      <div className="form-group">
        <label className="form-label">{t("form.goals_label")}</label>
        <span className="form-helper">{t("form.goals_helper")}</span>
        <div className="doc-grid">
          {GOALS.map((goal) => (
            <label key={goal} className="doc-label">
              <input 
                type="checkbox" 
                checked={!!profile.goals[goal]} 
                onChange={() => toggleGoal(goal)} 
              />
              <span>{t(`goals.${goal}`)}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">{t("form.age")}</label>
        <span className="form-helper">{t("form.age_helper")}</span>
        <div className="slider-container">
          <input
            type="number"
            className="form-input"
            style={{ width: '100px' }}
            value={profile.age}
            onChange={(e) => updateField("age", parseInt(e.target.value))}
          />
          <input
            type="range"
            className="form-slider"
            min="1"
            max="100"
            value={profile.age}
            onChange={(e) => updateField("age", parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t("form.gender")} {errors.gender && <span style={{color: 'red'}}>*</span>}</label>
        <div className="radio-group">
          {[
            { value: "Male", label: t("form.male") },
            { value: "Female", label: t("form.female") },
            { value: "Other", label: t("form.other") }
          ].map((g) => (
            <label key={g.value} className="radio-card">
              <input 
                type="radio" 
                name="gender" 
                checked={profile.gender === g.value}
                onChange={() => updateField("gender", g.value)} 
              />
              <div className="radio-label">{g.label}</div>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t("form.state")} {errors.state && <span style={{color: 'red'}}>*</span>}</label>
        <select
          className="form-select"
          value={profile.state}
          onChange={(e) => updateField("state", e.target.value)}
        >
          <option value="">{t("form.select_state")}</option>
          {STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </>
  );
}

function StepEconomic({ profile, updateField, errors, t }) {
  return (
    <>
      <div className="form-group">
        <label className="form-label">{t("form.income")}</label>
        <div className="slider-container">
          <input
            type="number"
            className="form-input"
            style={{ width: '150px' }}
            value={profile.income}
            onChange={(e) => updateField("income", parseInt(e.target.value))}
          />
          <input
            type="range"
            className="form-slider"
            min="0"
            max="2000000"
            step="10000"
            value={profile.income}
            onChange={(e) => updateField("income", parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t("form.occupation")} {errors.occupation && <span style={{color: 'red'}}>*</span>}</label>
        <select
          className="form-select"
          value={profile.occupation}
          onChange={(e) => updateField("occupation", e.target.value)}
        >
          <option value="">{t("form.select_occupation")}</option>
          {OCCUPATIONS.map((o) => (
            <option key={o} value={o}>{t(`occupations.${o}`)}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">{t("form.education")}</label>
        <select
          className="form-select"
          value={profile.education}
          onChange={(e) => updateField("education", e.target.value)}
        >
          <option value="">{t("form.select_education")}</option>
          {EDUCATION_LEVELS.map((e) => (
            <option key={e} value={e}>{t(`education_levels.${e}`)}</option>
          ))}
        </select>
      </div>
    </>
  );
}

function StepCategory({ profile, updateField, t }) {
  return (
    <>
      <div className="form-group">
        <label className="form-label">{t("form.category")}</label>
        <select
          className="form-select"
          value={profile.category}
          onChange={(e) => updateField("category", e.target.value)}
        >
          <option value="">{t("form.select_category")}</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{t(`categories.${c}`)}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">{t("form.is_farmer")}</label>
        <div className="radio-group">
          <label className="radio-card">
            <input type="radio" name="farmer" checked={profile.is_farmer === true} onChange={() => updateField("is_farmer", true)} />
            <div className="radio-label">{t("form.yes")}</div>
          </label>
          <label className="radio-card">
            <input type="radio" name="farmer" checked={profile.is_farmer === false} onChange={() => updateField("is_farmer", false)} />
            <div className="radio-label">{t("form.no")}</div>
          </label>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t("form.is_disabled")}</label>
        <div className="radio-group">
          <label className="radio-card">
            <input type="radio" name="disability" checked={profile.is_disabled === true} onChange={() => updateField("is_disabled", true)} />
            <div className="radio-label">{t("form.yes")}</div>
          </label>
          <label className="radio-card">
            <input type="radio" name="disability" checked={profile.is_disabled === false} onChange={() => updateField("is_disabled", false)} />
            <div className="radio-label">{t("form.no")}</div>
          </label>
        </div>
      </div>
    </>
  );
}

function StepDocuments({ profile, toggleDocument, t }) {
  return (
    <div className="form-group">
      <label className="form-label">{t("form.documents_label")}</label>
      <span className="form-helper">{t("form.documents_helper")}</span>
      <div className="doc-grid">
        {DOCUMENTS.map((doc) => (
          <label key={doc} className="doc-label">
            <input 
              type="checkbox" 
              checked={!!profile.has_documents[doc]} 
              onChange={() => toggleDocument(doc)} 
            />
            <span>{t(`documents.${doc}`)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
