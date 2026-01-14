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

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
    const [progress, setProgress] = useState<ProgressDTO>({
        status: "idle",
        downloaded: 0,
        total: 0,
        eta: "",
    });

    const [backendUrl, setBackendUrl] = useState("http://127.0.0.1:8000");

    useEffect(() => {
        if (window.electron && window.electron.getBackendPort) {
            window.electron.getBackendPort().then((port: number) => {
                setBackendUrl(`http://127.0.0.1:${port}`);
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
