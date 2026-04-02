// Copyright (c) 2026 Julien Didier
// Licensed under the MIT License
"use client";

import { useLanguage } from "../languageContext";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl dark:bg-zinc-900 border border-zinc-100 dark:border-white/5">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:hover:text-white transition-all"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-yellow-400 shadow-lg shadow-yellow-400/20">
            <span className="text-4xl">👻</span>
          </div>
          
          <h2 className="mb-1 text-2xl font-black text-zinc-900 dark:text-white">
            {t.about.version}
          </h2>
          
          <p className="mb-6 font-bold text-yellow-600 dark:text-yellow-400">
            {t.about.copyright}
          </p>

          <div className="mb-8 rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-800/50 border border-zinc-100 dark:border-white/5">
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {t.about.description}
            </p>
          </div>

          <div className="w-full space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              {t.about.source_code}
            </div>
            <a 
              href="https://github.com/JulienDidier-PNS/snap-exporter"
              onClick={(e) => handleLinkClick(e, 'https://github.com/JulienDidier-PNS/snap-exporter')}
              className="flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-black hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub Repository
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
