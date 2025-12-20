"use client";

import { useState } from "react";

export default function UploadForm() {
    const [status, setStatus] = useState("");

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
    };

    setInterval(async () => {
        const res = await fetch("http://127.0.0.1:8000/progress");
        const data = await res.json();
        console.log("Progress:", data);
    }, 1000);


    return (
        <div className="p-4">
            <input
                type="file"
                accept=".json"
                onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
            />
            <p>Status: {status}</p>
        </div>
    );
}
