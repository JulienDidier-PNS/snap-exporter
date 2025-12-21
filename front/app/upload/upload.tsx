"use client";

import {useRef, useState} from "react";

export interface progressDTO {
    status: string;
    downloaded: number;
    total: number;
}
export default function UploadForm() {
    const [status, setStatus] = useState("En attente d'import");
    const [downloaded, setDownloaded] = useState(0);
    const [total, setTotal] = useState(0);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleUpload = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("http://127.0.0.1:8000/run", {
            method: "POST",
            body: formData,
        });

        try{
            //backend down
            if(!res.ok){
                throw new Error(res.statusText);
            }
            const data = await res.json();
            setStatus(data.status);
            setTotal(data.total);
            const interval = setInterval(async () => {
                try {
                    const res = await fetch("http://127.0.0.1:8000/progress");

                    if (!res.ok) {
                        throw new Error("Progress API error");
                    }

                    const data: progressDTO = await res.json();
                    setDownloaded(data.downloaded);

                    if (data.status === "done") {
                        clearInterval(interval);
                    }
                } catch (err) {
                    console.error("Progress not available yet");
                }
            }, 1000);
        }
        catch (error) {
            console.error(error);
        }


    };


    return (
        <div className="p-4 flex flex-col content-center gap-5">
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
                Commencer l'import (.json)
            </button>

            <p>Status: {status}</p>
            {total > 0 && (
                <p>Memories traités : {downloaded} / {total}</p>
            )}
        </div>
    );
}
