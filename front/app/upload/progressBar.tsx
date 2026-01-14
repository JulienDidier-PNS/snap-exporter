import {useEffect} from "react";
import {useProgress} from "@/app/upload/progressContext";

export default function ProgressBar() {
    const { progress, setProgress, backendUrl } = useProgress();

    useEffect(() => {
        if (!backendUrl) return;
        const es = new EventSource(`${backendUrl}/progress/stream`);

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
        <div className="w-full mt-4">
            <div className="flex justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 px-1">
                <span className="flex items-center gap-1.5">
                    {progress.status === 'running' ? '⚡️' : progress.status === 'done' ? '✅' : '💤'} 
                    {progress.status === 'running' ? 'Téléchargement...' : progress.status === 'done' ? 'Terminé' : 'En attente'}
                </span>
                <span className="bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-800">
                    {progress.downloaded} / {progress.total}
                </span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-4 p-1 border border-zinc-200 dark:border-zinc-800 shadow-inner">
                <div
                    className={`h-full rounded-full transition-all duration-500 ease-out shadow-sm ${
                        progress.status === "done" 
                        ? "bg-emerald-500" 
                        : "bg-gradient-to-r from-yellow-400 to-yellow-500"
                    }`}
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
            <div className="flex justify-between mt-2 px-1">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{percent}% complété</span>
                {progress.status === "running" && progress.eta && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                        ⏳ Temps restant : {progress.eta}
                    </span>
                )}
            </div>
        </div>
    );
}