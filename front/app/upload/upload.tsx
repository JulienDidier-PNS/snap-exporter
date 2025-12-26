"use client";

import {useRef, useState} from "react";
import ProgressBar from "@/app/upload/progressBar";

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
    const [outputPath, setOutputPath] = useState("");

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [jsonExportFile, setJsonExportFile] = useState<File | null>(null);

    const pickFolder = async () => {
        if (!window.electron) return;

        const folder = await window.electron.selectFolder();
        if (folder) {
            setOutputPath(folder);
        }
    };

    const handleUpload = async () => {
        if(!jsonExportFile){
            return setOutputPath("");
        }
        else{
            const formData = new FormData();
            formData.append("file", jsonExportFile);
            formData.append("output_path", outputPath);

            await fetch("http://127.0.0.1:8000/run", {
                method: "POST",
                body: formData,
            });
            setStatus("running");
        }
    };

    const pause = async () => {
        await fetch("http://127.0.0.1:8000/pause", { method: "POST" });
        setStatus("paused");
    };

    const resume = async () => {
        if(status === "idle") {
            handleUpload();
        }
        else{
            await fetch("http://127.0.0.1:8000/resume", { method: "POST" });
            setStatus("running");
        }
    };

    const isPickup = () => {
        return outputPath != null && outputPath != "";
    }

    const isJsonSelected = () => {
        return jsonExportFile != null;
    }

    const [hoverFolder, setHoverFolder] = useState(false);
    const [hoverJson, setHoverJson] = useState(false);

    return (
        <div className="p-4 flex flex-col gap-4 items-center">
            <button
                onClick={pickFolder}
                onMouseEnter={() => setHoverFolder(true)}
                onMouseLeave={() => setHoverFolder(false)}
                className={`px-4 py-2 rounded text-white btn
                    ${isPickup() ? "btn-ok" : "btn-todo"}
                `}
            >
                {isPickup()
                    ? hoverFolder
                        ? "Changer de dossier 🔍"
                        : "Sélectionné ✅"
                    : "Choisir un dossier"}
            </button>
            {isPickup() && (
                <>
                    <p>Dossier de sortie : {outputPath}</p>
                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                setJsonExportFile(e.target.files[0]);
                            }
                        }}
                    />
                    <button
                        id="startImportBtn"
                        onMouseEnter={() => setHoverJson(true)}
                        onMouseLeave={() => setHoverJson(false)}
                        disabled={outputPath == null || outputPath === ""}
                        onClick={() => fileInputRef.current?.click()}
                        className={`px-4 py-2 rounded text-white btn
                        ${!isPickup() ? "btn-disabled" : isJsonSelected() ? "btn-ok" : "btn-todo"}`
                        }
                    >
                        { isJsonSelected() && isPickup() ?
                            hoverJson ? "" +
                                "Changer de fichier 🔍" :
                                "Fichier sélectionné ✅" :
                            "Sélectionner un fichier"
                        }
                    </button>
                </>
            )}

            {isJsonSelected() && isPickup() &&
                (
                    <>
                        <div className="flex gap-2 w-full justify-between">
                            <button
                                onClick={resume}
                                disabled={!isPickup() || !isJsonSelected() || status === "running"}
                                className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
                            >
                                {status === "idle" ? "Télécharger" : "Reprendre"}
                            </button>
                            <button
                                onClick={pause}
                                disabled={status !== "running"}
                                className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
                            >
                                Pause
                            </button>
                        </div>
                        <ProgressBar></ProgressBar>
                    </>
                )
            }
        </div>
    );
}
