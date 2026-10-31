import React from "react";
import { GraduationCap, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import type { HealthStatus } from "../types";

interface NavbarProps {
  activeTab: "dashboard" | "predictor" | "about";
  setActiveTab: (tab: "dashboard" | "predictor" | "about") => void;
  health: HealthStatus | null;
  loadingHealth: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  health,
  loadingHealth,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg text-slate-900 tracking-tight">
                  CareerPulse AI
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Placement Predictor
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "dashboard"
                  ? "bg-slate-100 text-blue-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("predictor")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "predictor"
                  ? "bg-slate-100 text-blue-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Placement Prediction
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "about"
                  ? "bg-slate-100 text-blue-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              About
            </button>
          </nav>

          {/* Backend Status Indicator */}
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200 text-xs">
            {loadingHealth ? (
              <span className="inline-flex items-center gap-1.5 text-slate-500">
                <Activity className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                Connecting API...
              </span>
            ) : health?.model_loaded ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                API Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-700">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                API Offline (Port 8000)
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
