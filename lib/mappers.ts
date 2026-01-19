// lib/mappers.ts
import { 
  ClinicalCase, 
  PatientInfo, 
  Consultation, 
  MedicalHistory, 
  ExamResult, 
  Treatment, 
  Diagnostic,
  Disease,
  Symptom
} from "@/app/utils/types/clinicalCase";

export const mapBackendCaseToFrontend = (data: any): ClinicalCase => {
  if (!data) throw new Error("Données invalides reçues du backend");

  // 1. ID & Statut
  const id = data.patient_uuid || data.uuid || String(data.id);
  
  let status: 'PENDING' | 'VALIDATED' | 'DELETED' = 'PENDING';
  if (data.is_validated) {
    status = 'VALIDATED';
  } else if (data.status === 'REJECTED' || data.status === 'DELETED') { 
    status = 'DELETED';
  } else if (data.status === 'VALIDATED') {
    status = 'VALIDATED';
  }

  // --- EXTRACTION DES DONNÉES ---
  const patientRaw = data.patient_info_raw || {};
  const vitalsRaw = (patientRaw.parametresVitaux && patientRaw.parametresVitaux.length > 0) 
    ? patientRaw.parametresVitaux[0] 
    : {};
  
  const consultationRaw = (data.motif_consultation && data.motif_consultation.length > 0) 
    ? data.motif_consultation[0] 
    : {};
  const iaData = consultationRaw.enrichissement_ia || {};
  const antecedentsRaw = data.antecedents || {};

  // 2. Mapping Patient
  const patient: PatientInfo = {
    id: id,
    yearRange: data.age_tranche || "Inconnu",
    civilStatus: patientRaw.etatCivil || "Non précisé",
    job: patientRaw.metier || "Non précisé",
    bloodGroup: "Inconnu", 
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

  // 3. Mapping Consultation & IA (NOUVELLE STRUCTURE)
  let symptomsList: Symptom[] = [];
  const rawSymptomsIA = iaData.symptomes_detectes;

  if (Array.isArray(rawSymptomsIA)) {
    // Cas nouveau : Tableau d'objets [{ nomDuSymptome: "..." }]
    symptomsList = rawSymptomsIA.map((s: any) => ({
      location: s.nomDuSymptome || s.localisation || "Non spécifiée",
      startDate: s.date_de_debut || new Date().toISOString(),
      frequency: s.frequence || "N/A",
      duration: s.duree || "N/A",
      intensity: parseInt(s.degre_intensite || "0"),
      triggerActivity: s.activite_declenchante || "Aucune"
    }));
  } else if (rawSymptomsIA && typeof rawSymptomsIA === 'object') {
    // Cas ancien : Objet unique
    symptomsList.push({
        location: rawSymptomsIA.localisation || "Non spécifiée",
        startDate: rawSymptomsIA.date_de_debut || new Date().toISOString(),
        frequency: rawSymptomsIA.frequence || "N/A",
        duration: rawSymptomsIA.duree || "N/A",
        intensity: parseInt(rawSymptomsIA.degre_intensite || "0"),
        triggerActivity: rawSymptomsIA.activite_declenchante || "Aucune"
    });
  }

  // Maladies suspectées
  let diseases: Disease[] = [];
  const rawDiseases = iaData.maladies_suspectees;
  if (Array.isArray(rawDiseases)) {
    diseases = rawDiseases.map((d: any) => ({
        name: d.nom || "",
        observation: d.observation || "",
        dateDebut: d.date_de_debut || "",
        dateFin: d.date_de_fin || "",
        treatments: d.traitements_suivis || ""
    }));
  } else if (rawDiseases && typeof rawDiseases === 'object') {
    diseases = [{
        name: rawDiseases.nom || "",
        observation: rawDiseases.observation || "",
        dateDebut: rawDiseases.date_de_debut || "",
        dateFin: rawDiseases.date_de_fin || "",
        treatments: rawDiseases.traitements_suivis || ""
    }];
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
    // Correction ici pour éviter l'erreur d'objet React
    physicalDiagnosis: (data.diagnostic_physique || []).map((p: any) => ({
      result: extractResultString(p.resultat) || p.libelle || "",
      date: p.date || data.created_at || ""
    })),
    suspectedDisease: diseases
  };

  // 4. History
  const history: MedicalHistory = {
    familyHistory: antecedentsRaw.antecedentsFamiliaux && antecedentsRaw.antecedentsFamiliaux !== "RAS"
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

  // 5. Examens (CORRECTION CRITIQUE ICI)
  const exams: ExamResult[] = (data.examens || []).map((e: any) => ({
    examName: e.nomExamen || e.nom || "Examen",
    // On utilise la fonction helper pour extraire le texte de l'objet resultat
    result: extractResultString(e.resultat) || "En attente",
    anatomy: e.zone || "",
    requestDate: e.date || ""
  }));

  // 6. Traitements
  const treatments: Treatment[] = (data.traitements || []).map((t: any) => ({
    drugName: t.nom || "",
    quantity: t.quantite || "",
    duration: t.duree || "",
    storage: "",
    instruction: t.posologie || "",
    frequency: ""
  }));

  // 7. Diagnostic
  const diagnostic: Diagnostic = {
    physicalFindings: (data.diagnostic_physique || []).map((d: any) => extractResultString(d.resultat) || d.nom || ""),
    exams: (data.examens || []).map((e: any) => e.nomExamen || e.nom || ""),
    finalTreatments: (data.traitements || []).map((t: any) => t.nom || ""),
    lifeMode: typeof data.mode_de_vie === 'object' ? (data.mode_de_vie.mode || JSON.stringify(data.mode_de_vie)) : (data.mode_de_vie || ""),
    diagnostic_final: data.diagnostic_final || "",
    specialty: data.specialite_confirmee || data.specialite_suggeree || ""
  };

  return {
    id,
    status,
    submissionDate: data.created_at || new Date().toISOString(),
    rejectionReason: data.rejection_reason || null,
    patient,
    consultation,
    history,
    exams,
    treatments,
    diagnostic
  };
};

// --- Helpers ---

// NOUVEAU HELPER : Extrait une chaîne propre depuis un champ qui peut être un objet ou une string
function extractResultString(result: any): string {
    if (!result) return "";
    if (typeof result === 'string') return result;
    if (typeof result === 'object') {
        return result.notesResultat || result.description || JSON.stringify(result);
    }
    return String(result);
}

function parseStringToList(str: string | null | undefined): string[] {
    if (!str || str === "Aucune" || str === "Néant" || str === "None" || str === "RAS" || str === "Aucune connue") return [];
    return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
}