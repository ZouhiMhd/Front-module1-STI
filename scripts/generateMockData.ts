import fs from 'fs';
import path from 'path';
import { ClinicalCase, PatientInfo, VitalParameters, Consultation, MedicalHistory, ExamResult, Treatment } from '../app/utils/types/clinicalCase';
import { KNOWLEDGE_BASE, SpecialtyKey } from '../lib/classification/knowledgeBase';

const OUTPUT_PATH = path.join(process.cwd(), 'public', 'data.json');

// --- Helper Functions ---
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (startYear: number, endYear: number) => {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 0, 1);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
};

// --- Generators ---
const generateVitals = (): VitalParameters => ({
    temperature: Number((36.5 + Math.random()).toFixed(1)),
    pulse: getRandomInt(60, 100),
    weight: getRandomInt(50, 100),
    height: getRandomInt(150, 190),
    bloodPressure: `${getRandomInt(110, 140)}/${getRandomInt(70, 90)}`,
    heartRate: getRandomInt(60, 100)
});

const generatePatient = (isChild: boolean): PatientInfo => {
    const currentYear = new Date().getFullYear();
    const birthYear = isChild ? currentYear - getRandomInt(1, 14) : currentYear - getRandomInt(20, 80);

    return {
        id: `PAT-${getRandomInt(10000, 99999)}`,
        birthDate: randomDate(birthYear, birthYear + 1),
        civilStatus: isChild ? "Célibataire" : getRandomItem(["Marié", "Célibataire", "Divorcé", "Veuf"]),
        job: isChild ? "Écolier" : getRandomItem(["Enseignant", "Ingénieur", "Ouvrier", "Retraité", "Sans emploi", "Commerçant"]),
        bloodGroup: getRandomItem(["A+", "A-", "B+", "B-", "O+", "O-", "AB+"]),
        gender: getRandomItem(["M", "F"]),
        vitals: generateVitals()
    };
};

// Générateur principal d'un cas basé sur une spécialité cible
const generateCaseForSpecialty = (index: number, specialty: SpecialtyKey): ClinicalCase => {
    // Si généraliste, on pioche un peu partout ou on utilise une base générique
    const kb = specialty === 'general_medicine'
        ? KNOWLEDGE_BASE['cardiology'] // Fallback pour structure, mais on mixera
        : KNOWLEDGE_BASE[specialty as keyof typeof KNOWLEDGE_BASE];

    const isGeneral = specialty === 'general_medicine';
    const isChild = specialty === 'pediatrics';

    const disease = isGeneral ? "Grippe saisonnière" : getRandomItem(kb.diseases);
    const symptomMain = isGeneral ? "Fatigue générale" : getRandomItem(kb.symptoms);
    const treatmentMain = isGeneral ? "Paracétamol" : getRandomItem(kb.treatments);
    const examMain = isGeneral ? "Prise de sang" : getRandomItem(kb.exams);

    const consultation: Consultation = {
        reason: `Patient se plaint de ${symptomMain}`,
        symptoms: [
            {
                location: isGeneral ? "Corps entier" : "Zone spécifique",
                startDate: randomDate(2023, 2024),
                frequency: getRandomItem(["Constante", "Intermittente", "Progressive"]),
                duration: `${getRandomInt(1, 10)} jours`,
                intensity: getRandomInt(3, 9),
                triggerActivity: "Aucune"
            }
        ],
        physicalDiagnosis: [
            {
                name: "Examen clinique",
                result: `Signes évocateurs de ${disease}`,
                observation: "État général conservé"
            }
        ]
    };

    const history: MedicalHistory = {
        familyHistory: Math.random() > 0.5 ? ["Père: Hypertension"] : [],
        allergies: Math.random() > 0.8 ? [{ name: "Pénicilline", manifestation: "Urticaire", trigger: "Prise médicament" }] : [],
        chronicDiseases: Math.random() > 0.7 ? [
            {
                name: disease,
                startDate: "2020-01-01",
                observation: "Suivi régulier",
                treatments: treatmentMain
            }
        ] : [],
        surgeries: [],
        hospitalizations: []
    };

    const exams: ExamResult[] = [
        {
            examName: examMain,
            result: "Résultats anormaux confirmant le diagnostic",
            anatomy: "Zone concernée",
            requestDate: randomDate(2023, 2024)
        }
    ];

    const treatments: Treatment[] = [
        {
            drugName: treatmentMain,
            quantity: "1 boite",
            duration: "7 jours",
            storage: "Sec",
            instruction: "Prendre pendant les repas",
            frequency: "2 fois par jour"
        }
    ];

    // Note: On ne met PAS detectedSpecialty ici.
    return {
        id: `CAS-2023-${index.toString().padStart(3, '0')}`,
        status: getRandomItem(['PENDING', 'PENDING', 'PENDING', 'VALIDATED']),
        submissionDate: randomDate(2023, 2024),
        patient: generatePatient(isChild),
        consultation,
        history,
        exams,
        treatments
    };
};

const generateAllMockData = () => {
    const cases: ClinicalCase[] = [];
    const specialties: SpecialtyKey[] = ['cardiology', 'dermatology', 'pediatrics', 'neurology', 'orthopedics', 'surgery'];

    let idCounter = 1;

    // 1. Générer 6 cas pour chaque spécialité spécifique (6 * 6 = 36 cas)
    specialties.forEach(spec => {
        for (let i = 0; i < 6; i++) {
            cases.push(generateCaseForSpecialty(idCounter++, spec));
        }
    });

    // 2. Générer 4 cas de médecine générale pour atteindre 40
    for (let i = 0; i < 4; i++) {
        cases.push(generateCaseForSpecialty(idCounter++, 'general_medicine'));
    }

    // Écriture du fichier
    try {
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(cases, null, 2));
        console.log(`✅ Succès : ${cases.length} cas cliniques générés dans ${OUTPUT_PATH}`);
    } catch (error) {
        console.error("❌ Erreur lors de l'écriture du fichier:", error);
    }
};

// Exécution
generateAllMockData();
