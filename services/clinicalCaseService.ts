// app/services/clinicalCaseService.ts
import { ClinicalCase } from '@/app/utils/types/clinicalCase';

export type ViewMode = 'ALL' | 'PENDING' | 'VALIDATED' | 'REJECTED';

export interface CaseFilters {
  searchQuery: string;
  gender: string;      // 'ALL', 'M', 'F'
  yearRange: string;   // 'ALL' ou la valeur exacte (ex: "36-50")
  medicalHistory: string; // 'ALL' ou nom de la maladie
  pathology: string;   // 'ALL' ou résultat du diag physique
}

export const INITIAL_FILTERS: CaseFilters = {
  searchQuery: '',
  gender: 'ALL',
  yearRange: 'ALL',
  medicalHistory: 'ALL',
  pathology: 'ALL'
};

// --- Main Logic ---

export const getCaseStats = (cases: ClinicalCase[]) => {
  return {
    total: cases.length,
    pending: cases.filter(c => c.status === 'PENDING').length,
    validated: cases.filter(c => c.status === 'VALIDATED').length,
    rejected: cases.filter(c => c.status === 'REJECTED').length,
  };
};

/**
 * Filtre principal
 */
export const filterClinicalCases = <T extends ClinicalCase>(
  cases: T[],
  viewMode: ViewMode,
  filters: CaseFilters
): T[] => {
  
  return cases.filter((c) => {
    // 1. Filtre par Onglet (Status)
    if (viewMode !== 'ALL' && c.status !== viewMode) return false;

    // 2. Filtre par Genre
    if (filters.gender !== 'ALL' && c.patient.gender !== filters.gender) return false;

    // 3. Filtre par Age (Comparaison directe de la chaîne year_range)
    if (filters.yearRange !== 'ALL' && c.patient.yearRange !== filters.yearRange) {
        return false;
    }

    // 4. Filtre par Antécédent
    if (filters.medicalHistory !== 'ALL') {
      const hasHistory = c.history.chronicDiseases.some(d => d.name === filters.medicalHistory);
      if (!hasHistory) return false;
    }

    // 5. Filtre par Pathologie (Diagnostic Physique)
    if (filters.pathology && filters.pathology !== 'ALL') {
      const searchTerm = filters.pathology.toLowerCase();
      
      const hasPathology = c.consultation.physicalDiagnosis.some(d => 
        d.result.toLowerCase().includes(searchTerm)
      );
      
      if (!hasPathology) return false;
    }

    // 6. Recherche Textuelle Globale
   if (filters.searchQuery) {
      const lowerQuery = filters.searchQuery.toLowerCase();
      
      const inReason = c.consultation.reason.toLowerCase().includes(lowerQuery);
      
      const inSymptoms = c.consultation.symptoms.some(s => 
        s.location.toLowerCase().includes(lowerQuery)
      );
      
      const inDiagnosis = c.consultation.physicalDiagnosis.some(d => 
          d.result.toLowerCase().includes(lowerQuery)
      );

      if (!inReason && !inSymptoms && !inDiagnosis) return false;
    }

    return true;
  });
};

// Extract unique options for Select inputs dynamically
export const extractFilterOptions = (cases: ClinicalCase[]) => {
  const histories = new Set<string>();
  const pathologies = new Set<string>();
  const yearRanges = new Set<string>(); // Ajout pour extraire les tranches d'âge existantes

  cases.forEach(c => {
    // Tranches d'âge
    if (c.patient.yearRange) {
        yearRanges.add(c.patient.yearRange);
    }

    // Antécédents
    c.history.chronicDiseases.forEach(d => {
        if(d.name) histories.add(d.name);
    });
    
    // Pathologies (Diagnostic Physique)
    c.consultation.physicalDiagnosis.forEach(d => {
        if(d.result) pathologies.add(d.result); 
    });
  });

  return {
    histories: Array.from(histories).sort(),
    pathologies: Array.from(pathologies).sort(),
    yearRanges: Array.from(yearRanges).sort() // Retourne les tranches triées (ex: "0-5", "36-50")
  };
};