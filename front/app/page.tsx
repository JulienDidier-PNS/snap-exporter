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
        <button 
          onClick={openTutorial}
          className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
        >
          🎓 Aide & Tutoriel
        </button>
        <main className="flex min-h-screen w-full h-full max-h-11/12 flex-col items-center justify-between rounded-4xl py-16 px-4 bg-white ">
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
