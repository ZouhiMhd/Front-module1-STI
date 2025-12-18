import { ClinicalCase } from '@/app/utils/types/clinicalCase';
import { KNOWLEDGE_BASE, SpecialtyKey } from './knowledgeBase';

/**
 * Normalise le texte pour l'analyse (minuscules, sans accents).
 */
const normalizeText = (text: string): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .trim();
};

/**
 * Calcule l'âge du patient.
 */
const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

/**
 * Compte les occurrences de mots-clés dans un corpus de texte.
 * C'est notre variable X dans le modèle linéaire.
 */
const countOccurrences = (corpus: string, keywords: string[]): number => {
  let count = 0;
  keywords.forEach(keyword => {
    if (corpus.includes(normalizeText(keyword))) {
      count++;
    }
  });
  return count;
};

/**
 * Classificateur basé sur un Modèle Linéaire.
 * Formule : Score = (W1 * X1) + (W2 * X2) + (W3 * X3) + (W4 * X4) + Biais
 */
export const classifyClinicalCase = (clinicalCase: ClinicalCase): SpecialtyKey => {

  // 1. Définition des Poids (Coefficients W) du modèle
  const WEIGHTS = {
    disease: 10.0,   // Poids fort pour les maladies diagnostiquées
    exam: 5.0,       // Poids moyen pour les examens spécifiques
    symptom: 3.0,    // Poids standard pour les symptômes
    treatment: 1.0   // Poids faible pour les traitements
  };

  // 2. Construction du vecteur de caractéristiques (Corpus de texte)
  const searchCorpus = normalizeText([
    clinicalCase.consultation.reason,
    ...clinicalCase.consultation.symptoms.map(s => `${s.location} ${s.triggerActivity}`),
    ...clinicalCase.history.chronicDiseases.map(d => d.name),
    ...clinicalCase.history.surgeries.map(s => s.name),
    ...clinicalCase.consultation.physicalDiagnosis.map(p => `${p.name} ${p.result} ${p.observation}`),
    ...clinicalCase.exams.map(e => `${e.examName} ${e.result} ${e.anatomy}`),
    ...clinicalCase.treatments.map(t => t.drugName)
  ].join(" "));

  // 3. Calcul du Biais (Bias B)
  // Le biais permet d'ajuster le score de base selon des critères démographiques (ex: âge)
  const age = calculateAge(clinicalCase.patient.birthDate);
  const pediatricBias = age < 15 ? 30.0 : 0.0; // Biais fort vers la pédiatrie si enfant

  // 4. Calcul des scores pour chaque spécialité (Régression/Score Linéaire)
  let bestSpecialty: SpecialtyKey = 'general_medicine';
  let maxScore = 0;

  (Object.keys(KNOWLEDGE_BASE) as Array<keyof typeof KNOWLEDGE_BASE>).forEach((specialty) => {
    const kb = KNOWLEDGE_BASE[specialty];

    // Variables X (Occurrences)
    const x_disease = countOccurrences(searchCorpus, kb.diseases);
    const x_symptom = countOccurrences(searchCorpus, kb.symptoms);
    const x_exam = countOccurrences(searchCorpus, kb.exams);
    const x_treatment = countOccurrences(searchCorpus, kb.treatments);

    // Fonction Linéaire : y = w1*x1 + w2*x2 + w3*x3 + w4*x4 + b
    let score = (WEIGHTS.disease * x_disease) +
                (WEIGHTS.symptom * x_symptom) +
                (WEIGHTS.exam * x_exam) +
                (WEIGHTS.treatment * x_treatment);

    // Ajout du biais spécifique
    if (specialty === 'pediatrics') {
      score += pediatricBias;
    }

    // Mise à jour du maximum (ArgMax)
    if (score > maxScore) {
      maxScore = score;
      bestSpecialty = specialty;
    }
  });

  // 5. Seuil de décision (Threshold)
  // Si le score max est trop faible, on classe en médecine générale par défaut
  if (maxScore < 10 && bestSpecialty !== 'pediatrics' as SpecialtyKey) {
    return 'general_medicine';
  }

  return bestSpecialty;
};
