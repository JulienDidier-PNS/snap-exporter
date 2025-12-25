"use client";

import {useEffect, useRef, useState} from "react";

export interface ProgressDTO {
    status: "idle" | "running" | "done" | "paused";
    downloaded: number;
    total: number;
}


declare global {
    interface Window {
        electron?: {
            selectFolder: () => Promise<string | null>;
        };
    }
}

export default function UploadForm() {
    const [status, setStatus] = useState("idle");
    const [downloaded, setDownloaded] = useState(0);
    const [total, setTotal] = useState(0);
    const [outputPath, setOutputPath] = useState("");


    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [progress, setProgress] = useState<ProgressDTO>({
        status: "idle",
        downloaded: 0,
        total: 0,
    });

    let percent =
        progress.total > 0
            ? Math.round((progress.downloaded / progress.total) * 100)
            : 0;

    async function fetchProgress() {
        const res = await fetch("http://127.0.0.1:8000/progress");
        return (await res.json()) as ProgressDTO;
    }

    const pickFolder = async () => {
        if (!window.electron) return;

        const folder = await window.electron.selectFolder();
        if (folder) {
            setOutputPath(folder);
        }
    };

    useEffect(() => {
        const interval = setInterval(async () => {
            const p = await fetchProgress();
            setProgress(p);

            if (p.status === "done") {
                clearInterval(interval);
            }

            percent =
                progress.total > 0
                    ? Math.round((progress.downloaded / progress.total) * 100)
                    : 0;

        }, 800);

        return () => clearInterval(interval);
    }, []);


    const handleUpload = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("output_path", outputPath);

        await fetch("http://127.0.0.1:8000/run", {
            method: "POST",
            body: formData,
        });

        setStatus("running");
    };

    const pause = async () => {
        await fetch("http://127.0.0.1:8000/pause", { method: "POST" });
        setStatus("paused");
    };

    const resume = async () => {
        await fetch("http://127.0.0.1:8000/resume", { method: "POST" });
        setStatus("running");
    };

    return (
        <div className="p-4 flex flex-col gap-4">
            <button
                onClick={pickFolder}
                className="px-4 py-2 bg-gray-700 text-white rounded"
            >
                Choisir un dossier
            </button>
            <p>Dossier de sortie : {outputPath}</p>

            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                    if (e.target.files) {
                        handleUpload(e.target.files[0]);
                        e.target.value = "";
                    }
                }}
            />

            <button
                id={"startImportBtn"}
                disabled={outputPath == null || outputPath === ""}
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                Commencer l'import (.json)
            </button>

            <div className="flex gap-2">
                <button
                    onClick={pause}
                    disabled={status !== "running"}
                    className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
                >
                    Pause
                </button>

                <button
                    onClick={resume}
                    disabled={status !== "paused"}
                    className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
                >
                    Resume
                </button>
            </div>

            <p>Status: {status}</p>
            {progress.status !== "idle" && (
                <div className="w-full mt-4">
                    <div className="mb-1 text-sm text-gray-600 dark:text-gray-300">
                        {progress.downloaded} / {progress.total} fichiers — {percent}%
                    </div>

                    <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-500 ease-out"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
