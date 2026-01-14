"use client";

import { useState } from "react";
import Image from "next/image";
import is from "@sindresorhus/is";
import undefined = is.undefined;

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
}

const steps: Step[] = [
  {
    title: "Bienvenue sur SnapExporter",
    description: "L'outil simple pour exporter vos souvenirs Snapchat en un clic.",
    image: "/snap-logo.png",
  },
  {
    title: "Exportez vos données Snapchat",
    description: "Pour utiliser l'application, vous allez devoir demander vos données Snapchat sur le site de Snapchat.",
    icon: "📂",
    secondaryImage: "",
    links: [
      { label: "Demander mes données Snapchat", url: "https://accounts.snapchat.com/accounts/downloadmydata" }
    ]
  },
  {
    title: "Quelles informations je dois exporter ? - 1",
    description: "Vous devez exporter les informations suivantes :",
    items: [
      "Exporter mes souvenirs",
      "Exporter des fichiers JSON",
    ],
    icon: "📋",
    secondaryImage: "/tutorials/wich_choose.png",
    links: [
      { label: "Demander mes données Snapchat", url: "https://accounts.snapchat.com/accounts/downloadmydata" }
    ]
  },
  {
    title: "Quelles informations je dois exporter ? - 2",
    description: "Une fois les options sélectionnées, choisissez 'depuis toujours' pour exporter TOUT vos memories.",
    items: [],
    icon: "📋",
    secondaryImage: "/tutorials/cal_selection.png",
    links: [
      { label: "Demander mes données Snapchat", url: "https://accounts.snapchat.com/accounts/downloadmydata" }
    ]
  },
  {
    title: "Et après ?",
    description: "Une fois l'adresse email renseignée, attendez quelques minutes ⏱️ Vous recevrez un email lorsque l'export sera terminé.",
    icon: "⏱️",
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
  },
];

export default function Tutorial({ onComplete, isBackendReady }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8 font-sans relative">
      <button 
        onClick={closeTutorial}
        className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors p-2"
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
            <Image src={step.image} alt={step.title} width={200} height={200} priority />
          ) : (
            <span className="text-8xl">{step.icon}</span>
          )}
        </div>

        <h2 className="text-3xl font-bold text-black mb-4">{step.title}</h2>
        <p className="text-gray-600 text-lg mb-6">{step.description}</p>

        {step.items && (
          <ul className="text-left text-gray-600 mb-8 list-disc list-inside">
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
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-600 hover:text-yellow-700 font-medium underline decoration-yellow-400/30 underline-offset-4"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {step.secondaryImage && (
          <div className="mb-8 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
            <Image 
              src={step.secondaryImage} 
              alt="Illustration secondaire" 
              width={350} 
              height={200} 
              className="object-cover"
            />
          </div>
        )}

        <div className="flex gap-2 mb-12">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                index === currentStep ? "bg-yellow-400" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <div className="flex justify-between w-full mt-auto">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              currentStep === 0 ? "invisible" : "text-gray-400 hover:text-black cursor-pointer"
            }`}
          >
            Précédent
          </button>

          <button
            onClick={nextStep}
            className={`px-8 py-2 rounded-full font-bold transition-all cursor-pointer ${
              currentStep === steps.length - 1
                ? isBackendReady
                  ? "bg-yellow-400 text-black hover:bg-yellow-500 shadow-lg"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-zinc-800"
            }`}
          >
            {currentStep === steps.length - 1 
              ? (isBackendReady ? "Commencer" : "Initialisation...") 
              : "Suivant"}
          </button>
        </div>
      </div>
    </div>
  );
}
