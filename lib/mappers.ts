// lib/mappers.ts
import { 
  ClinicalCase, 
  PatientInfo, 
  Consultation, 
  MedicalHistory, 
  ExamResult, 
  Treatment, 
  Diagnostic,
  Note,
  Disease,
  Symptom
} from "@/app/utils/types/clinicalCase";

/**
 * Convertit un cas du format Backend vers le format Frontend
 */
export const mapBackendCaseToFrontend = (data: any): ClinicalCase => {
  if (!data) throw new Error("Données invalides reçues du backend");

  // 1. ID & Statut
  const id = data.patient_uuid || data.uuid || String(data.id);
  
  let status: 'PENDING' | 'VALIDATED' | 'REJECTED' = 'PENDING';
  if (data.is_validated) {
    status = 'VALIDATED';
  } else if (data.status === 'REJECTED') { 
    status = 'REJECTED';
  }

  // 2. Extraction des sous-objets (Gestion des tableaux vides ou nuls)
  const patientRaw = data.patient_info_raw || {};
  const vitalsRaw = (patientRaw.parametresVitaux && patientRaw.parametresVitaux.length > 0) 
    ? patientRaw.parametresVitaux[0] 
    : {};
  
  const consultationRaw = (data.motif_consultation && data.motif_consultation.length > 0) 
    ? data.motif_consultation[0] 
    : {};
    
  const iaData = consultationRaw.enrichissement_ia || {};
  const antecedentsRaw = data.antecedents || {};

  // 3. Mapping Patient
  const patient: PatientInfo = {
    id: id,
    yearRange: data.age_tranche || "Inconnu",
    civilStatus: patientRaw.etatCivil || "Inconnu", // Attention: JSON backend dit "etatCivil" (camelCase) ou "etat_civil" selon les versions, je garde etatCivil basé sur votre JSON précédent
    job: patientRaw.metier || "Non précisé",
    bloodGroup: "Inconnu", // Donnée absente du JSON backend fourni
    gender: (data.sexe === 'F' || patientRaw.sexe === 'F') ? 'F' : 'M',
    vitals: {
      temperature: parseFloat(vitalsRaw.temperatureCelsius || 0),
      pulse: parseInt(vitalsRaw.frequenceCardiaqueBpm || 0),
      weight: parseFloat(vitalsRaw.poidsKg || 0),
      height: parseFloat(vitalsRaw.tailleCm || 0),
      bloodPressure: vitalsRaw.tensionArterielle || "0/0",
      heartRate: parseInt(vitalsRaw.frequenceCardiaqueBpm || 0),
    },
    condition: patientRaw.conditionActuelle || "Non précisé",
    medicalService: patientRaw.serviceMedicalSuivi || "Non précisé"
  };

  // 4. Mapping Consultation
  // Gestion des maladies suspectées (peut être un objet unique ou un tableau dans le JSON)
  let diseases: Disease[] = [];
  const rawDiseases = iaData.maladies_suspectees;
  if (Array.isArray(rawDiseases)) {
    diseases = rawDiseases.map((d: any) => mapDisease(d));
  } else if (rawDiseases && typeof rawDiseases === 'object') {
    diseases = [mapDisease(rawDiseases)];
  }

  // Gestion des symptômes IA
  const rawSymptoms = iaData.symptomes_detectes;
  let symptomsList: Symptom[] = [];
  
  if (Array.isArray(rawSymptoms)) {
     symptomsList = rawSymptoms.map((s: any) => mapSymptom(s));
  } else if (rawSymptoms && typeof rawSymptoms === 'object') {
     symptomsList = [mapSymptom(rawSymptoms)];
  }

  const consultation: Consultation = {
    reason: consultationRaw.motif || "Motif non précisé",
    type: consultationRaw.type || "Non précisé",
    status: consultationRaw.statut || "En cours",
    symptoms: symptomsList,
    notes: (consultationRaw.notes || []).map((n: any) => ({
      contenu: n.contenu || "",
      date: n.dateNote || "",
      type: n.typeNote || "Note"
    })),
    physicalDiagnosis: (data.diagnostic_physique || []).map((p: any) => ({
      result: p.resultat || p.libelle || "",
      date: p.date || data.created_at || ""
    })),
    suspectedDisease: diseases
  };

  // 5. Mapping History
  const history: MedicalHistory = {
    familyHistory: antecedentsRaw.antecedentsFamiliaux 
      ? [antecedentsRaw.antecedentsFamiliaux] 
      : [],
    
    allergies: parseStringToList(antecedentsRaw.allergies).map(name => ({
      name: name,
      manifestation: "",
      trigger: ""
    })),

    chronicDiseases: parseStringToList(antecedentsRaw.maladiesChroniques).map(name => ({
      name: name,
      startDate: "",
      observation: "",
      treatments: antecedentsRaw.traitementsActuels || ""
    })),

    surgeries: parseStringToList(antecedentsRaw.chirurgiesAnterieures).map(name => ({
      name: name,
      date: "",
      treatment: "",
      observation: ""
    })),

    hospitalizations: (antecedentsRaw.hospitalizations || []).map((h: any) => ({
        startDate: h.date || "",
        endDate: "",
        description: h.motif || ""
    }))
  };

  // 6. Mapping Exams & Treatments
  const exams: ExamResult[] = (data.examens || []).map((e: any) => ({
    examName: e.nom || "",
    result: e.resultat || "",
    anatomy: e.zone || "",
    requestDate: e.date || ""
  }));

  const treatments: Treatment[] = (data.traitements || []).map((t: any) => ({
    drugName: t.nom || "",
    quantity: t.quantite || "",
    duration: t.duree || "",
    storage: "",
    instruction: t.posologie || "",
    frequency: ""
  }));

  // 7. Mapping Diagnostic (Nouveau type)
  const diagnostic: Diagnostic = {
    physicalFindings: (data.diagnostic_physique || []).map((d: any) => d.resultat || d.nom || ""),
    exams: (data.examens || []).map((e: any) => e.nom || ""),
    finalTreatments: (data.traitements || []).map((t: any) => t.nom || ""),
    lifeMode: typeof data.mode_de_vie === 'object' ? JSON.stringify(data.mode_de_vie) : (data.mode_de_vie || ""),
    diagnostic_final: data.diagnostic_final || "",
    specialty: data.specialite_confirmee || data.specialite_suggeree || ""
  };

  return {
    id,
    status,
    submissionDate: data.created_at || new Date().toISOString(),
    patient,
    consultation,
    history,
    exams,
    treatments,
    diagnostic
  };
};

// --- Helpers ---

function mapDisease(d: any): Disease {
  return {
    name: d.nom || "",
    observation: d.observation || "",
    dateDebut: d.date_de_debut || "",
    dateFin: d.date_de_fin || "",
    treatments: d.traitements_suivis || ""
  };
}

function mapSymptom(s: any): Symptom {
    return {
      location: s.localisation || "Non spécifiée",
      startDate: s.date_de_debut || new Date().toISOString(),
      frequency: s.frequence || "Non spécifiée",
      duration: s.duree || "",
      intensity: parseInt(s.degre_intensite || "0"),
      triggerActivity: s.activite_declenchante || "Aucune"
    };
}

// Transforme "Pollen, Acariens" en ["Pollen", "Acariens"]
function parseStringToList(str: string | null | undefined): string[] {
    if (!str || str === "Aucune" || str === "Néant") return [];
    return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
}