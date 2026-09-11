"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

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
  "AgeCert", "DisabilityCert", "ExServiceCert", "DeathCert"
];

export default function ProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [profile, setProfile] = useState({
    age: 30,
    gender: "",
    state: "",
    income: 100000,
    occupation: "",
    education: "",
    category: "",
    is_farmer: false,
    is_disabled: false,
    has_documents: {},
  });

  const updateField = useCallback((field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
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
        body: JSON.stringify({ profile, language: "en" }),
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
    "1. Personal Details",
    "2. Economic Details",
    "3. Category & Status",
    "4. Documents"
  ];

  const progressWidth = `${((step + 1) / 4) * 100}%`;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="form-page">
          <div className="loading-box">
            <div className="spinner"></div>
            <h2>Processing your application...</h2>
            <p>Evaluating criteria against central and state gazettes.</p>
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
          <div className="stepper-header">Step {step + 1} of 4: {stepLabels[step].substring(3)}</div>
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
            <p>Please provide accurate details to evaluate relevant welfare schemes.</p>
          </div>

          <div className="form-body">
            {step === 0 && <StepPersonal profile={profile} updateField={updateField} errors={errors} />}
            {step === 1 && <StepEconomic profile={profile} updateField={updateField} errors={errors} />}
            {step === 2 && <StepCategory profile={profile} updateField={updateField} />}
            {step === 3 && <StepDocuments profile={profile} toggleDocument={toggleDocument} />}
          </div>

          {/* Actions */}
          <div className="form-actions">
            {step < 3 ? (
              <button className="btn-primary" onClick={nextStep}>Continue to Step {step + 2} →</button>
            ) : (
              <button className="btn-primary" onClick={handleSubmit}>Submit & Find Schemes</button>
            )}
            
            {step > 0 && (
              <button className="btn-back" onClick={prevStep}>← Back</button>
            )}
          </div>
          
          <div className="form-trust">
            🔒 Your data is not stored. All checks are executed strictly in-browser under DPDP privacy standards.
          </div>
        </div>
      </div>
    </>
  );
}

/* ======== STEP COMPONENTS ======== */

function StepPersonal({ profile, updateField, errors }) {
  return (
    <>
      <div className="form-group">
        <label className="form-label">Age as per official records</label>
        <span className="form-helper">Requires minimum 18 or 60 years for specific schemes.</span>
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
        <label className="form-label">Gender Identity {errors.gender && <span style={{color: 'red'}}>*</span>}</label>
        <div className="radio-group">
          {["Male", "Female", "Other / Transgender"].map((g) => (
            <label key={g} className="radio-card">
              <input 
                type="radio" 
                name="gender" 
                checked={profile.gender === (g.includes("Other") ? "Other" : g)}
                onChange={() => updateField("gender", g.includes("Other") ? "Other" : g)} 
              />
              <div className="radio-label">{g}</div>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">State of Residence {errors.state && <span style={{color: 'red'}}>*</span>}</label>
        <select
          className="form-select"
          value={profile.state}
          onChange={(e) => updateField("state", e.target.value)}
        >
          <option value="">-- Select your state or territory --</option>
          {STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </>
  );
}

function StepEconomic({ profile, updateField, errors }) {
  return (
    <>
      <div className="form-group">
        <label className="form-label">Annual Family Income (₹)</label>
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
        <label className="form-label">Primary Occupation {errors.occupation && <span style={{color: 'red'}}>*</span>}</label>
        <select
          className="form-select"
          value={profile.occupation}
          onChange={(e) => updateField("occupation", e.target.value)}
        >
          <option value="">-- Select occupation --</option>
          {OCCUPATIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Education Level</label>
        <select
          className="form-select"
          value={profile.education}
          onChange={(e) => updateField("education", e.target.value)}
        >
          <option value="">-- Select education --</option>
          {EDUCATION_LEVELS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>
    </>
  );
}

function StepCategory({ profile, updateField }) {
  return (
    <>
      <div className="form-group">
        <label className="form-label">Social Category</label>
        <select
          className="form-select"
          value={profile.category}
          onChange={(e) => updateField("category", e.target.value)}
        >
          <option value="">-- Select category --</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Are you a registered farmer?</label>
        <div className="radio-group">
          <label className="radio-card">
            <input type="radio" name="farmer" checked={profile.is_farmer === true} onChange={() => updateField("is_farmer", true)} />
            <div className="radio-label">Yes</div>
          </label>
          <label className="radio-card">
            <input type="radio" name="farmer" checked={profile.is_farmer === false} onChange={() => updateField("is_farmer", false)} />
            <div className="radio-label">No</div>
          </label>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Do you have a certified disability (40%+)?</label>
        <div className="radio-group">
          <label className="radio-card">
            <input type="radio" name="disability" checked={profile.is_disabled === true} onChange={() => updateField("is_disabled", true)} />
            <div className="radio-label">Yes</div>
          </label>
          <label className="radio-card">
            <input type="radio" name="disability" checked={profile.is_disabled === false} onChange={() => updateField("is_disabled", false)} />
            <div className="radio-label">No</div>
          </label>
        </div>
      </div>
    </>
  );
}

function StepDocuments({ profile, toggleDocument }) {
  return (
    <div className="form-group">
      <label className="form-label">Available Documents</label>
      <span className="form-helper">Select the documents you currently possess.</span>
      <div className="doc-grid">
        {DOCUMENTS.map((doc) => (
          <label key={doc} className="doc-label">
            <input 
              type="checkbox" 
              checked={!!profile.has_documents[doc]} 
              onChange={() => toggleDocument(doc)} 
            />
            <span>{doc.replace(/([A-Z])/g, ' $1').trim()}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
