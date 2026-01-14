"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface TutorialContextType {
  hasCompletedTutorial: boolean;
  showTutorial: boolean;
  setHasCompletedTutorial: (completed: boolean) => void;
  setShowTutorial: (show: boolean) => void;
  openTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [hasCompletedTutorial, setHasCompletedTutorialState] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const tutorialDone = localStorage.getItem("tutorial_completed") === "true";
    if (tutorialDone) {
      setHasCompletedTutorialState(true);
    } else {
        setShowTutorial(true);
    }
  }, []);

  const setHasCompletedTutorial = (completed: boolean) => {
    setHasCompletedTutorialState(completed);
    if (completed) {
      localStorage.setItem("tutorial_completed", "true");
      setShowTutorial(false);
    } else {
      localStorage.removeItem("tutorial_completed");
    }
  };

  const openTutorial = () => {
    setShowTutorial(true);
  };

  return (
    <TutorialContext.Provider
      value={{
        hasCompletedTutorial,
        showTutorial,
        setHasCompletedTutorial,
        setShowTutorial,
        openTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
}
