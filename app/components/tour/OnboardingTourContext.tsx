"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface OnboardingTourContextType {
  run: boolean;
  startTour: () => void;
  stopTour: () => void;
  resetTour: () => void;
}

const OnboardingTourContext = createContext<OnboardingTourContextType | undefined>(undefined);

export const useOnboardingTour = () => {
  const context = useContext(OnboardingTourContext);
  if (!context) {
    throw new Error('useOnboardingTour must be used within an OnboardingTourProvider');
  }
  return context;
};

export const OnboardingTourProvider = ({ children }: { children: ReactNode }) => {
  const [run, setRun] = useState(false);

  const startTour = useCallback(() => {
    setRun(true);
  }, []);

  const stopTour = useCallback(() => {
    setRun(false);
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem('onboardingTourHasRun');
  }, []);

  return (
    <OnboardingTourContext.Provider value={{ run, startTour, stopTour, resetTour }}>
      {children}
    </OnboardingTourContext.Provider>
  );
};
