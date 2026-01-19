// app/services/statsService.ts
import { ClinicalCase } from '@/app/utils/types/clinicalCase';

export interface GlobalStats {
  totalCases: number;
  validatedCount: number;
  rejectedCount: number;
  pendingCount: number;
  rejectionRate: number;
  validationRate: number;
}

export interface DemographicStats {
  maleCount: number;
  femaleCount: number;
  ageGroups: { [key: string]: number }; // ex: "0-18": 5
}

export interface TopItem {
  name: string;
  count: number;
  percentage: number;
}

// --- CALCUL DES STATS GLOBALES ---
export const calculateGlobalStats = (cases: ClinicalCase[]): GlobalStats => {
  const total = cases.length;
  if (total === 0) return { totalCases: 0, validatedCount: 0, rejectedCount: 0, pendingCount: 0, rejectionRate: 0, validationRate: 0 };

  const validated = cases.filter(c => c.status === 'VALIDATED').length;
  const rejected = cases.filter(c => c.status === 'DELETED').length;
  const pending = cases.filter(c => c.status === 'PENDING').length;

  return {
    totalCases: total,
    validatedCount: validated,
    rejectedCount: rejected,
    pendingCount: pending,
    rejectionRate: Math.round((rejected / total) * 100),
    validationRate: Math.round((validated / total) * 100),
  };
};


// --- CALCUL DEMOGRAPHIQUE (Adapté au format yearRange) ---
export const calculateDemographics = (cases: ClinicalCase[]): DemographicStats => {
  let male = 0;
  let female = 0;
  const groups = { "0-18": 0, "19-35": 0, "36-60": 0, "60+": 0 };

  cases.forEach(c => {
    // Genre
    if (c.patient.gender === 'M') male++;
    else female++;

    // Age (Basé sur yearRange "min-max")
    // On prend la borne inférieure pour classer
    let age = 0;
    if (c.patient.yearRange) {
        const parts = c.patient.yearRange.split('-');
        if (parts.length > 0) {
            age = parseInt(parts[0], 10); // Prend "36" de "36-50"
        } else if (c.patient.yearRange.includes('+')) {
            age = parseInt(c.patient.yearRange, 10); // Prend "60" de "60+"
        }
    }

    if (age <= 18) groups["0-18"]++;
    else if (age <= 35) groups["19-35"]++;
    else if (age <= 60) groups["36-60"]++;
    else groups["60+"]++;
  });

  return { maleCount: male, femaleCount: female, ageGroups: groups };
};

// --- TOP PATHOLOGIES (Adapté pour utiliser diagnostic_final) ---
export const getTopPathologies = (cases: ClinicalCase[], limit: number = 5): TopItem[] => {
  const counts: { [key: string]: number } = {};

  cases.forEach(c => {
    // On utilise le diagnostic final s'il existe, sinon le motif
    const pathology = c.diagnostic?.diagnostic_final || c.consultation.reason || "Non spécifié";
    
    // Nettoyage basique
    const cleanName = pathology.trim();
    
    counts[cleanName] = (counts[cleanName] || 0) + 1;
  });

  // Convertir en tableau et trier
  const sorted = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / cases.length) * 100)
    }));

  return sorted;
};