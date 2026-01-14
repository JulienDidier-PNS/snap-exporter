"use client";

import { useState } from "react";
import Image from "next/image";

interface TutorialProps {
  onComplete: () => void;
  isBackendReady: boolean;
}

interface Step {
  title: string;
  description: string;
  image?: string;
  icon?: string;
  secondaryImage?: string;
  links?: { label: string; url: string }[];
  items?: string[];
  nextLabel?: string;
  prevLabel?: string;
}

const steps: Step[] = [
  {
    title: "Bienvenue sur SnapExporter",
    description: "L'outil simple pour exporter vos souvenirs Snapchat en un clic.",
    image: "/snap-logo.png",
    nextLabel: "C'est parti !",
  },
  {
    title: "Exportez vos données Snapchat",
    description: "Pour utiliser l'application, vous allez devoir demander vos données sur le site de Snapchat.",
    icon: "📂",
    secondaryImage: "/tutorials/cal_selection.png",
    links: [
      { label: "Demander mes données Snapchat", url: "https://accounts.snapchat.com/accounts/downloadmydata" }
    ],
    nextLabel: "Continuer",
  },
  {
    title: "1 - Quelles informations je dois exporter ?",
    description: "Vous devez exporter les informations suivantes :",
    items: [
      "Exporter mes souvenirs",
      "Exporter des fichiers JSON",
    ],
    icon: "📋",
    secondaryImage: "/tutorials/wich_choose.png",
    links: [
      { label: "Demander mes données Snapchat", url: "https://accounts.snapchat.com/accounts/downloadmydata" }
    ],
    nextLabel: "Continuer",
  },
  {
    title: "2 - Quelles informations je dois exporter ?",
    description: "Une fois les options sélectionnées, choisissez 'depuis toujours' pour exporter TOUT vos memories.",
    items: [],
    icon: "📋",
    secondaryImage: "/tutorials/cal_selection.png",
    links: [
      { label: "Demander mes données Snapchat", url: "https://accounts.snapchat.com/accounts/downloadmydata" }
    ],
    nextLabel: "Compris !",
  },
  {
    title: "Et après ?",
    description: "Une fois l'adresse email renseignée, attendez quelques minutes ⏱️ Vous recevrez un email lorsque l'export sera terminé.",
    icon: "⏱️",
    nextLabel: "J'ai reçu le mail !",
  },
  {
    title: "J'ai reçu le mail !",
    description: "Super ! Il ne vous reste plus qu'à :",
    items: [
      "Télécharger le fichier généré par Snapchat",
      "Extraire le contenu du fichier zip",
      "Garder le fichier 'memories_history.json' dans le dossier 'json'"
    ],
    icon: "📬",
    secondaryImage: "/tutorials/zip_extract.png",
    nextLabel: "Terminer la configuration",
  },
];

export default function Tutorial({ onComplete, isBackendReady }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    // Le main process (main.js) intercepte window.open pour l'ouvrir dans le navigateur système
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const closeTutorial = () => {
    onComplete();
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (isBackendReady) {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-8 font-sans relative transition-colors duration-300">
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 cursor-zoom-out"
          onClick={() => setZoomedImage(null)}
        >
          <button 
            className="absolute top-8 right-8 text-white hover:text-zinc-300 transition-colors p-2"
            onClick={() => setZoomedImage(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="relative w-full h-full flex items-center justify-center">
            <Image 
              src={zoomedImage} 
              alt="Image agrandie" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}
      <button 
        onClick={closeTutorial}
        className="absolute top-8 right-8 text-zinc-400 hover:text-black dark:hover:text-white transition-colors p-2"
        aria-label="Fermer le tutoriel"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div className="max-w-md w-full flex flex-col items-center text-center">
        <div className="h-48 flex items-center justify-center mb-8">
          {step.image ? (
            <div 
              className="cursor-zoom-in transition-transform hover:scale-105"
              onClick={() => setZoomedImage(step.image!)}
            >
              <Image src={step.image} alt={step.title} width={200} height={200} priority />
            </div>
          ) : (
            <span className="text-8xl">{step.icon}</span>
          )}
        </div>

        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">{step.title}</h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-6">{step.description}</p>

        {step.items && (
          <ul className="text-left text-zinc-600 dark:text-zinc-400 mb-8 list-disc list-inside">
            {step.items.map((item, index) => (
              <li key={index} className="mb-1">
                {item}
              </li>
            ))}
          </ul>
        )}

        {step.links && (
          <div className="flex flex-col gap-2 mb-8">
            {step.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                onClick={(e) => handleLinkClick(e, link.url)}
                className="text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400 font-medium underline decoration-yellow-400/30 underline-offset-4 cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {step.secondaryImage && (
          <div 
            className="mb-8 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm cursor-zoom-in transition-transform hover:scale-[1.02]"
            onClick={() => setZoomedImage(step.secondaryImage!)}
          >
            <Image 
              src={step.secondaryImage} 
              alt="Aide visuelle" 
              width={400} 
              height={250}
              className="object-cover"
            />
          </div>
        )}

        <div className="flex gap-2 mb-12">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                index === currentStep ? "bg-yellow-400" : "bg-zinc-200 dark:bg-zinc-800"
              }`}
            />
          ))}
        </div>

        <div className="flex justify-between w-full mt-auto">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              currentStep === 0 ? "invisible" : "text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            }`}
          >
            {step.prevLabel || "Précédent"}
          </button>

          <button
            onClick={nextStep}
            className={`px-8 py-2 rounded-full font-bold transition-all cursor-pointer ${
              currentStep === steps.length - 1
                ? isBackendReady
                  ? "bg-yellow-400 text-black hover:bg-yellow-500 shadow-lg"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed"
                : "bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
            }`}
          >
            {currentStep === steps.length - 1 
              ? (step.nextLabel || (isBackendReady ? "Commencer" : "Initialisation...")) 
              : (step.nextLabel || "Suivant")}
          </button>
        </div>
      </div>
    </div>
  );
}
