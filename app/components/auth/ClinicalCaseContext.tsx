"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { ClinicalCase } from '@/app/utils/types/clinicalCase';
import { classifyClinicalCase } from '@/lib/classification/classifier';
import { apiFetch } from '@/lib/apiClient';
import { mapBackendCaseToFrontend } from '@/lib/mappers';
import { useAuth } from '@/app/components/auth/AuthContext';

export type ClassifiedClinicalCase = ClinicalCase & {
  detectedSpecialty: string;
};

// À mettre au début du fichier ClinicalCaseContext.tsx ou dans un utilitaire
const normalizeBackendSpecialty = (spec: string | null): string => {
    if (!spec) return "";
    const s = spec.toLowerCase();
    if (s.includes('cardio')) return 'cardiology';
    if (s.includes('derma')) return 'dermatology';
    if (s.includes('pedia')) return 'pediatrics';
    if (s.includes('neuro')) return 'neurology';
    if (s.includes('ortho')) return 'orthopedics';
    if (s.includes('chirur') || s.includes('surg')) return 'surgery';
    return 'general_medicine';
};

interface ClinicalCaseContextType {
  cases: ClassifiedClinicalCase[];
  isLoading: boolean;
  error: string | null;
  // --- Pagination ---
  totalCount: number;
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  goToPage: (page: number) => Promise<void>;
  // --- Actions ---
  getCaseById: (id: string) => Promise<ClassifiedClinicalCase | null>;
  validateCase: (id: string, specialty: string, diagnosticFinal: string) => Promise<void>;
  rejectCase: (id: string, reason: string) => Promise<void>;
  restoreCase: (id: string) => Promise<void>;
  refreshCases: () => Promise<void>;
  syncWithBackend: () => Promise<void>;
}

const ClinicalCaseContext = createContext<ClinicalCaseContextType | undefined>(undefined);

export function ClinicalCaseProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<ClassifiedClinicalCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États de pagination
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const { isAuthenticated } = useAuth();
  const casesRef = useRef<ClassifiedClinicalCase[]>([]);

  // Synchronisation du ref pour getCaseById (cache)
  useEffect(() => {
    casesRef.current = cases;
  }, [cases]);

  /**
   * CHARGEMENT DES DONNÉES (Supporte la pagination)
   */
// app/components/auth/ClinicalCaseContext.tsx

const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    
    try {
        let aggregatedCases: ClassifiedClinicalCase[] = [];
        let nextUrl: string | null = '/cases/'; // Point d'entrée

        while (nextUrl) {
            // On extrait juste la partie après /v1/ car apiFetch ajoute le BASE_URL
            const cleanUrl = nextUrl.includes('/api/v1') ? nextUrl.split('/api/v1')[1] : nextUrl;
            const response: any = await apiFetch(cleanUrl);
            
            const rawResults = response.results || [];
            const mappedList = rawResults.map((item: any) => {
                const frontendCase = mapBackendCaseToFrontend(item);
                
                const rawSpec = item.specialite_confirmee || item.specialite_suggeree;
                const finalSpecialty = rawSpec 
                    ? normalizeBackendSpecialty(rawSpec) 
                    : classifyClinicalCase(frontendCase);

                return {
                    ...frontendCase,
                    detectedSpecialty: finalSpecialty
                };
            });

            aggregatedCases = [...aggregatedCases, ...mappedList];
            
            // Si le backend renvoie une URL complète dans "next", on continue la boucle
            nextUrl = response.next || null;
             if (aggregatedCases.length <= rawResults.length) {
                setTotalCount(response.count || 0);
            }
        }

        setCases(aggregatedCases);
    } catch (err) {
        console.error("Erreur d'agrégation:", err);
        setError("Impossible de récupérer l'ensemble des données.");
    } finally {
        setIsLoading(false);
    }
}, [isAuthenticated]);

  // Initialisation
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * ACTIONS NAVIGATION
   */
  const goToPage = async (page: number) => {
    await loadData();
  };

  const refreshCases = () => loadData();

  const syncWithBackend = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      await apiFetch('/sync/');
      await loadData();
    } catch (err) {
      console.error("Erreur sync:", err);
      setError("Échec de la synchronisation.");
      setIsLoading(false);
    }
  }, [isAuthenticated, loadData]);

  /**
   * RÉCUPÉRATION DÉTAIL
   */
  const getCaseById = useCallback(async (id: string): Promise<ClassifiedClinicalCase | null> => {
    // 1. Check Cache
    const cached = casesRef.current.find(c => c.id === id);
    // On considère un cas "complet" s'il a déjà été chargé avec ses notes ou symptômes
    if (cached && cached.consultation.notes?.length > 0) {
      return cached;
    }

    // 2. Fetch API si non présent ou incomplet
    try {
      const rawData = await apiFetch(`/cases/${id}/`);
      const frontendCase = mapBackendCaseToFrontend(rawData);
      const classifiedCase: ClassifiedClinicalCase = {
        ...frontendCase,
        detectedSpecialty: classifyClinicalCase(frontendCase)
      };

      // Update state
      setCases(prev => {
        const exists = prev.some(c => c.id === id);
        if (exists) return prev.map(c => c.id === id ? classifiedCase : c);
        return [...prev, classifiedCase];
      });

      return classifiedCase;
    } catch (err) {
      console.error(`Erreur fetch detail ${id}:`, err);
      return null;
    }
  }, []);

  /**
   * ACTIONS (Validation, Rejet, Restauration)
   */
  const validateCase = useCallback(async (id: string, specialty: string, diagnosticFinal: string) => {
    try {
      await apiFetch(`/cases/${id}/confirm-specialty/`, {
        method: 'PATCH',
        body: { 
          specialite_confirmee: specialty,
          diagnostic_final: diagnosticFinal
        }
      });
      // Update local state
      setCases(prev => prev.map(c => c.id === id ? { ...c, status: 'VALIDATED' } : c));
    } catch (err) {
      throw err;
    }
  }, []);

  const rejectCase = useCallback(async (id: string, reason: string) => {
    try {
      await apiFetch(`/cases/${id}/`, {
        method: 'DELETE',
        body: { rejection_reason: reason }
      });
      setCases(prev => prev.map(c => c.id === id ? { ...c, status: 'DELETED', rejectionReason: reason } : c));
    } catch (err) {
      throw err;
    }
  }, []);

  const restoreCase = useCallback(async (id: string) => {
    const currentCase = casesRef.current.find(c => c.id === id);
    try {
      await apiFetch(`/cases/${id}/restore/`, {
        method: 'PATCH',
        body: {
          status: "PENDING",
          rejection_reason: null,
          specialite_confirmee: null,
          age_tranche: currentCase?.patient.yearRange,
          sexe: currentCase?.patient.gender
        }
      });
      setCases(prev => prev.map(c => c.id === id ? { ...c, status: 'PENDING', rejectionReason: undefined } : c));
    } catch (err) {
      throw err;
    }
  }, []);

  return (
    <ClinicalCaseContext.Provider
      value={{
        cases,
        isLoading,
        error,
        totalCount,
        currentPage,
        hasNext,
        hasPrev,
        goToPage,
        getCaseById,
        validateCase,
        rejectCase,
        restoreCase,
        refreshCases,
        syncWithBackend 
      }}
    >
      {children}
    </ClinicalCaseContext.Provider>
  );
}

export function useClinicalCases() {
  const context = useContext(ClinicalCaseContext);
  if (context === undefined) {
    throw new Error('useClinicalCases must be used within a ClinicalCaseProvider');
  }
  return context;
}