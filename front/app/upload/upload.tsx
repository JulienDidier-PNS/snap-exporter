"use client";

import {useRef, useState} from "react";
import ProgressBar from "@/app/upload/progressBar";
import {useProgress} from "@/app/upload/progressContext";

//TODO: GETTING PROGRESS STATUS TO UPDATE BTN BEHAVIOUR
declare global {
    interface Window {
        electron?: {
            selectFolder: () => Promise<string | null>;
        };
    }
}

export default function UploadForm() {
    //PARENT OBJ
    const { progress, setProgress } = useProgress();

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
            setProgress(p => ({ ...p, status: "running" }));
        }
    };

    const pause = async () => {
        await fetch("http://127.0.0.1:8000/pause", { method: "POST" });
        setProgress(p => ({ ...p, status: "paused" }));
    };

    const resume = async () => {
        if(progress.status === "idle") {
            await handleUpload();
        }
        else{
            await fetch("http://127.0.0.1:8000/resume", { method: "POST" });
            setProgress(p => ({ ...p, status: "running" }));
        }
    };

    const [openRestartModal, setOpenRestartModal] = useState(false);
    const restart = async () => {
        await fetch("http://127.0.0.1:8000/restart", {
            method: "POST",
            body: new FormData(),
        });
        setJsonExportFile(null);
        setOutputPath(null);
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
        <>
            <div className="p-4 flex flex-col gap-4 items-center w-full">
            <div className={"flex flex-row gap-4 w-full justify-center p-4 custom-bg-blue rounded-lg"}>
                <button
                    onClick={pickFolder}
                    onMouseEnter={() => setHoverFolder(true)}
                    onMouseLeave={() => setHoverFolder(false)}
                    className={`px-4 py-2 rounded text-white items-center max-w-1/2 btn
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
                    <div className={"flex"}>
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
                            className={`px-4 py-2 rounded text-white w-full btn
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
                    </div>
                )}
            </div>

            {isPickup() && (
                <div className={"flex flex-col gap-4 w-full items-center m-4"}>
                    <p>Dossier de sortie : {outputPath}</p>
                </div>
            )}

            {isJsonSelected() && isPickup() &&
                (
                    <div className={"flex flex-col gap-4 w-full items-center p-4 custom-bg-blue rounded-lg"}>
                        <div className="flex gap-2 w-full justify-around">
                            <button
                                onClick={resume}
                                disabled={!isPickup() || !isJsonSelected() || progress.status === "running" || progress.status === "done"}
                                className={`${!isPickup() || !isJsonSelected() || progress.status === "running" || progress.status === "done" ? "cursor-not-allowed" : ""} px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50`}
                            >
                                {progress.status === "idle" ? "Télécharger" : "Reprendre"}
                            </button>
                            <button
                                onClick={pause}
                                disabled={progress.status === "done" || progress.status === "paused"}
                                className={`${progress.status === "done" || progress.status === "paused" ? "cursor-not-allowed" : ""} px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50`}
                            >
                                Pause
                            </button>
                            <button
                                onClick={() => setOpenRestartModal(true)}
                                className="px-4 py-2 bg-orange-500 text-white rounded"
                            >
                                🔄 Redémarrer
                            </button>

                        </div>
                        <ProgressBar></ProgressBar>
                    </div>
                )
            }
            </div>
            {openRestartModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
                        <h2 className="text-lg font-bold mb-2">
                            Confirmer le redémarrage
                        </h2>

                        <p className="text-sm text-gray-600 mb-4">
                            Cette action va arrêter l’export en cours et recommencer depuis le début.<br/>
                            <strong>Tous les fichiers précédemment télécharger seront supprimés</strong><br/>
                            Êtes-vous sûr ?
                        </p>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setOpenRestartModal(false)}
                                className="px-4 py-2 rounded bg-gray-200"
                            >
                                Annuler
                            </button>

                            <button
                                onClick={async () => {
                                    await restart();
                                    setOpenRestartModal(false);
                                }}
                                className="px-4 py-2 rounded bg-red-500 text-white"
                            >
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
