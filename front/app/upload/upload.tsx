"use client";

import {useRef, useState} from "react";

export interface progressDTO {
    status: string;
    downloaded: number;
    total: number;
}
export default function UploadForm() {
    const [status, setStatus] = useState("Not started");
    const [downloaded, setDownloaded] = useState(0);
    const [total, setTotal] = useState(0);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleUpload = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        setStatus("Uploading...");

        const res = await fetch("http://127.0.0.1:8000/run", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        setStatus(data.status);
        setTotal(data.total);

        setInterval(async () => {
            const res = await fetch("http://127.0.0.1:8000/progress");
            const data: progressDTO = await res.json();
            console.log("Progress:", data);
            setDownloaded(data.downloaded);
        }, 1000);
    };


    return (
        <div className="p-4">
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                    if (e.target.files) {
                        handleUpload(e.target.files[0]).then();
                        e.target.value = ""; // reset
                    }
                }}
            />

            <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                Upload JSON
            </button>

            <p>Status: {status} / Memories traités : {downloaded} / {total}</p>
        </div>
    );
}
