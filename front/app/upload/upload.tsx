"use client";

import {useRef, useState, useEffect} from "react";
import ProgressBar from "@/app/upload/progressBar";
import {useProgress} from "@/app/upload/progressContext";

function InfoTooltip({ text }: { text: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block ml-2 group/tooltip" ref={tooltipRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsOpen(!isOpen);
                }}
                className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/30 text-white text-xs font-bold transition-all border border-white/20 group-hover/tooltip:border-white/40"
                title="Plus d'informations"
            >
                i
            </button>
            {isOpen && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-900 text-white text-xs rounded-lg shadow-2xl z-[60] border border-white/10 animate-in fade-in zoom-in duration-200">
                    <p className="leading-relaxed">{text}</p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-900"></div>
                </div>
            )}
        </div>
    );
}

declare global {
    interface Window {
        electron?: {
            selectFolder: () => Promise<string | null>;
            getBackendPort: () => Promise<number>;
        };
    }
}

export default function UploadForm() {
    //PARENT OBJ
    const { progress, setProgress, backendUrl } = useProgress();

    const [outputPath, setOutputPath] = useState("");
    const [mergeOverlay, setMergeOverlay] = useState(true);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [jsonExportFile, setJsonExportFile] = useState<File | null>(null);

    const pickFolder = async () => {
        if (!window.electron) return;

        const folder = await window.electron.selectFolder();
        if (folder) {
            setOutputPath(folder);
        }
    };

    //Call when download not started yet
    const handleUpload = async () => {
        if(!jsonExportFile){
            return setOutputPath("");
        }
        else{
            const formData = new FormData();
            formData.append("file", jsonExportFile);
            formData.append("output_path", outputPath);
            formData.append("merge_overlay", mergeOverlay.toString());

            await fetch(`${backendUrl}/run`, {
                method: "POST",
                body: formData,
            });

            setProgress(p => ({ ...p, status: "running" }));
        }
    };

    const pause = async () => {
        await fetch(`${backendUrl}/pause`, { method: "POST" });
        setProgress(p => ({ ...p, status: "paused" }));
    };

    const resume = async () => {
        if(progress.status === "idle") {
            await handleUpload();
        }
        else{
            await fetch(`${backendUrl}/resume`, { method: "POST" });
            setProgress(p => ({ ...p, status: "running" }));
        }
    };

    const [openRestartModal, setOpenRestartModal] = useState(false);
    const restart = async () => {
        const formData = new FormData();
        formData.append("output_path", outputPath);
        await fetch(`${backendUrl}/restart`, {
            method: "POST",
            body: formData,
        });
        setJsonExportFile(null);
        setOutputPath("");
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
            <div className={"flex flex-row gap-4 w-full justify-center p-4 custom-bg-blue rounded-lg items-stretch"}>
                <div className="flex flex-1 items-center">
                    <button
                        onClick={pickFolder}
                        onMouseEnter={() => setHoverFolder(true)}
                        onMouseLeave={() => setHoverFolder(false)}
                        className={`px-4 py-2 rounded text-white flex items-center justify-center gap-2 btn min-h-[44px] w-full
                        ${isPickup() ? "btn-ok" : "btn-todo"}
                    `}
                    >
                        <span className="flex-1 text-center grid">
                            {/* Texte invisible pour réserver l'espace le plus large et éviter le flickering */}
                            <span className="invisible px-4 row-start-1 col-start-1">
                                {isPickup() ? "Changer le dossier 🔍" : "Dossier de sortie"}
                            </span>
                            <span className="row-start-1 col-start-1 flex items-center justify-center">
                                {isPickup()
                                    ? hoverFolder
                                        ? "Changer le dossier 🔍"
                                        : "Dossier ✅"
                                    : "Dossier de sortie"}
                            </span>
                        </span>
                        <InfoTooltip text="Choisissez l'endroit où vos souvenirs seront téléchargés sur votre ordinateur." />
                    </button>
                </div>
                {isPickup() && (
                    <div className={"flex flex-1 items-center"}>
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
                            className={`px-4 py-2 rounded text-white w-full flex items-center justify-center gap-2 btn min-h-[44px]
                        ${!isPickup() ? "btn-disabled" : isJsonSelected() ? "btn-ok" : "btn-todo"}`
                            }
                        >
                            <span className="flex-1 text-center grid">
                                {/* Texte invisible pour réserver l'espace le plus large et éviter le flickering */}
                                <span className="invisible px-4 row-start-1 col-start-1">
                                    {isJsonSelected() ? "J'ai un autre fichier 🔍" : "Sélectionner le fichier snapchat (.json)"}
                                </span>
                                <span className="row-start-1 col-start-1 flex items-center justify-center">
                                    { isJsonSelected() && isPickup() ?
                                        hoverJson ?
                                            "J'ai un autre fichier 🔍" :
                                            "Export ✅" :
                                        "Sélectionner le fichier snapchat (.json)"
                                    }
                                </span>
                            </span>
                            <InfoTooltip text="Sélectionnez le fichier 'memories_history.json' que vous avez extrait de votre archive Snapchat." />
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
                        <div className="flex items-center gap-2 mb-2 w-full justify-start px-10">
                            <input
                                type="checkbox"
                                id="mergeOverlay"
                                checked={mergeOverlay}
                                disabled={progress.status !== "idle"}
                                onChange={(e) => setMergeOverlay(e.target.checked)}
                                className="w-4 h-4 cursor-pointer"
                            />
                            <label htmlFor="mergeOverlay" className="text-sm text-white font-medium cursor-pointer">
                                Fusionner les Overlays (Texte/Filtres Snapchat)
                            </label>
                            <InfoTooltip text="Le format par défaut d'export de snapchat sépare les textes des médias. Sélectioner cette option fusionnera les fichiers concernés pour obtenir un seul et même fichier." />
                        </div>
                        <div className="flex gap-2 w-full justify-around">
                            <button
                                onClick={resume}
                                disabled={!isPickup() || !isJsonSelected() || progress.status === "running" || progress.status === "done"}
                                className={`${!isPickup() || !isJsonSelected() || progress.status === "running" || progress.status === "done" ? "cursor-not-allowed" : ""} px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50`}
                            >
                                {progress.status === "idle" ? "Télécharger " : "Reprendre"}
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
