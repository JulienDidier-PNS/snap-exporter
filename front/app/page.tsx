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
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black relative">
        <main className="flex min-h-screen w-full h-full max-h-11/12 flex-col items-center justify-between rounded-4xl py-16 px-4 bg-white shadow-2xl relative">
            <button 
              onClick={openTutorial}
              className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 z-10"
            >
              🎓 Aide & Tutoriel
            </button>
            <div className={"flex flex-col items-center justify-center w-full max-h-11/12 lg:w-auto"}>
                <h1 className="text-4xl font-bold text-black">SnapExporter</h1>
                <Image
                    className="self-center"
                    src="/snap-logo.png"
                    alt="snapchat logo"
                    width={300}
                    height={50}
                    priority
                />
                <ProgressProvider>
                    <UploadForm ></UploadForm>
                    <DownloadHistory></DownloadHistory>
                </ProgressProvider>
            </div>

            <footer className="mt-8 text-gray-400 text-sm flex flex-col items-center gap-1">
                <p>
                    Développé avec ❤️ par <span className="font-semibold text-gray-600 underline decoration-yellow-400/30 underline-offset-4 cursor-pointer hover:text-yellow-600 transition-colors" onClick={() => window.open('https://www.instagram.com/judd_off/', '_blank')}>Judd</span>
                </p>
                <div className="flex gap-4">
                    <a 
                      href="https://github.com/JulienDidier-PNS"
                      onClick={(e) => { e.preventDefault(); window.open('https://github.com/Judd-M', '_blank'); }}
                      className="hover:text-black transition-colors"
                    >
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
