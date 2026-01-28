"use client";

import {useRef, useState, useEffect} from "react";
import ProgressBar from "@/app/upload/progressBar";
import {useProgress} from "@/app/upload/progressContext";

function InfoTooltip({ text }: { text: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && contentRef.current && tooltipRef.current) {
            const rect = contentRef.current.getBoundingClientRect();
            const parentRect = tooltipRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const padding = 10;

            let left = -rect.width / 2 + parentRect.width / 2;
            const absoluteLeft = parentRect.left + left;

            if (absoluteLeft < padding) {
                left = -parentRect.left + padding;
            } else if (absoluteLeft + rect.width > viewportWidth - padding) {
                left = viewportWidth - padding - parentRect.left - rect.width;
            }

            // Gestion du débordement vers le haut
            let bottom = '100%';
            let arrowClass = 'top-full border-t-zinc-900';
            let mb = '0.5rem'; // mb-2

            if (parentRect.top - rect.height - 20 < 0) {
                bottom = 'auto';
                mb = '0';
                // @ts-ignore
                setStyle(prev => ({ ...prev, top: 'calc(100% + 0.5rem)' }));
                arrowClass = 'bottom-full border-b-zinc-900';
            } else {
                // @ts-ignore
                setStyle(prev => ({ ...prev, top: 'auto' }));
            }

            // Calcul du décalage de la flèche
            const arrowCenterRelToTooltip = rect.width / 2;
            const targetArrowPosRelToTooltip = -left + parentRect.width / 2;
            const arrowOffset = targetArrowPosRelToTooltip - arrowCenterRelToTooltip;

            setStyle(prev => ({
                ...prev,
                left: `${left}px`,
                bottom: bottom,
                marginBottom: mb,
                transform: 'none',
                '--arrow-offset': `${arrowOffset}px`
            }));
        }
    }, [isOpen]);

    return (
        <div className="relative inline-block ml-2 group/tooltip" ref={tooltipRef}>
            <div
                role="button"
                tabIndex={0}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsOpen(!isOpen);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        e.preventDefault();
                        setIsOpen(!isOpen);
                    }
                }}
                className="w-5 h-5 flex items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white text-xs font-bold transition-all border border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 cursor-pointer shadow-sm"
                title="Plus d'informations"
            >
                i
            </div>
            {isOpen && (
                <div 
                    ref={contentRef}
                    style={style}
                    className="absolute w-64 p-3 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-lg shadow-2xl z-[60] border border-zinc-200 dark:border-white/10 animate-in fade-in zoom-in duration-200"
                >
                    <p className="leading-relaxed">{text}</p>
                    <div 
                        className={`absolute border-8 border-transparent ${style.bottom === 'auto' ? 'bottom-full border-b-white dark:border-b-zinc-800' : 'top-full border-t-white dark:border-t-zinc-800'}`}
                        style={{
                            left: '50%',
                            transform: 'translateX(-50%)',
                            marginLeft: 'var(--arrow-offset, 0px)'
                        }}
                    ></div>
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
            isElectron?: boolean;
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
        try {
            const win = (typeof window !== 'undefined') ? window : null;
            const electron = win?.electron;
            if (electron && typeof electron.selectFolder === 'function') {
                const folder = await electron.selectFolder();
                if (folder) {
                    setOutputPath(folder);
                }
            }
        } catch (err) {
            console.error("Error picking folder:", err);
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
    const [showSettings, setShowSettings] = useState(false);

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
            
            {progress.status !== "idle" && (
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-xs font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors flex items-center gap-2 mb-2"
                >
                    {showSettings ? "⬇️ Cacher les paramètres" : "➡️ Voir les paramètres de l'export"}
                </button>
            )}

            {(progress.status === "idle" || showSettings) && (
                <>
                    <div className={"flex flex-col md:flex-row gap-4 w-full justify-center p-6 custom-bg-blue rounded-2xl items-stretch transition-all duration-300 animate-in fade-in slide-in-from-top-2 duration-300"}>
                        <div className="flex flex-1 items-center">
                            <button
                                onClick={pickFolder}
                                onMouseEnter={() => setHoverFolder(true)}
                                onMouseLeave={() => setHoverFolder(false)}
                                className={`px-6 py-3 text-sm flex items-center justify-center gap-2 btn h-[60px] w-full
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
                                    className={`px-6 py-3 text-sm w-full flex items-center justify-center gap-2 btn h-[60px]
                                ${!isPickup() ? "btn-disabled" : isJsonSelected() ? "btn-ok" : "btn-todo"}`
                                    }
                                >
                                    <span className="flex-1 text-center grid">
                                        {/* Texte invisible pour réserver l'espace le plus large et éviter le flickering */}
                                        <span className="invisible px-4 row-start-1 col-start-1 text-sm">
                                            {isJsonSelected() ? "J'ai un autre fichier 🔍" : "Sélectionner le fichier snapchat (.json)"}
                                        </span>
                                        <span className="row-start-1 col-start-1 flex items-center justify-center">
                                            { isJsonSelected() && isPickup() ?
                                                hoverJson ?
                                                    "Autre fichier 🔍" :
                                                    "Export ✅" :
                                                "Fichier Snapchat (.json)"
                                            }
                                        </span>
                                    </span>
                                    <InfoTooltip text="Sélectionnez le fichier 'memories_history.json' que vous avez extrait de votre archive Snapchat." />
                                </button>
                            </div>
                        )}
                    </div>

                    {isPickup() && (
                        <div className={"flex flex-col gap-2 w-full items-center my-2 animate-in fade-in slide-in-from-top-1 duration-300"}>
                            <p className="text-xs text-zinc-500 font-medium bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                                📍 {outputPath}
                            </p>
                        </div>
                    )}
                </>
            )}

            {isJsonSelected() && isPickup() &&
                (
                    <div className={"flex flex-col gap-6 w-full items-center p-6 custom-bg-blue rounded-2xl shadow-sm transition-all duration-300"}>
                        {(progress.status === "idle" || showSettings) && (
                            <div className="flex items-center gap-3 w-full justify-center bg-white dark:bg-zinc-800 p-3 rounded-xl border border-zinc-100 dark:border-zinc-700 shadow-sm animate-in fade-in duration-300">
                                <input
                                    type="checkbox"
                                    id="mergeOverlay"
                                    checked={mergeOverlay}
                                    disabled={progress.status !== "idle"}
                                    onChange={(e) => setMergeOverlay(e.target.checked)}
                                    className="w-5 h-5 cursor-pointer accent-zinc-900 dark:accent-zinc-100 rounded border-zinc-300"
                                />
                                <label htmlFor="mergeOverlay" className="text-sm text-zinc-700 dark:text-zinc-300 font-semibold cursor-pointer select-none">
                                    Fusionner les Overlays (Texte/Filtres Snapchat)
                                </label>
                                <InfoTooltip text="Le format par défaut d'export de snapchat sépare les textes des médias. Sélectioner cette option fusionnera les fichiers concernés pour obtenir un seul et même fichier." />
                            </div>
                        )}
                        <div className="flex gap-4 w-full justify-center">
                            {progress.status === "idle" && (
                                <button
                                    onClick={resume}
                                    disabled={!isPickup() || !isJsonSelected()}
                                    className={`flex-1 px-8 py-4 rounded-xl font-bold transition-all duration-200 ${
                                        !isPickup() || !isJsonSelected() 
                                        ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" 
                                        : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-95"
                                    }`}
                                >
                                    Démarrer le téléchargement
                                </button>
                            )}
                            {progress.status === "running" && (
                                <button
                                    onClick={pause}
                                    className="px-8 py-4 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                                >
                                    Pause
                                </button>
                            )}
                            {progress.status === "paused" && (
                                <button
                                    onClick={resume}
                                    className="px-8 py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                >
                                    Reprendre
                                </button>
                            )}
                            {(progress.status === "done" || progress.status === "paused" || progress.status === "running") && (
                                <button
                                    onClick={() => setOpenRestartModal(true)}
                                    className="px-8 py-4 bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200 rounded-xl font-bold hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all active:scale-95"
                                >
                                    Réinitialiser
                                </button>
                            )}
                        </div>
                        <div className="w-full">
                            <ProgressBar />
                        </div>
                    </div>
                )
            }
            </div>
            {openRestartModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl max-w-sm w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">Réinitialiser ?</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                            Cette action va arrêter l’export en cours et recommencer depuis le début.<br/>
                            <strong className="text-red-500">Tous les fichiers précédemment téléchargés seront supprimés.</strong>
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setOpenRestartModal(false)}
                                className="flex-1 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={async () => {
                                    await restart();
                                    setOpenRestartModal(false);
                                }}
                                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
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
