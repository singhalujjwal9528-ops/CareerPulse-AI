import React from "react";
import {
  Database,
  Cpu,
  Target,
  BarChart2,
} from "lucide-react";

export const About: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          About CareerPulse AI
        </h1>
        <p className="mt-2 text-slate-600 text-sm">
          Project overview, dataset details, and model architecture.
        </p>
      </div>

      {/* Objective */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Target className="w-5 h-5 text-blue-600" />
          <h2>Project Objective</h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Provide students and placement officers with a data-backed estimate of
          campus placement likelihood, helping identify areas for improvement before
          recruitment drives begin.
        </p>
      </div>

      {/* Dataset */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Database className="w-5 h-5 text-emerald-600" />
          <h2>Dataset</h2>
        </div>
        <p className="text-sm text-slate-600">
          Source:{" "}
          <code className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-xs text-blue-700">
            Krooz/Campus_Recruitment_CSV
          </code>{" "}
          — 10,000 student records from Hugging Face.
        </p>

        <div className="overflow-x-auto border border-slate-200 rounded-lg mt-2">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Feature</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Range</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {[
                ["CGPA", "Float", "6.5 – 9.1"],
                ["Internships", "Int", "0 – 2"],
                ["Projects", "Int", "0 – 3"],
                ["Workshops/Certifications", "Int", "0 – 3"],
                ["AptitudeTestScore", "Int", "60 – 90"],
                ["SoftSkillsRating", "Float", "3.0 – 4.8"],
                ["ExtracurricularActivities", "Binary", "Yes / No"],
                ["PlacementTraining", "Binary", "Yes / No"],
                ["SSC_Marks", "Int", "55% – 90%"],
                ["HSC_Marks", "Int", "57% – 88%"],
              ].map(([name, type, range]) => (
                <tr key={name}>
                  <td className="px-4 py-2 font-mono font-medium text-slate-900">{name}</td>
                  <td className="px-4 py-2">{type}</td>
                  <td className="px-4 py-2">{range}</td>
                </tr>
              ))}
              <tr className="bg-blue-50/40">
                <td className="px-4 py-2 font-mono font-bold text-blue-900">PlacementStatus (Target)</td>
                <td className="px-4 py-2 font-medium text-blue-900">Binary</td>
                <td className="px-4 py-2">Placed / NotPlaced (41.97% placed)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Algorithm */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Cpu className="w-5 h-5 text-blue-600" />
          <h2>Algorithm: Logistic Regression</h2>
        </div>
        <p className="text-sm text-slate-600">
          A supervised classification algorithm that estimates placement probability
          using the sigmoid function applied to a linear combination of features.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs sm:text-sm text-slate-800 space-y-2">
          <div className="bg-white p-2.5 rounded border border-slate-200">
            {"z = w₀ + w₁·x₁ + w₂·x₂ + ... + w₁₀·x₁₀"}
          </div>
          <div className="bg-white p-2.5 rounded border border-slate-200">
            {"P(Placed) = 1 / (1 + e^-z)"}
          </div>
          <div className="bg-white p-2.5 rounded border border-slate-200">
            {"Placed if P ≥ 0.50, else Not Placed"}
          </div>
        </div>

        <p className="text-xs text-slate-600">
          <strong>StandardScaler</strong> normalizes features to mean 0, variance 1 so that
          different scales (CGPA 0–10 vs Aptitude 0–100) don't bias the model.
        </p>
      </div>

      {/* Evaluation */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <BarChart2 className="w-5 h-5 text-emerald-600" />
          <h2>Evaluation Metrics</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            ["Accuracy", "80.70%"],
            ["Precision", "77.59%"],
            ["Recall", "75.92%"],
            ["F1-Score", "76.75%"],
          ].map(([name, val]) => (
            <div key={name} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <span className="text-slate-500 block">{name}</span>
              <span className="font-bold text-lg text-slate-900">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
