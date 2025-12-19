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
  const rejected = cases.filter(c => c.status === 'REJECTED').length;
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

// --- CALCUL DEMOGRAPHIQUE ---
export const calculateDemographics = (cases: ClinicalCase[]): DemographicStats => {
  let male = 0;
  let female = 0;
  const groups = { "0-18": 0, "19-35": 0, "36-60": 0, "60+": 0 };

  cases.forEach(c => {
    // Genre
    if (c.patient.gender === 'M') male++;
    else female++;

    // Age
    const age = new Date().getFullYear() - new Date(c.patient.birthDate).getFullYear();
    if (age <= 18) groups["0-18"]++;
    else if (age <= 35) groups["19-35"]++;
    else if (age <= 60) groups["36-60"]++;
    else groups["60+"]++;
  });

  return { maleCount: male, femaleCount: female, ageGroups: groups };
};

// --- TOP PATHOLOGIES (Basé sur le motif ou chronic diseases) ---
export const getTopPathologies = (cases: ClinicalCase[], limit: number = 5): TopItem[] => {
  const counts: { [key: string]: number } = {};

  cases.forEach(c => {
    // On utilise le motif de consultation comme proxy pour la pathologie principale
    const reason = c.consultation.reason;
    counts[reason] = (counts[reason] || 0) + 1;
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