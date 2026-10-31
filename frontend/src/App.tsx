import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./components/Dashboard";
import { Predictor } from "./components/Predictor";
import { About } from "./components/About";
import { Footer } from "./components/Footer";
import { checkHealth, getDatasetStats, API_BASE_URL } from "./services/api";
import type { HealthStatus, DatasetStats } from "./types";
import { AlertCircle, RefreshCw } from "lucide-react";

export function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "predictor" | "about">("dashboard");
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  const initData = async () => {
    setLoadingHealth(true);
    setLoadingStats(true);

    try {
      const healthRes = await checkHealth();
      setHealth(healthRes);
    } catch (err: any) {
      console.warn("Backend not yet reachable on port 8000:", err);
      setHealth(null);
    } finally {
      setLoadingHealth(false);
    }

    try {
      const statsRes = await getDatasetStats();
      setStats(statsRes);
    } catch (err: any) {
      console.warn("Could not fetch dataset stats from API:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        loadingHealth={loadingHealth}
      />

      {/* Backend Offline Warning Banner if health check fails */}
      {!loadingHealth && !health?.model_loaded && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Backend API is not reachable at <code>{API_BASE_URL}</code>.
              </span>
            </div>
            <button
              onClick={initData}
              className="inline-flex items-center gap-1 font-medium underline hover:text-amber-950 cursor-pointer ml-3 shrink-0"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && (
          <Dashboard
            stats={stats}
            loading={loadingStats}
            onNavigateToPredictor={() => setActiveTab("predictor")}
          />
        )}

        {activeTab === "predictor" && <Predictor />}

        {activeTab === "about" && <About />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
