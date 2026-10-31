import React, { useState, useRef } from "react";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  HelpCircle,
  Upload,
  FileText,
  FileCheck,
  ClipboardPaste,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { StudentInput, PredictionResult, ResumeExtractionResponse } from "../types";
import { predictPlacement, extractResumeFromFile, extractResumeFromText } from "../services/api";

const INITIAL_FORM: StudentInput = {
  cgpa: 7.7,
  internships: 1,
  projects: 2,
  workshops_certifications: 1,
  aptitude_test_score: 80,
  soft_skills_rating: 4.2,
  extracurricular_activities: "Yes",
  placement_training: "Yes",
  ssc_marks: 70,
  hsc_marks: 75,
};

const PRESETS: Record<string, { label: string; data: StudentInput; desc: string }> = {
  strong: {
    label: "High Performer",
    desc: "CGPA 8.5, Aptitude 86, 2 Internships",
    data: {
      cgpa: 8.5, internships: 2, projects: 3, workshops_certifications: 2,
      aptitude_test_score: 86, soft_skills_rating: 4.6,
      extracurricular_activities: "Yes", placement_training: "Yes",
      ssc_marks: 84, hsc_marks: 86,
    },
  },
  average: {
    label: "Average",
    desc: "CGPA 7.6, Aptitude 78, 1 Internship",
    data: {
      cgpa: 7.6, internships: 1, projects: 2, workshops_certifications: 1,
      aptitude_test_score: 78, soft_skills_rating: 4.1,
      extracurricular_activities: "Yes", placement_training: "Yes",
      ssc_marks: 68, hsc_marks: 72,
    },
  },
  atRisk: {
    label: "At-Risk",
    desc: "CGPA 6.6, Aptitude 64, 0 Internships",
    data: {
      cgpa: 6.6, internships: 0, projects: 0, workshops_certifications: 0,
      aptitude_test_score: 64, soft_skills_rating: 3.2,
      extracurricular_activities: "No", placement_training: "No",
      ssc_marks: 58, hsc_marks: 62,
    },
  },
};

const SAMPLE_RESUMES: Record<string, { title: string; text: string }> = {
  sde: {
    title: "Sample SDE Resume",
    text: `Priya Patel
Email: priya.patel@eng.edu | Phone: +91 9876543210
EDUCATION
Bachelor of Technology in Computer Science & Engineering (2021 - 2025)
State Institute of Technology - CGPA: 8.54 / 10
Higher Secondary (12th / HSC): 88.0% | Secondary (10th / SSC): 91.5%

TECHNICAL EXPERIENCE
Software Engineering Intern | CloudScale Solutions | May 2024 - July 2024
- Engineered asynchronous microservices using FastAPI and PostgreSQL.
- Implemented frontend state caching in React & TypeScript.
Machine Learning Intern | DataCore Labs | Jan 2024 - March 2024
- Built tabular classification models in Python and Scikit-Learn.

PROJECTS
1. CareerPulse AI: Student placement probability predictor with 80.7% accuracy.
2. Distributed Task Queue: High-throughput job scheduling engine in Python.
3. Campus Connect: Mobile campus networking platform built in React Native.

CERTIFICATIONS & WORKSHOPS
- AWS Certified Cloud Practitioner
- Deep Learning Specialization by Coursera
- Attended 3-day National Workshop on Docker and Kubernetes

LEADERSHIP & EXTRACURRICULAR
- Winner at National Smart India Hackathon 2024
- Lead Coordinator of College Coding Society & IEEE Student Branch
- Completed Campus Placement & Aptitude Training Program`,
  },
  dataAnalyst: {
    title: "Sample Analyst Resume",
    text: `Rohan Verma
Email: rohan.v@example.com | Contact: +91 9123456789
EDUCATION
B.E. in Information Technology (2021 - 2025)
National College of Engineering - CGPA: 7.85 / 10
12th (HSC): 81.0% | 10th (SSC): 84.0%

EXPERIENCE
Data Analyst Intern | RetailPulse Analytics | June 2024 - Aug 2024
- Performed exploratory data analysis and customer segmentation using Pandas and SQL.

PROJECTS
1. Customer Churn Prediction: Built logistic regression model with 79% accuracy.
2. Sales Performance Dashboard: Interactive BI dashboard tracking quarterly KPIs.

CERTIFICATIONS
- Google Data Analytics Professional Certificate
- SQL for Data Science on Coursera

ACTIVITIES
- Active member of College Sports Team (Inter-college Badminton)
- Completed Institutional Placement Training Program`,
  },
};

