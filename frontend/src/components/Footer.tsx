import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-white border-t border-slate-200 py-5 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <span className="font-medium text-slate-700">CareerPulse AI</span>
        <span>Logistic Regression · Scikit-Learn · React</span>
      </div>
    </footer>
  );
};
