"use client"

import { useEffect, useState, useRef } from "react";
import {useProgress} from "@/app/upload/progressContext";

export interface DownloadedItemDTO {
    filename: string;
    date: string;
    media_type: string;
}

export interface DownloadsPageDTO {
    items: DownloadedItemDTO[];
    total: number;
    offset: number;
    limit: number;
}

export default function DownloadHistory() {
    const { progress, backendUrl } = useProgress();

    const [downloadedItems, setDownloadedItems] = useState<DownloadedItemDTO[]>([]);
    const totalPerPage = 20;
    const [currentPage, setCurrentPage] = useState(0);
    const [totalDownloaded, setTotalDownloaded] = useState(0);

    const [openHisto, setOpenHisto] = useState(false);
    const [openErrorFiles, setOpenErrorFiles] = useState(false);

    const [errorFiles, setErrorFiles] = useState<Record<string, string>>({});

    const contentRefHisto = useRef<HTMLDivElement>(null);
    const contentRefErrorFiles = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!backendUrl) return;
        const es = new EventSource(`${backendUrl}/file/error/stream`);

        es.onmessage = (event) => {
            const data = JSON.parse(event.data) as Record<string, string>;
            setErrorFiles(data);
        };

        es.onerror = () => {
            console.warn("SSE disconnected");
            es.close();
        };

        return () => es.close();
    }, [backendUrl]);

    async function fetchDownloads(offset = 0, limit = 20) {
        const res = await fetch(
            `${backendUrl}/downloads?offset=${offset}&limit=${limit}`
        );
        return (await res.json()) as DownloadsPageDTO;
    }

    async function loadPage(page: number) {
        const offset = page * totalPerPage;
        const data = await fetchDownloads(offset, totalPerPage);
        setDownloadedItems(data.items);
        setTotalDownloaded(data.total);
        setCurrentPage(page);
    }

    useEffect(() => {
        if (openHisto) loadPage(currentPage);
    }, [openHisto, currentPage]);

    const totalPages = Math.ceil(totalDownloaded / totalPerPage);

    const pagesToShow = () => {
        const pages: (number | string)[] = [];
        const left = 2;
        const right = 2;
        const around = 1;

        for (let i = 0; i < totalPages; i++) {
            if (
                i < left ||
                i >= totalPages - right ||
                (i >= currentPage - around && i <= currentPage + around)
            ) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== "...") {
                pages.push("...");
            }
        }
        return pages;
    };

    return (
        <>
        {
            progress.status !== "idle" && (
                <>
                    <div className="download-history">
                        <button
                            onClick={() => setOpenHisto(!openHisto)}
                            className="mb-2 font-bold text-sm flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors w-fit"
                        >
                            {openHisto ? "⬇️ Cacher l'historique" : "➡️ Voir l'historique"}
                        </button>

                        <div
                            ref={contentRefHisto}
                            className={`overflow-hidden transition-all duration-500 ease-in-out`}
                            style={{
                                height: openHisto ? (contentRefHisto.current?.scrollHeight || 'auto') : 0,
                                opacity: openHisto ? 1 : 0,
                            }}
                        >
                            <div className={"histo-container"}>
                                <ul className="text-sm histo-list">
                                    {downloadedItems.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center w-full h-full text-zinc-400 dark:text-zinc-500 gap-2 italic py-10">
                                            <p>Aucun fichier téléchargé pour le moment.</p>
                                        </div>
                                    ) : (
                                        downloadedItems.map((item, i) => (
                                            <li key={i}>
                                                <span className="text-lg">{item.media_type === "image" ? "🖼️" : "🎬"}</span>
                                                <div className="flex flex-col">
                                                    <span className="font-bold truncate max-w-[200px] text-zinc-900 dark:text-zinc-200">{item.filename}</span>
                                                    <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">{new Date(item.date).toLocaleString()}</span>
                                                </div>
                                            </li>
                                        ))
                                    )}
                                </ul>

                                <div className={"histo-btn flex gap-4"}>
                                    <button
                                        disabled={currentPage === 0}
                                        onClick={() => loadPage(currentPage - 1)}
                                        className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
                                    >
                                        ⬅️
                                    </button>

                                    <div className="flex gap-2 items-center">
                                        {pagesToShow().map((p, i) =>
                                            p === "..." ? (
                                                <span key={i} className="text-zinc-400 dark:text-zinc-600 font-bold">...</span>
                                            ) : (
                                                <button
                                                    key={i}
                                                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all text-xs font-bold ${p === currentPage ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md" : "hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400"}`}
                                                    onClick={() => loadPage(p as number)}
                                                >
                                                    {Number(p) + 1}
                                                </button>
                                            )
                                        )}
                                    </div>

                                    <button
                                        disabled={currentPage + 1 >= totalPages}
                                        onClick={() => loadPage(currentPage + 1)}
                                        className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
                                    >
                                        ➡️
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="files-error-container">
                        <button
                            onClick={() => setOpenErrorFiles(!openErrorFiles)}
                            className="mb-2 font-bold text-sm flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors w-fit text-red-600 dark:text-red-400"
                        >
                            {openErrorFiles ? "⬇️ Cacher" : "➡️ Voir les fichiers en erreur"}
                        </button>
                        <div
                            ref={contentRefErrorFiles}
                            className={`overflow-hidden transition-all duration-500 ease-in-out`}
                            style={{
                                height: openErrorFiles ? (contentRefErrorFiles.current?.scrollHeight || 'auto') : 0,
                                opacity: openErrorFiles ? 1 : 0,
                            }}
                        >
                            <div className="files-error-list">
                                {Object.keys(errorFiles).length === 0 ? (
                                    <p className="text-sm text-zinc-400 dark:text-zinc-500 italic text-center py-4">Aucune erreur détectée.</p>
                                ) : (
                                    <ul className="text-xs space-y-2">
                                        {Object.entries(errorFiles).map(([filename, reason], i) => (
                                            <li key={i} className="p-3 bg-white dark:bg-zinc-900/50 rounded-lg border border-red-100 dark:border-red-900/30 flex flex-col gap-1 shadow-sm">
                                                <span className="font-bold text-red-700 dark:text-red-400 truncate">{filename}</span>
                                                <span className="text-zinc-700 dark:text-zinc-300 font-medium">{reason}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )
        }
        </>
    )
}
