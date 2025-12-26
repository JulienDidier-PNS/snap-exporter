"use client";

import { useEffect, useState } from "react";

interface ProgressDTO {
    status: "idle" | "running" | "done" | "paused";
    downloaded: number;
    total: number;
}

export default function ProgressBar() {
    const [progress, setProgress] = useState<ProgressDTO>({
        status: "idle",
        downloaded: 0,
        total: 0,
    });

    useEffect(() => {
        const es = new EventSource("http://127.0.0.1:8000/progress/stream");

        es.onmessage = (event) => {
            const data = JSON.parse(event.data) as ProgressDTO;
            setProgress(data);

            if (data.status === "done") {
                es.close();
            }
        };

        es.onerror = () => {
            console.warn("SSE disconnected");
            es.close();
        };

        return () => es.close();
    }, []);

    const percent =
        progress.total > 0
            ? Math.round((progress.downloaded / progress.total) * 100)
            : 0;

    return (
        <div className="w-full mt-4">
            <p>
                {
                    progress.status === "running" ? "Export en cours" :
                        progress.status === "idle" ? "En attente" :
                            progress.status === "paused" ? "Export en pause":
                                progress.status === "done" ? "Export terminé" : ""
                }
            </p>
            <div className="mb-1 text-sm text-gray-600 dark:text-gray-300">
                {progress.downloaded} / {progress.total} — {percent}%
            </div>

            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                <div
                    className="h-full bg-blue-500 transition-all duration-500 ease-out"
                    style={{ width: `${percent}%` }}
                />
            </div>

            {progress.status === "done" && (
                <p className="text-green-600 mt-2">✅ Terminé</p>
            )}
        </div>
    );
}

