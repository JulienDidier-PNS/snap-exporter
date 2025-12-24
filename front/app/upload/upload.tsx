"use client";

import {useRef, useState} from "react";

export interface progressDTO {
    status: string;
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

    const pickFolder = async () => {
        if (!window.electron) return;

        const folder = await window.electron.selectFolder();
        if (folder) {
            setOutputPath(folder);
        }
    };

    const startPolling = () => {
        if (intervalRef.current) return;

        intervalRef.current = setInterval(async () => {
            try {
                const res = await fetch("http://127.0.0.1:8000/progress");
                const data: progressDTO = await res.json();

                if(data.status === "paused"){
                    return;
                }

                setDownloaded(data.downloaded);
                setTotal(data.total);
                setStatus(data.status);

                if (data.status === "done") {
                    clearInterval(intervalRef.current!);
                    intervalRef.current = null;
                }
            } catch (e) {
                console.error("Progress error", e);
            }
        }, 1000);
    };

    const handleUpload = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("output_path", outputPath);

        await fetch("http://127.0.0.1:8000/run", {
            method: "POST",
            body: formData,
        });

        setStatus("running");
        startPolling();
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
            <p>Memories traités : {downloaded} / {total}</p>
        </div>
    );
}
