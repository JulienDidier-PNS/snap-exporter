"use client";

import { useState, useEffect } from "react";
import Tutorial from "./tutorial";
import { useTutorial } from "./tutorialContext";

declare global {
  interface Window {
      electron?: {
          selectFolder: () => Promise<string | null>;
          getBackendPort: () => Promise<number>;
          isElectron?: boolean;
      };
  }
}

export default function BackendHealthGuard({ children }: { children: React.ReactNode }) {
  const [isBackendUp, setIsBackendUp] = useState(false);
  const { showTutorial, setHasCompletedTutorial } = useTutorial();
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [backendUrl, setBackendUrl] = useState<string | null>(null);

  const handleTutorialComplete = () => {
    setHasCompletedTutorial(true);
  };

  useEffect(() => {
    const win = (typeof window !== 'undefined') ? window : null;
    if (win && win.electron && typeof win.electron.getBackendPort === 'function') {
      win.electron.getBackendPort()
        .then((port: number) => {
          setBackendUrl(`http://127.0.0.1:${port}`);
        })
        .catch(err => {
          console.error("Failed to get backend port from Electron:", err);
          setBackendUrl("http://127.0.0.1:8000");
        });
    } else {
      // Fallback pour le développement web classique si besoin
      setBackendUrl("http://127.0.0.1:8000");
    }
  }, []);

  useEffect(() => {
    if (!backendUrl) return;

    let interval: NodeJS.Timeout;
    
    const checkHealth = async () => {
      try {
        const response = await fetch(`${backendUrl}/health`, {
          mode: 'cors',
          cache: 'no-cache'
        });
        if (response.ok) {
          setIsBackendUp(true);
        }
      } catch (err) {
        console.log("Waiting for backend at " + backendUrl);
        setAttempts(prev => {
            const next = prev + 1;
            if (next > 30) {
                setError("Le backend semble mettre du temps à démarrer ou a rencontré une erreur.");
            }
            return next;
        });
      }
    };

    checkHealth();
    interval = setInterval(checkHealth, 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [backendUrl]);

  if (isBackendUp) {
    return (
      <>
        {children}
        {showTutorial && (
          <div className="fixed inset-0 z-[100] bg-white dark:bg-[#0f0f12] overflow-y-auto">
            <Tutorial onComplete={handleTutorialComplete} isBackendReady={isBackendUp} />
          </div>
        )}
      </>
    );
  }

  if (showTutorial) {
    return <Tutorial onComplete={handleTutorialComplete} isBackendReady={isBackendUp} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-[#0f0f12] p-8 transition-colors duration-300">
      <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">Démarrage du système...</h2>
      <p className="text-zinc-500 dark:text-zinc-400 mt-2">Nous préparons votre environnement.</p>
      {error && (
          <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl text-red-700 dark:text-red-400 text-sm max-w-md text-center shadow-sm">
              <p className="font-bold mb-2 text-lg">Un problème ?</p>
              <p className="leading-relaxed">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold active:scale-95 shadow-lg shadow-red-600/20"
              >
                Réessayer
              </button>
          </div>
      )}
    </div>
  );
}
