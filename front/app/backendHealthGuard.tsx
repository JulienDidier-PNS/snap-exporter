"use client";

import { useState, useEffect } from "react";

declare global {
  interface Window {
      electron?: {
          selectFolder: () => Promise<string | null>;
          getBackendPort: () => Promise<number>;
      };
  }
}

export default function BackendHealthGuard({ children }: { children: React.ReactNode }) {
  const [isBackendUp, setIsBackendUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [backendUrl, setBackendUrl] = useState<string | null>(null);

  useEffect(() => {
    if (window.electron && window.electron.getBackendPort) {
      window.electron.getBackendPort().then((port: number) => {
        setBackendUrl(`http://127.0.0.1:${port}`);
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
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8">
      <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-800">Démarrage du système...</h2>
      <p className="text-gray-500 mt-2">Nous préparons votre environnement.</p>
      {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm max-w-md text-center">
              <p className="font-bold mb-1">Un problème ?</p>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Réessayer
              </button>
          </div>
      )}
    </div>
  );
}
