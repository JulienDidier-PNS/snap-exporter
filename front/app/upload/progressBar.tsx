import {useEffect} from "react";
import {useProgress} from "@/app/upload/progressContext";

export default function ProgressBar() {
    const { progress, setProgress } = useProgress();

    useEffect(() => {
        const es = new EventSource("http://127.0.0.1:8000/progress/stream");

        es.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setProgress(data);

            if (data.status === "done") {
                es.close();
            }
        };

        return () => es.close();
    }, [setProgress]);

    const percent =
        progress.total > 0
            ? Math.round((progress.downloaded / progress.total) * 100)
            : 0;

    return (
        <div className="w-full mt-4 bg-amber-50 rounded-lg p-4">
            <p className="mb-1 font-medium">
                {progress.status === "running"
                    ? "Export en cours"
                    : progress.status === "idle"
                        ? "En attente"
                        : progress.status === "paused"
                            ? "Export en pause"
                            : progress.status === "done"
                                ? "Export terminé"
                                : ""}
            </p>

            <div className="mb-2 text-sm text-gray-600">
                {progress.downloaded} / {progress.total} — {percent}%
            </div>

            <div className="h-3 w-full bg-gray-200 rounded overflow-hidden">
                <div
                    className="h-full bg-blue-500 transition-all duration-500 ease-out"
                    style={{ width: `${percent}%` }}
                />
            </div>

            {progress.status === "done" && (
                <p className="text-green-600 mt-2">✅ Terminé</p>
            )}
        </div>
    );
}