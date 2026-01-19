// app/services/clinicalCaseService.ts
import { ClinicalCase } from '@/app/utils/types/clinicalCase';

export type ViewMode = 'ALL' | 'PENDING' | 'VALIDATED' | 'DELETED';

export interface CaseFilters {
  searchQuery: string;
  gender: string;      // 'ALL', 'M', 'F'
  yearRange: string;   // 'ALL' ou la valeur exacte (ex: "36-50")
  finalDiagnostic: string;  // 'ALL' ou résultat du diag physique
}

export const INITIAL_FILTERS: CaseFilters = {
  searchQuery: '',
  gender: 'ALL',
  yearRange: 'ALL',
  finalDiagnostic: 'ALL'
};

// --- Main Logic ---

export const getCaseStats = (cases: ClinicalCase[]) => {
  return {
    total: cases.length,
    pending: cases.filter(c => c.status === 'PENDING').length,
    validated: cases.filter(c => c.status === 'VALIDATED').length,
    deleted: cases.filter(c => c.status === 'DELETED').length,
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

 

       // 5. Filtre par Diagnostic Final
    if (filters.finalDiagnostic && filters.finalDiagnostic !== 'ALL') {
      const searchTerm = filters.finalDiagnostic.toLowerCase();
      const diagFinal = c.diagnostic?.diagnostic_final?.toLowerCase() || '';
      
      if (!diagFinal.includes(searchTerm)) {
          return false;
      }
    }

    // 6. Recherche Textuelle Globale
    if (filters.searchQuery) {
      const lowerQuery = filters.searchQuery.toLowerCase();
      const inReason = c.consultation.reason.toLowerCase().includes(lowerQuery);
      const inSymptoms = c.consultation.symptoms.some(s => s.location.toLowerCase().includes(lowerQuery));
      // On ajoute aussi le diagnostic final dans la recherche globale pour être complet
      const inDiag = c.diagnostic?.diagnostic_final?.toLowerCase().includes(lowerQuery);

      if (!inReason && !inSymptoms && !inDiag) return false;
    }

    return true;
  });
};

// Extract unique options for Select inputs dynamically
// --- MODIFICATION ICI ---
export const extractFilterOptions = (cases: ClinicalCase[]) => {
  const histories = new Set<string>();
  const yearRanges = new Set<string>();
  const diagnostics = new Set<string>(); // 1. Nouveau Set pour les diagnostics

  cases.forEach(c => {
    // Tranches d'âge
    if (c.patient.yearRange) yearRanges.add(c.patient.yearRange);
    
    // Antécédents
    c.history.chronicDiseases.forEach(d => {
        if(d.name) histories.add(d.name);
    });

    // 2. Extraction des Diagnostics Finals
    if (c.diagnostic?.diagnostic_final) {
        // On nettoie les espaces inutiles
        diagnostics.add(c.diagnostic.diagnostic_final.trim());
    }
    console.log(c.diagnostic?.diagnostic_final);
  });

  return {
    histories: Array.from(histories).sort(),
    yearRanges: Array.from(yearRanges).sort(),
    // 3. On retourne la liste triée
    finalDiagnostics: Array.from(diagnostics).sort() 
  };
};
