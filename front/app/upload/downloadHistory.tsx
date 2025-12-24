"use client"

import { useEffect, useState, useRef } from "react";

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
    const [downloadedItems, setDownloadedItems] = useState<DownloadedItemDTO[]>([]);
    const totalPerPage = 20;
    const [currentPage, setCurrentPage] = useState(0);
    const [totalDownloaded, setTotalDownloaded] = useState(0);
    const [open, setOpen] = useState(false);

    const contentRef = useRef<HTMLDivElement>(null);

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
        if (open) loadPage(currentPage);
    }, [open, currentPage]);

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
        <div className="download-history">
            <button
                onClick={() => setOpen(!open)}
                className="mb-2 font-bold"
            >
                {open ? "⬇️ Cacher l'historique" : "➡️ Voir l'historique"}
            </button>

            <div
                ref={contentRef}
                className={`overflow-hidden transition-all duration-500 ease-in-out`}
                style={{
                    height: open ? contentRef.current?.scrollHeight : 0,
                    opacity: open ? 1 : 0,
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
                        >
                            ⬅️
                        </button>

                        {pagesToShow().map((p, i) =>
                            p === "..." ? (
                                <span key={i}>...</span>
                            ) : (
                                <button
                                    key={i}
                                    className={p === currentPage ? "font-bold underline" : ""}
                                    onClick={() => loadPage(p as number)}
                                >
                                    {p + 1}
                                </button>
                            )
                        )}

                        <button
                            disabled={currentPage + 1 >= totalPages}
                            onClick={() => loadPage(currentPage + 1)}
                        >
                            ➡️
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
