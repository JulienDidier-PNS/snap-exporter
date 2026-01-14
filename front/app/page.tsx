"use client";

import Image from "next/image";
import UploadForm from "@/app/upload/upload";
import DownloadHistory from "@/app/upload/downloadHistory";
import {ProgressProvider} from "@/app/upload/progressContext";
import BackendHealthGuard from "@/app/backendHealthGuard";
import { TutorialProvider, useTutorial } from "./tutorialContext";

function HomeContent() {
  const { openTutorial } = useTutorial();

  return (
    <BackendHealthGuard>
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-[#09090b] relative transition-colors duration-300">
        <main className="flex min-h-[90vh] w-full max-w-4xl flex-col items-center justify-between rounded-[2.5rem] py-16 px-8 bg-white dark:bg-zinc-900/40 shadow-[0_0_50px_-12px_rgba(0,0,0,0.1)] relative border border-zinc-100 dark:border-white/5 transition-colors duration-300">
            <button 
              onClick={openTutorial}
              className="absolute top-8 right-8 flex items-center gap-2 px-5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-sm font-semibold text-zinc-700 dark:text-zinc-300 z-10 hover:scale-105 active:scale-95"
            >
              🎓 Aide & Tutoriel
            </button>
            <div className={"flex flex-col items-center justify-center w-full lg:w-auto"}>
                <h1 className="text-5xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">SnapExporter</h1>
                <p className="text-zinc-400 font-medium mb-8">Sauvegardez vos souvenirs en toute simplicité</p>
                <div className="relative group mb-8">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <Image
                      className="relative self-center hover:scale-105 transition-transform duration-500"
                      src="/snap-logo.png"
                      alt="snapchat logo"
                      width={200}
                      height={50}
                      priority
                  />
                </div>
                <ProgressProvider>
                    <UploadForm ></UploadForm>
                    <DownloadHistory></DownloadHistory>
                </ProgressProvider>
            </div>

            <footer className="mt-12 text-zinc-400 text-xs flex flex-col items-center gap-3">
                <p className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-900 px-4 py-2 rounded-full border border-zinc-100 dark:border-zinc-800">
                    Développé avec ❤️ par <span className="font-bold text-zinc-900 dark:text-zinc-100 underline decoration-yellow-400 decoration-2 underline-offset-4 cursor-pointer hover:text-yellow-600 transition-colors" onClick={() => window.open('https://www.instagram.com/judd_off/', '_blank')}>Judd</span>
                </p>
                <div className="flex gap-6 font-medium">
                    <a 
                      href="https://github.com/JulienDidier-PNS"
                      onClick={(e) => { e.preventDefault(); window.open('https://github.com/JulienDidier-PNS', '_blank'); }}
                      className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1.5"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        GitHub
                    </a>
                </div>
            </footer>
        </main>
      </div>
    </BackendHealthGuard>
  );
}

export default function Home(){
  return (
    <TutorialProvider>
      <HomeContent />
    </TutorialProvider>
  );
}
