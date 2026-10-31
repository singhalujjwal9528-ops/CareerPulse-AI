import React from "react";
import {
  Users,
  Award,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import type { DatasetStats } from "../types";
import { StatCard } from "./StatCard";

interface DashboardProps {
  stats: DatasetStats | null;
  loading: boolean;
  onNavigateToPredictor: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  onNavigateToPredictor,
}) => {
  const totalRecords = stats?.total_records ?? 10000;
  const placedCount = stats?.placed_count ?? 4197;
  const notPlacedCount = stats?.not_placed_count ?? 5803;
  const placementRate = stats?.placement_rate_pct ?? 41.97;
  const accuracy = stats?.metrics.accuracy ?? 0.807;
  const precision = stats?.metrics.precision ?? 0.7759;
  const recall = stats?.metrics.recall ?? 0.7592;
  const f1 = stats?.metrics.f1_score ?? 0.7675;
  const cm = stats?.metrics.confusion_matrix ?? { tn: 977, fp: 184, fn: 202, tp: 637 };

  const coefficients = stats?.coefficients ?? {
    AptitudeTestScore: 0.5698,
    PlacementTraining_Num: 0.4016,
    ExtracurricularActivities_Num: 0.3448,
    SSC_Marks: 0.2994,
    SoftSkillsRating: 0.2883,
    CGPA: 0.263,
    HSC_Marks: 0.227,
    Projects: 0.2137,
    "Workshops/Certifications": 0.1278,
    Internships: 0.0003,
  };

  const featureSummaries = stats?.feature_summary ?? {
    CGPA: { min: 6.5, max: 9.1, mean: 7.7, median: 7.7 },
    AptitudeTestScore: { min: 60, max: 90, mean: 79.45, median: 80 },
    SoftSkillsRating: { min: 3.0, max: 4.8, mean: 4.32, median: 4.4 },
    SSC_Marks: { min: 55, max: 90, mean: 69.16, median: 70 },
    HSC_Marks: { min: 57, max: 88, mean: 74.5, median: 73 },
    Projects: { min: 0, max: 3, mean: 2.03, median: 2 },
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
        <div className="max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            CareerPulse AI
          </h1>
          <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
            Predict campus placement probability using Logistic Regression trained
            on 10,000 student records.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToPredictor}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
            >
              Predict Now
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-500">
              Dataset: Krooz/Campus_Recruitment_CSV
            </span>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Records"
          value={totalRecords.toLocaleString()}
          subtext="Student profiles"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Placement Rate"
          value={`${placementRate}%`}
          subtext={`${placedCount.toLocaleString()} placed`}
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <StatCard
          label="Model Accuracy"
          value={`${(accuracy * 100).toFixed(1)}%`}
          subtext="On 2,000 test records"
          icon={<Award className="w-5 h-5" />}
        />
        <StatCard
          label="Precision / Recall"
          value={`${(precision * 100).toFixed(1)}% / ${(recall * 100).toFixed(1)}%`}
          subtext={`F1: ${(f1 * 100).toFixed(1)}%`}
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Distribution + Benchmark */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placement Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-1">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Placement Distribution</h2>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Placed
                </span>
                <span className="text-slate-700 font-semibold">
                  {placedCount.toLocaleString()} ({placementRate}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${placementRate}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  Not Placed
                </span>
                <span className="text-slate-700 font-semibold">
                  {notPlacedCount.toLocaleString()} ({(100 - placementRate).toFixed(2)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-slate-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${100 - placementRate}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 bg-slate-50 p-3.5 rounded-lg text-xs space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>Train / Test Split:</span>
                <span className="font-semibold text-slate-900">80% / 20%</span>
              </div>
              <div className="flex justify-between">
                <span>Target:</span>
                <span className="font-semibold text-slate-900">PlacementStatus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Benchmarks */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Dataset Benchmarks</h2>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(featureSummaries).map(([featureName, data]) => {
              const cleanName = featureName
                .replace("AptitudeTestScore", "Aptitude Score")
                .replace("SoftSkillsRating", "Soft Skills")
                .replace("SSC_Marks", "10th Marks")
                .replace("HSC_Marks", "12th Marks");

              return (
                <div
                  key={featureName}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <p className="text-slate-500 font-medium truncate">{cleanName}</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {data.mean}
                    <span className="text-xs font-normal text-slate-500 ml-1">avg</span>
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex justify-between text-[11px] text-slate-500">
                    <span>Min: {data.min}</span>
                    <span>Max: {data.max}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confusion Matrix + Feature Weights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Confusion Matrix</h2>
            <p className="text-xs text-slate-500 mt-0.5">2,000 test samples</p>
          </div>

          <div className="mt-6 flex flex-col items-center">
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                <span className="text-xs text-slate-500 font-medium">TN</span>
                <p className="text-2xl font-bold text-slate-800 mt-1">{cm.tn}</p>
              </div>
              <div className="bg-amber-50/50 border border-amber-200/70 rounded-lg p-4 text-center">
                <span className="text-xs text-amber-700 font-medium">FP</span>
                <p className="text-2xl font-bold text-amber-900 mt-1">{cm.fp}</p>
              </div>
              <div className="bg-amber-50/50 border border-amber-200/70 rounded-lg p-4 text-center">
                <span className="text-xs text-amber-700 font-medium">FN</span>
                <p className="text-2xl font-bold text-amber-900 mt-1">{cm.fn}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                <span className="text-xs text-emerald-700 font-medium">TP</span>
                <p className="text-2xl font-bold text-emerald-800 mt-1">{cm.tp}</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 text-center mt-4">
              Correct: <strong>{cm.tn + cm.tp}</strong> / 2,000 ({(((cm.tn + cm.tp) / 2000) * 100).toFixed(1)}%)
            </p>
          </div>
        </div>

        {/* Feature Weights */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Feature Weights</h2>
            <p className="text-xs text-slate-500 mt-0.5">Logistic regression coefficients</p>
          </div>

          <div className="mt-5 space-y-2.5">
            {Object.entries(coefficients)
              .sort((a, b) => b[1] - a[1])
              .map(([feat, coef]) => {
                const label = feat
                  .replace("_Num", "")
                  .replace("ExtracurricularActivities", "Extracurriculars")
                  .replace("PlacementTraining", "Placement Training")
                  .replace("AptitudeTestScore", "Aptitude Score")
                  .replace("SoftSkillsRating", "Soft Skills")
                  .replace("Workshops/Certifications", "Workshops / Certs");

                const widthPct = Math.min(100, Math.max(8, (Math.abs(coef) / 0.6) * 100));

                return (
                  <div key={feat} className="flex items-center text-xs gap-3">
                    <span className="w-32 truncate text-slate-700 font-medium">{label}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${widthPct}%` }}
                      ></div>
                    </div>
                    <span className="w-12 text-right font-mono font-semibold text-slate-700">
                      +{coef.toFixed(3)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
