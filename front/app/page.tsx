import Image from "next/image";
import UploadForm from "@/app/upload/upload";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          src="/snap-logo.png"
          alt="snapchat logo"
          width={300}
          height={50}
          priority
        />
        <div>
          <h1 className="text-2xl font-bold text-white">
            Exporter vos données ici ⬇️
          </h1>
          <UploadForm></UploadForm>
        </div>
      </main>
    </div>
  );
}
