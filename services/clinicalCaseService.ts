// app/services/clinicalCaseService.ts
import { ClinicalCase } from '@/app/utils/types/clinicalCase'; // Ton type existant

export type ViewMode = 'ALL' | 'PENDING' | 'VALIDATED' | 'REJECTED';

export interface CaseFilters {
  searchQuery: string;
  gender: string; // 'ALL', 'M', 'F'
  ageRange: string; // 'ALL', '0-18', '19-35', '36-60', '60+'
  medicalHistory: string; // 'ALL' ou nom de la maladie
  pathology: string; // 'ALL' ou nom du diag physique
}

export const INITIAL_FILTERS: CaseFilters = {
  searchQuery: '',
  gender: 'ALL',
  ageRange: 'ALL',
  medicalHistory: 'ALL',
  pathology: 'ALL'
};

// --- Helpers ---

const calculateAge = (birthDate: string): number => {
  return new Date().getFullYear() - new Date(birthDate).getFullYear();
};

const isAgeInRange = (age: number, range: string): boolean => {
  switch (range) {
    case '0-18': return age <= 18;
    case '19-35': return age > 18 && age <= 35;
    case '36-60': return age > 35 && age <= 60;
    case '60+': return age > 60;
    default: return true;
  }
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
 * Filtre principal qui combine :
 * 1. Le mode de vue (Onglets : Pending, Validated...)
 * 2. Les filtres latéraux (Genre, Age, etc.)
 * 3. La recherche textuelle
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

    // 3. Filtre par Age
    // Note: Assurez-vous que calculateAge et isAgeInRange sont bien définis dans ce fichier ou importés
    const age = new Date().getFullYear() - new Date(c.patient.birthDate).getFullYear(); 
    if (filters.ageRange !== 'ALL') {
        // Logique de plage d'âge (simplifiée ici pour l'exemple, ou utilisez vos helpers)
        const inRange = checkAgeRange(age, filters.ageRange); 
        if (!inRange) return false;
    }

    // 4. Filtre par Antécédent
    if (filters.medicalHistory !== 'ALL') {
      const hasHistory = c.history.chronicDiseases.some(d => d.name === filters.medicalHistory);
      if (!hasHistory) return false;
    }

    // 5. Filtre par Pathologie
    if (filters.pathology && filters.pathology !== 'ALL') {
      const searchTerm = filters.pathology.toLowerCase();
      
      const hasPathology = c.consultation.physicalDiagnosis.some(d => 
        // Recherche dans le nom de l'examen (ex: "Cardiologie")
        d.name.toLowerCase().includes(searchTerm) || 
        // Recherche DANS LE RÉSULTAT (ex: "Signes de péricardite")
        d.result.toLowerCase().includes(searchTerm)
      );
      
      if (!hasPathology) return false;
    }

    // 6. Recherche Textuelle
   if (filters.searchQuery) {
      const lowerQuery = filters.searchQuery.toLowerCase();
      const inReason = c.consultation.reason.toLowerCase().includes(lowerQuery);
      const inSymptoms = c.consultation.symptoms.some(s => s.location.toLowerCase().includes(lowerQuery));
      
      // Ajout de la recherche dans les diagnostics physiques pour la barre globale aussi
      const inDiagnosis = c.consultation.physicalDiagnosis.some(d => 
          d.result.toLowerCase().includes(lowerQuery) || 
          d.name.toLowerCase().includes(lowerQuery)
      );

      if (!inReason && !inSymptoms && !inDiagnosis) return false;
    }

    return true;
  });
};

// Helper interne pour l'âge (si pas déjà présent)
function checkAgeRange(age: number, range: string): boolean {
    switch (range) {
        case '0-18': return age <= 18;
        case '19-35': return age > 18 && age <= 35;
        case '36-60': return age > 35 && age <= 60;
        case '60+': return age > 60;
        default: return true;
    }
}
// Extract unique options for Select inputs dynamically
export const extractFilterOptions = (cases: ClinicalCase[]) => {
  const histories = new Set<string>();
  const pathologies = new Set<string>();

  cases.forEach(c => {
    c.history.chronicDiseases.forEach(d => histories.add(d.name));
    // On peut extraire le nom de l'examen ou des mots clés du résultat selon ton besoin
    c.consultation.physicalDiagnosis.forEach(d => {
        pathologies.add(d.name); 
        // Si tu veux aussi filtrer par les résultats uniques, décommente la ligne suivante :
        // pathologies.add(d.result); 
    });
  });

  return {
    histories: Array.from(histories).sort(),
    pathologies: Array.from(pathologies).sort()
  };
};