"use client";

import { createContext, useContext, useState } from "react";

export interface ProgressDTO {
    status: "idle" | "running" | "done" | "paused";
    downloaded: number;
    total: number;
    eta: string;
}

interface ProgressContextType {
    progress: ProgressDTO;
    setProgress: React.Dispatch<React.SetStateAction<ProgressDTO>>;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
    const [progress, setProgress] = useState<ProgressDTO>({
        status: "idle",
        downloaded: 0,
        total: 0,
        eta: "",
    });

    return (
        <ProgressContext.Provider value={{ progress, setProgress }}>
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
