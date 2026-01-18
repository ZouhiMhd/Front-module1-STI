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

interface ClinicalCaseContextType {
  cases: ClassifiedClinicalCase[];
  isLoading: boolean;
  error: string | null;
  getCaseById: (id: string) => Promise<ClassifiedClinicalCase | null>;
  validateCase: (id: string, specialty?: string) => Promise<void>;
  rejectCase: (id: string, reason?: string) => Promise<void>;
  refreshCases: () => Promise<void>;
}

const ClinicalCaseContext = createContext<ClinicalCaseContextType | undefined>(undefined);

export function ClinicalCaseProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<ClassifiedClinicalCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  
  const casesRef = useRef<ClassifiedClinicalCase[]>([]);
  
  useEffect(() => {
    casesRef.current = cases;
  }, [cases]);

  // --- CHARGEMENT DES CAS ---
  // Dans app/components/auth/ClinicalCaseContext.tsx

// ...

  // --- 1. CHARGEMENT DES CAS (GET /cases/) ---
  const loadData = useCallback(async () => {
    if (!isAuthenticated) {
        setIsLoading(false);
        return;
    }
    
    // On ne met le loader que si c'est vide au départ
    setCases(current => {
        if (current.length === 0) setIsLoading(true);
        return current;
    });

    setError(null);
    
    try {
      const response: any = await apiFetch('/cases/');
      const rawData = Array.isArray(response) ? response : (response.results || []);
      
      const mappedList = rawData.map((item: any) => {
        try {
            const frontendCase = mapBackendCaseToFrontend(item);
            return {
              ...frontendCase,
              detectedSpecialty: classifyClinicalCase(frontendCase)
            };
        } catch (e) {
            return null;
        }
      }).filter((c: any) => c !== null);
      
      // CORRECTION MAJEURE ICI : FUSION INTELLIGENTE
      setCases(prevCases => {
          // On crée une map des nouveaux cas pour accès rapide
          const newCasesMap = new Map(mappedList.map((c: any) => [c.id, c]));
          
          // On parcourt les anciens cas. Si un ancien cas a plus de détails (ex: notes, IA), on le garde !
          // Comment savoir s'il a plus de détails ? On peut vérifier une propriété spécifique au détail.
          // Ici, on suppose que si on l'a chargé individuellement, il est "mieux".
          
          // Stratégie simple : Si le cas existe déjà dans le state, on ne l'écrase pas avec la version liste
          // SAUF si on veut forcer la mise à jour du statut.
          
          // Meilleure stratégie : On prend la liste fraîche, MAIS pour chaque cas, si on en avait une version
          // détaillée en mémoire, on essaie de fusionner ou de garder la version détaillée.
          
          return mappedList.map((newCase: any) => {
              const existing = prevCases.find(p => p.id === newCase.id);
              
              // Si on a une version existante qui semble "complète" (ex: a des notes ou symptômes IA), on la garde
              // tout en mettant à jour le statut qui pourrait avoir changé.
              if (existing && (existing.consultation.notes?.length > 0 || existing.consultation.suspectedDisease?.length > 0)) {
                  return {
                      ...existing,
                      status: newCase.status // On met juste à jour le statut
                  };
              }
              return newCase;
          });
      });

    } catch (err) {
      console.error("Erreur chargement API:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);
  // Chargement initial
  useEffect(() => {
    console.log('🚀 [ClinicalCaseContext] useEffect initial déclenché');
    loadData();
  }, [loadData]);

  // --- RÉCUPÉRATION DÉTAIL ---
  const getCaseById = useCallback(async (id: string): Promise<ClassifiedClinicalCase | null> => {
    console.log('🔍 [getCaseById] Recherche du cas:', id);
    
    const cached = casesRef.current.find(c => c.id === id);
    
    if (cached) {
      console.log('✅ [getCaseById] Cas trouvé en cache');
      return cached;
    }

    console.log('📡 [getCaseById] Cas non trouvé en cache, appel API...');
    
    try {
      const rawData = await apiFetch(`/cases/${id}`);
      console.log('✅ [getCaseById] Réponse API reçue pour le cas:', id);
      
      const frontendCase = mapBackendCaseToFrontend(rawData);
      const classifiedCase: ClassifiedClinicalCase = {
        ...frontendCase,
        detectedSpecialty: classifyClinicalCase(frontendCase)
      };

      setCases(prevCases => {
        const exists = prevCases.some(c => c.id === id);
        if (exists) {
          return prevCases.map(c => c.id === id ? classifiedCase : c);
        }
        return [...prevCases, classifiedCase];
      });

      return classifiedCase;
    } catch (err) {
      console.error(`❌ [getCaseById] Erreur fetch case ${id}:`, err);
      setError(`Impossible de charger le cas ${id}`);
      return null;
    }
  }, []);

  // --- VALIDATION ---
  const validateCase = useCallback(async (id: string, specialty?: string) => {
    console.log('✅ [validateCase] Validation du cas:', id, 'spécialité:', specialty);
    const previousCases = casesRef.current;
    
    try {
      setCases(prev => prev.map(c => 
        c.id === id ? { ...c, status: 'VALIDATED' as const } : c
      ));

      await apiFetch(`/cases/${id}/confirm_speciality/`, {
        method: 'POST',
        body: { specialty: specialty || 'general_medicine' }
      });
      
      console.log('✅ [validateCase] Cas validé, rafraîchissement...');
      await loadData();
    } catch (err) {
      console.error('❌ [validateCase] Erreur validation:', err);
      setCases(previousCases);
      setError("Échec de la validation du cas");
      throw err;
    }
  }, [loadData]);

  // --- REJET ---
  const rejectCase = useCallback(async (id: string, reason?: string) => {
    console.log('❌ [rejectCase] Rejet du cas:', id, 'raison:', reason);
    const previousCases = casesRef.current;
    
    try {
      setCases(prev => prev.map(c => 
        c.id === id 
          ? { ...c, status: 'REJECTED' as const, rejectionReason: reason } 
          : c
      ));

      await apiFetch(`/cases/${id}`, {
        method: 'DELETE'
      });
      
      setCases(prev => prev.filter(c => c.id !== id));
      console.log('✅ [rejectCase] Cas rejeté et supprimé');
    } catch (err) {
      console.error('❌ [rejectCase] Erreur rejet:', err);
      setCases(previousCases);
      setError("Échec du rejet du cas");
      throw err;
    }
  }, []);

  const refreshCases = useCallback(async () => {
    console.log('🔄 [refreshCases] Rafraîchissement manuel...');
    await loadData();
  }, [loadData]);

  // LOG DU STATE À CHAQUE CHANGEMENT
  useEffect(() => {
    console.log('📊 [ClinicalCaseContext] State mis à jour:', {
      casesCount: cases.length,
      isLoading,
      error,
      caseIds: cases.map(c => c.id)
    });
  }, [cases, isLoading, error]);

  return (
    <ClinicalCaseContext.Provider
      value={{
        cases,
        isLoading,
        error,
        getCaseById,
        validateCase,
        rejectCase,
        refreshCases
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