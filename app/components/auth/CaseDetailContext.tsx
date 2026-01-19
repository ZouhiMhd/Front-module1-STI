"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ClinicalCase } from '@/app/utils/types/clinicalCase';
import { classifyClinicalCase } from '@/lib/classification/classifier';
import { apiFetch } from '@/lib/apiClient';
import { mapBackendCaseToFrontend } from '@/lib/mappers';

export type ClassifiedClinicalCase = ClinicalCase & {
  detectedSpecialty: string;
};

interface CaseDetailContextType {
  activeCase: ClassifiedClinicalCase | null;
  isLoading: boolean;
  error: string | null;
  fetchCaseDetail: (id: string) => Promise<void>;
  // Mise à jour des signatures
  validateActiveCase: (specialty: string, diagnosticFinal: string) => Promise<void>;
  rejectActiveCase: (reason: string) => Promise<void>;
  restoreActiveCase: () => Promise<void>;
  clearActiveCase: () => void;
}

const CaseDetailContext = createContext<CaseDetailContextType | undefined>(undefined);

export function CaseDetailProvider({ children }: { children: ReactNode }) {
  const [activeCase, setActiveCase] = useState<ClassifiedClinicalCase | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Detail
  const fetchCaseDetail = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const rawData = await apiFetch<any>(`/cases/${id}/`);
      const frontendCase = mapBackendCaseToFrontend(rawData);
      setActiveCase({
        ...frontendCase,
        detectedSpecialty: classifyClinicalCase(frontendCase)
      });
    } catch (err) {
      console.error(`Erreur fetch case ${id}:`, err);
      setError("Impossible de charger le dossier.");
      setActiveCase(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Validation (PATCH confirm-specialty)
  const validateActiveCase = useCallback(async (specialty: string, diagnosticFinal: string) => {
    if (!activeCase) return;
    const previousStatus = activeCase.status;
    
    // Optimistic Update
    setActiveCase(prev => prev ? { ...prev, status: 'VALIDATED' } : null);

    try {
      await apiFetch(`/cases/${activeCase.id}/confirm-specialty/`, {
        method: 'PATCH',
        body: { 
          specialite_confirmee: specialty,
          diagnostic_final: diagnosticFinal
        }
      });
    } catch (err) {
      console.error("Erreur validation:", err);
      setActiveCase(prev => prev ? { ...prev, status: previousStatus } : null);
      throw err;
    }
  }, [activeCase]);

  // 3. Rejet (DELETE avec Body)
  const rejectActiveCase = useCallback(async (reason: string) => {
    if (!activeCase) return;
    const previousStatus = activeCase.status;

    setActiveCase(prev => prev ? { ...prev, status: 'DELETED', rejectionReason: reason } : null);

    try {
      await apiFetch(`/cases/${activeCase.id}/`, {
        method: 'DELETE',
        body: { rejection_reason: reason }
      });
    } catch (err) {
      console.error("Erreur rejet:", err);
      setActiveCase(prev => prev ? { ...prev, status: previousStatus } : null);
      throw err;
    }
  }, [activeCase]);

  // 4. Restauration (PATCH restore)
  const restoreActiveCase = useCallback(async () => {
    if (!activeCase) return;
    const previousStatus = activeCase.status;

    setActiveCase(prev => prev ? { ...prev, status: 'PENDING', rejectionReason: undefined } : null);

    try {
      // On envoie les champs clés pour la restauration
      // Note: Si le backend a besoin de tout l'objet, on pourrait devoir mapper l'inverse (Frontend -> Backend)
      // Ici, on envoie les champs qui changent d'état.
      await apiFetch(`/cases/${activeCase.id}/restore/`, {
        method: 'PATCH',
        body: {
          status: "PENDING",
          rejection_reason: null,
          specialite_confirmee: null,
          // On renvoie les infos de base pour s'assurer que l'objet reste cohérent côté backend
          diagnostic_final: activeCase.diagnostic.diagnostic_final,
          age_tranche: activeCase.patient.yearRange,
          sexe: activeCase.patient.gender
        }
      });
    } catch (err) {
      console.error("Erreur restauration:", err);
      setActiveCase(prev => prev ? { ...prev, status: previousStatus } : null);
      throw err;
    }
  }, [activeCase]);

  const clearActiveCase = useCallback(() => {
    setActiveCase(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return (
    <CaseDetailContext.Provider value={{ 
      activeCase, isLoading, error, fetchCaseDetail, 
      validateActiveCase, rejectActiveCase, restoreActiveCase, clearActiveCase
    }}>
      {children}
    </CaseDetailContext.Provider>
  );
}

export function useCaseDetail() {
  const context = useContext(CaseDetailContext);
  if (context === undefined) throw new Error('useCaseDetail must be used within a CaseDetailProvider');
  return context;
}