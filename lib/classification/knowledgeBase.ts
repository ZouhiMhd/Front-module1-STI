export type SpecialtyKey =
  | 'cardiology'
  | 'dermatology'
  | 'pediatrics'
  | 'neurology'
  | 'orthopedics'
  | 'surgery'
  | 'general_medicine';

interface SpecialtyKeywords {
  diseases: string[];
  symptoms: string[];
  exams: string[];
  treatments: string[];
}

export const KNOWLEDGE_BASE: Record<Exclude<SpecialtyKey, 'general_medicine'>, SpecialtyKeywords> = {
  cardiology: {
    diseases: [
      "infarctus", "myocarde", "hypertension", "hta", "insuffisance cardiaque", "arythmie",
      "fibrillation auriculaire", "péricardite", "endocardite", "valvulopathie", "angor", "sténose aortique",
      "athérosclérose", "cardiomyopathie", "thrombose veineuse", "embolie pulmonaire", "syndrome coronarien", "flutter"
    ],
    symptoms: [
      "douleur thoracique", "palpitations", "essoufflement", "dyspnée", "oedème membres inférieurs",
      "syncope", "tachycardie", "bradycardie", "oppression", "douleur bras gauche", "mâchoire serrée",
      "souffle au coeur", "claquement", "cyanose", "turgescence jugulaire"
    ],
    exams: [
      "ecg", "électrocardiogramme", "échocardiographie", "holter", "troponine", "doppler",
      "coronarographie", "scintigraphie myocardique", "test d'effort", "bnp"
    ],
    treatments: [
      "bêta-bloquant", "diurétique", "iec", "aspirine", "statine", "anticoagulant", "kardégic",
      "digoxine", "amiodarone", "furosémide", "ramipril", "bisoprolol", "clopidogrel"
    ]
  },
  dermatology: {
    diseases: [
      "eczéma", "psoriasis", "acné", "mélanome", "carcinome", "urticaire", "herpès", "rosacée",
      "zona", "mycose", "verrue", "kyste sébacé", "vitiligo", "dermatite atopique", "gale", "impétigo",
      "pemphigus", "lichen plan", "alopécie"
    ],
    symptoms: [
      "prurit", "démangeaisons", "éruption cutanée", "rougeur", "bouton", "lésion", "croute",
      "squame", "tache", "grain de beauté", "plaie", "ulcère", "sécheresse", "purpura", "bulles", "vésicules"
    ],
    exams: [
      "biopsie cutanée", "dermatoscopie", "lampe de wood", "prélèvement mycologique", "test allergologique"
    ],
    treatments: [
      "crème", "pommade", "corticoïde", "dermocorticoïde", "antifongique", "cryothérapie",
      "antibiotique local", "rétinoïde", "émollient", "diprosone", "locoid"
    ]
  },
  neurology: {
    diseases: [
      "migraine", "épilepsie", "alzheimer", "parkinson", "sclérose en plaques", "avc", "ischémique", "hémorragique",
      "méningite", "sciatique", "syndrome du canal carpien", "neuropathie", "tremblements essentiels", "sla"
    ],
    symptoms: [
      "céphalée", "mal de tête", "vertige", "convulsion", "paralysie", "hémiplégie", "paresthésie",
      "fourmillement", "perte de connaissance", "trouble de la mémoire", "trouble de la parole", "aphasie",
      "trouble de la marche", "diplopie", "perte d'équilibre"
    ],
    exams: [
      "irm cérébrale", "scanner cérébral", "eeg", "électroencéphalogramme", "ponction lombaire",
      "emg", "électromyogramme", "doppler tsa"
    ],
    treatments: [
      "antiépileptique", "antalgique", "triptan", "levodopa", "thrombolyse", "antidépresseur",
      "lamotrigine", "valproate", "gabapentine"
    ]
  },
  orthopedics: {
    diseases: [
      "fracture", "entorse", "luxation", "arthrose", "arthrite", "tendinite", "scoliose", "cyphose",
      "hernie discale", "lumbago", "rupture ligament croisé", "ostéoporose", "canal carpien", "ménisque"
    ],
    symptoms: [
      "douleur articulaire", "blocage", "raideur", "gonflement", "craquement", "boiterie",
      "déformation", "impuissance fonctionnelle", "mal de dos", "lombalgie", "cervicalgie", "hématome"
    ],
    exams: [
      "radiographie", "radio", "scanner osseux", "irm ostéo-articulaire", "arthroscopie", "ostéodensitométrie"
    ],
    treatments: [
      "attelle", "plâtre", "prothèse", "rééducation", "kinésithérapie", "infiltration",
      "anti-inflammatoire", "nsaid", "ibuprofène", "arthrodèse", "ostéosynthèse"
    ]
  },
  pediatrics: {
    diseases: [
      "varicelle", "rougeole", "oreillons", "rubéole", "bronchiolite", "otite moyenne", "rhinopharyngite",
      "gastro-entérite", "colique", "érythème fessier", "coqueluche", "scarlatine", "asthme du nourrisson"
    ],
    symptoms: [
      "fièvre", "pleurs incessants", "vomissement", "diarrhée", "toux", "nez qui coule", "éruption",
      "retard de croissance", "douleur oreille", "refus de tétée", "convulsion fébrile"
    ],
    exams: [
      "carnet de santé", "vaccination", "mesure taille", "courbe de poids", "test audiatif", "périmètre crânien"
    ],
    treatments: [
      "doliprane sirop", "mouche-bébé", "sérum physiologique", "vaccin", "antibiotique sirop",
      "orelox", "amoxicilline", "soluté de réhydratation"
    ]
  },
  surgery: {
    diseases: [
      "appendicite", "cholécystite", "hernie inguinale", "occlusion intestinale", "péritonite",
      "traumatisme", "plaie profonde", "abcès", "tumeur", "polype", "kyste pilonidal", "hémorroïdes"
    ],
    symptoms: [
      "douleur abdominale aiguë", "masse palpable", "saignement", "hémorragie", "choc",
      "vomissement fécaloïde", "défense abdominale", "contracture", "arrêt des matières"
    ],
    exams: [
      "scanner abdominal", "échographie", "bilan pré-opératoire", "groupage sanguin", "tpm", "tca"
    ],
    treatments: [
      "chirurgie", "opération", "suture", "drainage", "exérèse", "laparotomie", "coelioscopie",
      "appendicectomie", "cholécystectomie", "bloc opératoire"
    ]
  }
};
