"use client";

import { createContext, useContext, useState, useEffect } from "react";

export interface ProgressDTO {
    status: "idle" | "running" | "done" | "paused";
    downloaded: number;
    total: number;
    eta: string;
}

interface ProgressContextType {
    progress: ProgressDTO;
    setProgress: React.Dispatch<React.SetStateAction<ProgressDTO>>;
    backendUrl: string;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

declare global {
    interface Window {
        electron?: {
            selectFolder: () => Promise<string | null>;
            getBackendPort: () => Promise<number>;
        };
    }
}

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
    const [progress, setProgress] = useState<ProgressDTO>({
        status: "idle",
        downloaded: 0,
        total: 0,
        eta: "",
    });

    const [backendUrl, setBackendUrl] = useState("http://127.0.0.1:8000");

    useEffect(() => {
        const win = (typeof window !== 'undefined') ? window : null;
        if (win && win.electron && typeof win.electron.getBackendPort === 'function') {
            win.electron.getBackendPort()
                .then((port: number) => {
                    setBackendUrl(`http://127.0.0.1:${port}`);
                })
                .catch(err => {
                    console.error("Failed to get backend port from Electron context:", err);
                    setBackendUrl("http://127.0.0.1:8000");
                });
        }
    }, []);

    return (
        <ProgressContext.Provider value={{ progress, setProgress, backendUrl }}>
            {children}
        </ProgressContext.Provider>
    );
};

export const useProgress = () => {
    const ctx = useContext(ProgressContext);
    if (!ctx) {
        throw new Error("useProgress must be used inside ProgressProvider");
    }
    return ctx;
};
