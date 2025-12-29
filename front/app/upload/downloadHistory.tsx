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
    const { progress } = useProgress();

    const [downloadedItems, setDownloadedItems] = useState<DownloadedItemDTO[]>([]);
    const totalPerPage = 20;
    const [currentPage, setCurrentPage] = useState(0);
    const [totalDownloaded, setTotalDownloaded] = useState(0);

    const [openHisto, setOpenHisto] = useState(false);
    const [openErrorFiles, setOpenErrorFiles] = useState(false);

    const [errorFiles, setErrorFiles] = useState<string[]>([]);

    const contentRefHisto = useRef<HTMLDivElement>(null);
    const contentRefErrorFiles = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const es = new EventSource("http://127.0.0.1:8000/file/error/stream");

        es.onmessage = (event) => {
            const data = JSON.parse(event.data) as string[];
            setErrorFiles(data);
        };

        es.onerror = () => {
            console.warn("SSE disconnected");
            es.close();
        };

        return () => es.close();
    }, []);

    async function fetchDownloads(offset = 0, limit = 20) {
        const res = await fetch(
            `http://127.0.0.1:8000/downloads?offset=${offset}&limit=${limit}`
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
                            className="mb-2 font-bold"
                        >
                            {openHisto ? "⬇️ Cacher l'historique" : "➡️ Voir l'historique"}
                        </button>

                        <div
                            ref={contentRefHisto}
                            className={`overflow-hidden transition-all duration-500 ease-in-out`}
                            style={{
                                height: openHisto ? contentRefHisto.current?.scrollHeight : 0,
                                opacity: openHisto ? 1 : 0,
                            }}
                        >
                            <div className={"histo-container"}>
                                <ul className="text-sm histo-list">
                                    {downloadedItems.map((item, i) => (
                                        <li key={i}>
                                            {item.media_type === "image" ? "🖼️" : "🎬"}{" "}
                                            {item.filename} —{" "}
                                            {new Date(item.date).toLocaleString()}
                                        </li>
                                    ))}
                                </ul>

                                <div className={"histo-btn flex gap-2 mt-4"}>
                                    <button
                                        disabled={currentPage === 0}
                                        onClick={() => loadPage(currentPage - 1)}
                                        className="cursor-pointer"
                                    >
                                        ⬅️
                                    </button>

                                    {pagesToShow().map((p, i) =>
                                        p === "..." ? (
                                            <span key={i}>...</span>
                                        ) : (
                                            <button
                                                key={i}
                                                className={`${p === currentPage ? "font-bold underline" : ""} cursor-pointer`}
                                                onClick={() => loadPage(p as number)}
                                            >
                                                {p + 1}
                                            </button>
                                        )
                                    )}

                                    <button
                                        disabled={currentPage + 1 >= totalPages}
                                        onClick={() => loadPage(currentPage + 1)}
                                        className="cursor-pointer"
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
                            className="mb-2 font-bold">
                            {openErrorFiles ? "⬇️ Cacher" : "➡️ Voir les fichiers en erreur"}
                        </button>
                        <div
                            ref={contentRefErrorFiles}
                            className={`overflow-hidden transition-all duration-500 ease-in-out files-error-list`}
                            style={{
                                height: openErrorFiles ? contentRefErrorFiles.current?.scrollHeight : 0,
                                opacity: openErrorFiles ? 1 : 0,
                            }}
                        >
                            {errorFiles.map((item, i) => (
                                <li key={i}>
                                    {item}
                                </li>
                            ))}
                        </div>
                    </div>
                </>
            )
        }
        </>
    )
}
