"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ClinicalCase } from '@/app/utils/types/clinicalCase';
import { classifyClinicalCase } from '@/lib/classification/classifier';
import { apiFetch } from '@/lib/apiClient';
import { mapBackendCaseToFrontend } from '@/lib/mappers';

// Type étendu
export type ClassifiedClinicalCase = ClinicalCase & {
  detectedSpecialty: string;
};

interface CaseDetailContextType {
  activeCase: ClassifiedClinicalCase | null;
  isLoading: boolean;
  error: string | null;
  fetchCaseDetail: (id: string) => Promise<void>;
  validateActiveCase: (specialty?: string) => Promise<void>;
  rejectActiveCase: (reason?: string) => Promise<void>;
  clearActiveCase: () => void;
}

const CaseDetailContext = createContext<CaseDetailContextType | undefined>(undefined);

export function CaseDetailProvider({ children }: { children: ReactNode }) {
  const [activeCase, setActiveCase] = useState<ClassifiedClinicalCase | null>(null);
  const [isLoading, setIsLoading] = useState(false); // False par défaut, activé à la demande
  const [error, setError] = useState<string | null>(null);

  // 1. Récupérer les détails complets depuis le serveur
  const fetchCaseDetail = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`📡 [CaseDetailContext] Fetching full details for ${id}...`);
      const rawData = await apiFetch<any>(`/cases/${id}`);
      
      const frontendCase = mapBackendCaseToFrontend(rawData);
      const classifiedCase = {
        ...frontendCase,
        detectedSpecialty: classifyClinicalCase(frontendCase)
      };

      setActiveCase(classifiedCase);
    } catch (err) {
      console.error(`❌ [CaseDetailContext] Error fetching case ${id}:`, err);
      setError("Impossible de charger le dossier. Veuillez vérifier votre connexion.");
      setActiveCase(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Valider le cas actif
  const validateActiveCase = useCallback(async (specialty?: string) => {
    if (!activeCase) return;
    
    const previousStatus = activeCase.status;
    // Optimistic Update
    setActiveCase(prev => prev ? { ...prev, status: 'VALIDATED' } : null);

    try {
      await apiFetch(`/cases/${activeCase.id}/confirm_speciality/`, {
        method: 'POST',
        body: { specialty: specialty || 'general_medicine' }
      });
    } catch (err) {
      console.error("Erreur validation:", err);
      // Rollback
      setActiveCase(prev => prev ? { ...prev, status: previousStatus } : null);
      throw err;
    }
  }, [activeCase]);

  // 3. Rejeter le cas actif
  const rejectActiveCase = useCallback(async (reason?: string) => {
    if (!activeCase) return;

    const previousStatus = activeCase.status;
    // Optimistic Update
    setActiveCase(prev => prev ? { ...prev, status: 'REJECTED', rejectionReason: reason } : null);

    try {
      await apiFetch(`/cases/${activeCase.id}`, {
        method: 'DELETE',
        body: { 
            rejection_reason: reason || "Rejeté par le spécialiste" 
        }
      });
    } catch (err) {
      console.error("Erreur rejet:", err);
      // Rollback
      setActiveCase(prev => prev ? { ...prev, status: previousStatus } : null);
      throw err;
    }
  }, [activeCase]);

  // 4. Nettoyer (quand on quitte la page)
  const clearActiveCase = useCallback(() => {
    setActiveCase(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return (
    <CaseDetailContext.Provider value={{ 
      activeCase, 
      isLoading, 
      error, 
      fetchCaseDetail, 
      validateActiveCase, 
      rejectActiveCase,
      clearActiveCase
    }}>
      {children}
    </CaseDetailContext.Provider>
  );
}

export function useCaseDetail() {
  const context = useContext(CaseDetailContext);
  if (context === undefined) {
    throw new Error('useCaseDetail must be used within a CaseDetailProvider');
  }
  return context;
}