export const Predictor: React.FC = () => {
  const [formData, setFormData] = useState<StudentInput>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const [resumeMode, setResumeMode] = useState<"file" | "text">("file");
  const [resumeText, setResumeText] = useState<string>("");
  const [extracting, setExtracting] = useState<boolean>(false);
  const [extractionResult, setExtractionResult] = useState<ResumeExtractionResponse | null>(null);
  const [showEvidence, setShowEvidence] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (formData.cgpa < 0 || formData.cgpa > 10) errs.cgpa = "Must be 0–10";
    if (formData.internships < 0 || formData.internships > 10) errs.internships = "Must be 0–10";
    if (formData.projects < 0 || formData.projects > 20) errs.projects = "Must be 0–20";
    if (formData.workshops_certifications < 0 || formData.workshops_certifications > 20) errs.workshops_certifications = "Must be 0–20";
    if (formData.aptitude_test_score < 0 || formData.aptitude_test_score > 100) errs.aptitude_test_score = "Must be 0–100";
    if (formData.soft_skills_rating < 1.0 || formData.soft_skills_rating > 5.0) errs.soft_skills_rating = "Must be 1.0–5.0";
    if (formData.ssc_marks < 0 || formData.ssc_marks > 100) errs.ssc_marks = "Must be 0–100";
    if (formData.hsc_marks < 0 || formData.hsc_marks > 100) errs.hsc_marks = "Must be 0–100";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInputChange = (field: keyof StudentInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const applyPreset = (key: string) => {
    if (PRESETS[key]) {
      setFormData(PRESETS[key].data);
      setErrors({});
      setResult(null);
      setApiError(null);
      setExtractionResult(null);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setResult(null);
    setApiError(null);
    setExtractionResult(null);
    setResumeText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    setApiError(null);
    try {
      const extracted = await extractResumeFromFile(file);
      setFormData(extracted.extracted_student);
      setExtractionResult(extracted);
      setResult(null);
    } catch (err: any) {
      setApiError(err.message || "Failed to parse resume.");
    } finally {
      setExtracting(false);
    }
  };

  const handleTextParse = async () => {
    if (!resumeText.trim()) {
      setApiError("Paste resume text first.");
      return;
    }
    setExtracting(true);
    setApiError(null);
    try {
      const extracted = await extractResumeFromText(resumeText);
      setFormData(extracted.extracted_student);
      setExtractionResult(extracted);
      setResult(null);
    } catch (err: any) {
      setApiError(err.message || "Failed to parse resume.");
    } finally {
      setExtracting(false);
    }
  };

  const loadSampleResume = (key: string) => {
    const sample = SAMPLE_RESUMES[key];
    if (sample) {
      setResumeMode("text");
      setResumeText(sample.text);
      extractResumeFromText(sample.text)
        .then((extracted) => {
          setFormData(extracted.extracted_student);
          setExtractionResult(extracted);
          setResult(null);
        })
        .catch((err) => setApiError(err.message));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await predictPlacement(formData);
      setResult(res);
    } catch (err: any) {
      setApiError(err.message || "Could not reach backend. Is FastAPI running on port 8000?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-900">Placement Prediction</h1>
        <p className="mt-1 text-slate-500 text-sm">
          Upload a resume or fill in the form below to get a placement probability.
        </p>

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 mr-1">Presets:</span>
          {Object.entries(PRESETS).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className="px-2.5 py-1 text-xs rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title={item.desc}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1 text-xs rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {/* Resume Upload */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Resume Parser</h2>
              <p className="text-xs text-slate-500">Auto-extract details from a PDF or pasted text</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setResumeMode("file")}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                resumeMode === "file"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5 inline mr-1" />
              Upload PDF
            </button>
            <button
              type="button"
              onClick={() => setResumeMode("text")}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                resumeMode === "text"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ClipboardPaste className="w-3.5 h-3.5 inline mr-1" />
              Paste Text
            </button>
          </div>
        </div>

        <div className="mt-5">
          {resumeMode === "file" ? (
            <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20 rounded-xl p-6 text-center transition-all">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-file-input"
              />
              <label htmlFor="resume-file-input" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  {extracting ? (
                    <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {extracting ? "Parsing..." : "Click to upload resume (PDF or TXT)"}
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                rows={4}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste resume text here..."
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={handleTextParse}
                disabled={extracting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {extracting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Parsing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Extract from Text
                  </>
                )}
              </button>
            </div>
          )}

          {/* Sample resumes */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500">Try a sample:</span>
            <button
              type="button"
              onClick={() => loadSampleResume("sde")}
              className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 transition-colors cursor-pointer"
            >
              SDE Resume
            </button>
            <button
              type="button"
              onClick={() => loadSampleResume("dataAnalyst")}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              Analyst Resume
            </button>
          </div>

          {/* Extraction result */}
          {extractionResult && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Resume parsed — 10 features extracted.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEvidence(!showEvidence)}
                  className="inline-flex items-center gap-1 text-emerald-700 font-medium underline cursor-pointer"
                >
                  {showEvidence ? (
                    <>Hide Details <ChevronUp className="w-3 h-3" /></>
                  ) : (
                    <>Show Details <ChevronDown className="w-3 h-3" /></>
                  )}
                </button>
              </div>

              {showEvidence && (
                <div className="mt-3 pt-3 border-t border-emerald-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                  {Object.entries(extractionResult.evidence).map(([key, val]) => (
                    <div key={key} className="bg-white/80 p-2 rounded border border-emerald-100">
                      <strong className="text-slate-800 capitalize">
                        {key.replace("_", " ")}:
                      </strong>{" "}
                      <span>{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Form + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Academic */}
            <div>
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                Academic Performance
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">CGPA (0–10)</label>
                  <input
                    type="number" step="any" min="0" max="10"
                    value={formData.cgpa}
                    onChange={(e) => handleInputChange("cgpa", parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.cgpa ? "border-red-400 bg-red-50" : "border-slate-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="e.g. 7.8" required
                  />
                  {errors.cgpa && <p className="text-[11px] text-red-600 mt-1">{errors.cgpa}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">10th Marks (%)</label>
                  <input
                    type="number" step="any" min="0" max="100"
                    value={formData.ssc_marks}
                    onChange={(e) => handleInputChange("ssc_marks", parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.ssc_marks ? "border-red-400 bg-red-50" : "border-slate-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="e.g. 72" required
                  />
                  {errors.ssc_marks && <p className="text-[11px] text-red-600 mt-1">{errors.ssc_marks}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">12th Marks (%)</label>
                  <input
                    type="number" step="any" min="0" max="100"
                    value={formData.hsc_marks}
                    onChange={(e) => handleInputChange("hsc_marks", parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.hsc_marks ? "border-red-400 bg-red-50" : "border-slate-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="e.g. 75" required
                  />
                  {errors.hsc_marks && <p className="text-[11px] text-red-600 mt-1">{errors.hsc_marks}</p>}
                </div>
              </div>
            </div>

            {/* Experience & Aptitude */}
            <div>
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                Experience & Aptitude
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Aptitude Score (0–100)</label>
                  <input
                    type="number" step="any" min="0" max="100"
                    value={formData.aptitude_test_score}
                    onChange={(e) => handleInputChange("aptitude_test_score", parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.aptitude_test_score ? "border-red-400 bg-red-50" : "border-slate-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="e.g. 80" required
                  />
                  {errors.aptitude_test_score && <p className="text-[11px] text-red-600 mt-1">{errors.aptitude_test_score}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Soft Skills (1.0–5.0)</label>
                  <input
                    type="number" step="any" min="1.0" max="5.0"
                    value={formData.soft_skills_rating}
                    onChange={(e) => handleInputChange("soft_skills_rating", parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.soft_skills_rating ? "border-red-400 bg-red-50" : "border-slate-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="e.g. 4.2" required
                  />
                  {errors.soft_skills_rating && <p className="text-[11px] text-red-600 mt-1">{errors.soft_skills_rating}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Internships</label>
                  <input
                    type="number" min="0" max="10"
                    value={formData.internships}
                    onChange={(e) => handleInputChange("internships", parseInt(e.target.value, 10) || 0)}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.internships ? "border-red-400 bg-red-50" : "border-slate-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="e.g. 1" required
                  />
                  {errors.internships && <p className="text-[11px] text-red-600 mt-1">{errors.internships}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Projects</label>
                  <input
                    type="number" min="0" max="20"
                    value={formData.projects}
                    onChange={(e) => handleInputChange("projects", parseInt(e.target.value, 10) || 0)}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.projects ? "border-red-400 bg-red-50" : "border-slate-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="e.g. 2" required
                  />
                  {errors.projects && <p className="text-[11px] text-red-600 mt-1">{errors.projects}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Workshops & Certifications</label>
                  <input
                    type="number" min="0" max="20"
                    value={formData.workshops_certifications}
                    onChange={(e) => handleInputChange("workshops_certifications", parseInt(e.target.value, 10) || 0)}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.workshops_certifications ? "border-red-400 bg-red-50" : "border-slate-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="e.g. 1" required
                  />
                  {errors.workshops_certifications && <p className="text-[11px] text-red-600 mt-1">{errors.workshops_certifications}</p>}
                </div>
              </div>
            </div>

            {/* Training & Activities */}
            <div>
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                Training & Activities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <label className="block text-xs font-medium text-slate-700 mb-2">Placement Training?</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center text-xs text-slate-800 cursor-pointer">
                      <input type="radio" name="placement_training" value="Yes"
                        checked={formData.placement_training === "Yes"}
                        onChange={() => handleInputChange("placement_training", "Yes")}
                        className="text-blue-600 focus:ring-blue-500 mr-1.5"
                      /> Yes
                    </label>
                    <label className="inline-flex items-center text-xs text-slate-800 cursor-pointer">
                      <input type="radio" name="placement_training" value="No"
                        checked={formData.placement_training === "No"}
                        onChange={() => handleInputChange("placement_training", "No")}
                        className="text-blue-600 focus:ring-blue-500 mr-1.5"
                      /> No
                    </label>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <label className="block text-xs font-medium text-slate-700 mb-2">Extracurricular Activities?</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center text-xs text-slate-800 cursor-pointer">
                      <input type="radio" name="extracurricular_activities" value="Yes"
                        checked={formData.extracurricular_activities === "Yes"}
                        onChange={() => handleInputChange("extracurricular_activities", "Yes")}
                        className="text-blue-600 focus:ring-blue-500 mr-1.5"
                      /> Yes
                    </label>
                    <label className="inline-flex items-center text-xs text-slate-800 cursor-pointer">
                      <input type="radio" name="extracurricular_activities" value="No"
                        checked={formData.extracurricular_activities === "No"}
                        onChange={() => handleInputChange("extracurricular_activities", "No")}
                        className="text-blue-600 focus:ring-blue-500 mr-1.5"
                      /> No
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Error */}
            {apiError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Predicting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Predict
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Result Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 sticky top-24">
            <h2 className="text-base font-semibold text-slate-900 pb-3 border-b border-slate-100">
              Result
            </h2>

            {result ? (
              <div className="mt-5 space-y-6">
                {/* Outcome */}
                <div
                  className={`p-4 rounded-xl border ${
                    result.placement_status === "Placed"
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                      : "bg-amber-50/70 border-amber-200 text-amber-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.placement_status === "Placed" ? (
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <XCircle className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider opacity-75">Prediction</span>
                      <p className="text-2xl font-bold tracking-tight">{result.placement_status}</p>
                    </div>
                  </div>
                </div>

                {/* Probability */}
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs font-medium text-slate-700">Probability</span>
                    <span className="text-2xl font-bold font-mono text-slate-900">
                      {result.placement_probability_pct}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                    <div
                      className={`h-3.5 rounded-full transition-all duration-700 ${
                        result.placement_probability >= 0.7
                          ? "bg-emerald-500"
                          : result.placement_probability >= 0.5
                          ? "bg-blue-600"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${result.placement_probability_pct}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                    <span>0%</span>
                    <span className="font-medium text-slate-500">Threshold: 50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Confidence:</span>
                    <span className="font-semibold text-slate-800">{result.confidence_level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Raw Probability:</span>
                    <span className="font-mono text-slate-800">{result.placement_probability}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 py-10 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">No Prediction Yet</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Fill the form and click <strong>Predict</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
