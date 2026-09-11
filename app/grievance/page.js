"use client";

import Navbar from "@/components/Navbar";
import { useLanguage } from "@/lib/i18n";
import { useState } from "react";

const GRIEVANCE_TYPES = {
  en: ["Scheme application rejected", "Benefits not received", "Document verification issue", "Portal/website issue", "Agent misconduct", "Other"],
  hi: ["योजना आवेदन अस्वीकृत", "लाभ प्राप्त नहीं हुआ", "दस्तावेज़ सत्यापन समस्या", "पोर्टल/वेबसाइट समस्या", "एजेंट दुर्व्यवहार", "अन्य"],
  mr: ["योजना अर्ज नाकारला", "लाभ मिळाला नाही", "कागदपत्र सत्यापन समस्या", "पोर्टल/वेबसाइट समस्या", "एजंट गैरवर्तन", "इतर"]
};

export default function GrievancePage() {
  const { language } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    district: "",
    state: "",
    type: "",
    scheme: "",
    description: "",
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Generate a mock reference ID (no backend)
    const id = "GRV-" + Date.now().toString(36).toUpperCase();
    setRefId(id);
    setSubmitted(true);
  };

  const labels = {
    en: {
      title: "File a Grievance",
      subtitle: "If you are facing issues with any government scheme, submit your complaint here. Your grievance will be forwarded to the appropriate department.",
      name: "Full Name",
      phone: "Phone Number",
      district: "District",
      state: "State",
      type: "Grievance Type",
      select_type: "-- Select grievance type --",
      scheme: "Related Scheme (optional)",
      scheme_placeholder: "e.g., PM-KISAN, Ayushman Bharat",
      description: "Describe your issue in detail",
      desc_placeholder: "Explain the problem you are facing, include dates and reference numbers if available...",
      submit: "Submit Grievance",
      success_title: "Grievance Submitted Successfully",
      success_msg: "Your grievance has been registered. Please save your reference number for tracking.",
      ref_label: "Reference Number",
      track_note: "You can track this grievance on the CPGRAMS portal (pgportal.gov.in) or contact your nearest CSC centre.",
      new_grievance: "File Another Grievance",
      disclaimer: "⚠️ This is a demonstration portal. In production, grievances would be routed to the Central Public Grievance Redress and Monitoring System (CPGRAMS).",
    },
    hi: {
      title: "शिकायत दर्ज करें",
      subtitle: "यदि आपको किसी सरकारी योजना में समस्या हो रही है, तो यहां अपनी शिकायत दर्ज करें। आपकी शिकायत संबंधित विभाग को भेजी जाएगी।",
      name: "पूरा नाम",
      phone: "फ़ोन नंबर",
      district: "जिला",
      state: "राज्य",
      type: "शिकायत का प्रकार",
      select_type: "-- शिकायत प्रकार चुनें --",
      scheme: "संबंधित योजना (वैकल्पिक)",
      scheme_placeholder: "उदा., PM-KISAN, आयुष्मान भारत",
      description: "अपनी समस्या का विस्तार से वर्णन करें",
      desc_placeholder: "आप जिस समस्या का सामना कर रहे हैं उसे समझाएं, उपलब्ध होने पर तिथियां और संदर्भ संख्या शामिल करें...",
      submit: "शिकायत दर्ज करें",
      success_title: "शिकायत सफलतापूर्वक दर्ज",
      success_msg: "आपकी शिकायत पंजीकृत हो गई है। ट्रैकिंग के लिए कृपया अपना संदर्भ नंबर सहेजें।",
      ref_label: "संदर्भ संख्या",
      track_note: "आप इस शिकायत को CPGRAMS पोर्टल (pgportal.gov.in) पर ट्रैक कर सकते हैं या अपने निकटतम CSC केंद्र से संपर्क करें।",
      new_grievance: "एक और शिकायत दर्ज करें",
      disclaimer: "⚠️ यह एक प्रदर्शन पोर्टल है। उत्पादन में, शिकायतें केंद्रीय लोक शिकायत निवारण और निगरानी प्रणाली (CPGRAMS) को भेजी जाएंगी।",
    },
    mr: {
      title: "तक्रार दाखल करा",
      subtitle: "तुम्हाला कोणत्याही सरकारी योजनेत समस्या येत असल्यास, तुमची तक्रार येथे सादर करा. तुमची तक्रार योग्य विभागाकडे पाठवली जाईल.",
      name: "पूर्ण नाव",
      phone: "फोन नंबर",
      district: "जिल्हा",
      state: "राज्य",
      type: "तक्रारीचा प्रकार",
      select_type: "-- तक्रार प्रकार निवडा --",
      scheme: "संबंधित योजना (पर्यायी)",
      scheme_placeholder: "उदा., PM-KISAN, आयुष्मान भारत",
      description: "तुमच्या समस्येचे तपशीलवार वर्णन करा",
      desc_placeholder: "तुम्हाला भेडसावणारी समस्या सांगा, उपलब्ध असल्यास तारखा आणि संदर्भ क्रमांक समाविष्ट करा...",
      submit: "तक्रार दाखल करा",
      success_title: "तक्रार यशस्वीरित्या दाखल",
      success_msg: "तुमची तक्रार नोंदणीकृत झाली आहे. ट्रॅकिंगसाठी कृपया तुमचा संदर्भ क्रमांक जतन करा.",
      ref_label: "संदर्भ क्रमांक",
      track_note: "तुम्ही CPGRAMS पोर्टलवर (pgportal.gov.in) या तुमच्या जवळच्या CSC केंद्राशी संपर्क साधून ही तक्रार ट्रॅक करू शकता.",
      new_grievance: "आणखी एक तक्रार दाखल करा",
      disclaimer: "⚠️ हे एक प्रात्यक्षिक पोर्टल आहे. उत्पादनात, तक्रारी केंद्रीय लोक तक्रार निवारण आणि निरीक्षण प्रणाली (CPGRAMS) ला पाठवल्या जातील.",
    },
  };

  const L = labels[language] || labels.en;
  const types = GRIEVANCE_TYPES[language] || GRIEVANCE_TYPES.en;

  if (submitted) {
    return (
      <>
        <Navbar />
        <div className="form-page">
          <div className="form-container" style={{ textAlign: "center", padding: "var(--space-2xl)" }}>
            <div style={{ fontSize: 48, marginBottom: "var(--space-md)" }}>✅</div>
            <h2 style={{ color: "var(--emerald)", marginBottom: "var(--space-md)" }}>{L.success_title}</h2>
            <p style={{ marginBottom: "var(--space-lg)" }}>{L.success_msg}</p>
            
            <div style={{
              background: "var(--cream)",
              padding: "var(--space-lg)",
              borderRadius: 8,
              border: "2px dashed var(--navy)",
              marginBottom: "var(--space-lg)",
              display: "inline-block"
            }}>
              <div style={{ fontSize: "0.85rem", color: "var(--gray)" }}>{L.ref_label}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--navy)", fontFamily: "monospace" }}>{refId}</div>
            </div>

            <p style={{ fontSize: "0.9rem", color: "var(--gray)", marginBottom: "var(--space-xl)" }}>{L.track_note}</p>

            <button className="btn-primary" onClick={() => { setSubmitted(false); setForm({ name: "", phone: "", district: "", state: "", type: "", scheme: "", description: "" }); }}>
              {L.new_grievance}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="form-page">
        <div className="results-header">
          <h1>{L.title}</h1>
          <p style={{ maxWidth: 600, color: "var(--gray)" }}>{L.subtitle}</p>
        </div>

        <div className="form-container">
          <div className="disclaimer-banner" style={{ marginBottom: "var(--space-lg)", fontSize: "0.85rem" }}>
            {L.disclaimer}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-body">
              {/* Name */}
              <div className="form-group">
                <label className="form-label">{L.name} *</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label">{L.phone} *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  pattern="[0-9]{10}"
                  required
                />
              </div>

              {/* District + State */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
                <div className="form-group">
                  <label className="form-label">{L.district} *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.district}
                    onChange={(e) => update("district", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{L.state} *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Grievance Type */}
              <div className="form-group">
                <label className="form-label">{L.type} *</label>
                <select
                  className="form-select"
                  value={form.type}
                  onChange={(e) => update("type", e.target.value)}
                  required
                >
                  <option value="">{L.select_type}</option>
                  {types.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Related Scheme */}
              <div className="form-group">
                <label className="form-label">{L.scheme}</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.scheme}
                  onChange={(e) => update("scheme", e.target.value)}
                  placeholder={L.scheme_placeholder}
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">{L.description} *</label>
                <textarea
                  className="form-input"
                  rows={5}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder={L.desc_placeholder}
                  required
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">{L.submit}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
