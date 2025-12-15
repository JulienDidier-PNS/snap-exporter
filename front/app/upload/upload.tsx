"use client";

import React, { useState } from "react";

export default function UploadPage() {
    const [zipName, setZipName] = useState<string | null>(null);

    function handleZipUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/zip") {
            alert("Merci de sélectionner un fichier ZIP");
            return;
        }

        setZipName(file.name);
        console.log("ZIP sélectionné :", file);
    }

    return (
        <main style={{ padding: 40 }}>
            <h1>Importer un ZIP Snapchat</h1>

            <input
                type="file"
                accept=".zip"
                onChange={handleZipUpload}
            />

            {zipName && <p>Fichier chargé : {zipName}</p>}
        </main>
    );
}
