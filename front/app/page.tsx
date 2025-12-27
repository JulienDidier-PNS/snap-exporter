import Image from "next/image";
import UploadForm from "@/app/upload/upload";
import DownloadHistory from "@/app/upload/downloadHistory";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl h-full max-h-11/12 flex-col items-center justify-between rounded-4xl py-16 px-16 bg-white dark:bg-blue-950">
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
              <UploadForm></UploadForm>
              <DownloadHistory></DownloadHistory>
          </div>
      </main>
    </div>
  );
}
