export type VitalParameters = {
  temperature: number;
  pulse: number;
  weight: number;
  height: number;
  bloodPressure: string;
  heartRate: number;
};

export type PatientInfo = {
  id: string;
  yearRange: string; 
  civilStatus: string;
  job: string;
  bloodGroup: string;
  gender: 'M' | 'F';
  lastMenstrualPeriod?: string;
  vitals: VitalParameters;
  condition : string;
  medicalService: string;
};

export type Symptom = {
  location: string;
  startDate: string;
  frequency: string;
  duration: string;
  intensity: number; // 1-10
  triggerActivity: string;
};

export type Consultation = {
  reason: string;
  symptoms: Symptom[];
  type: string;
  notes: Note[]; 
  physicalDiagnosis: Array<{
    result: string;
    date: string;
  }>;
  status: string;
  suspectedDisease : Disease[];
};

export type Disease={
  name: string;
  observation: string;
  dateDebut:string;
  dateFin:string;
  treatments:string;
};

export type Note={
  contenu:string;
  date:string;
  type:string;
}

export type MedicalHistory = {
  familyHistory: string[];
  allergies: Array<{
    name: string;
    manifestation: string;
    trigger: string;
  }>;
  chronicDiseases: Array<{
    name: string;
    startDate: string;
    endDate?: string;
    observation: string;
    treatments: string;
  }>;
  surgeries: Array<{
    name: string;
    date: string;
    treatment: string;
    observation: string;
  }>;
  hospitalizations: Array<{
    startDate: string;
    endDate: string;
    description: string;
  }>;
};

export type ExamResult = {
  examName: string;
  result: string;
  anatomy: string;
  requestDate: string;
};

export type Treatment = {
  drugName: string;
  quantity: string;
  duration: string;
  storage: string;
  instruction: string;
  frequency: string;
};

export type Diagnostic = {
  physicalFindings : string[];
  exams : string[];
  finalTreatments : string[];
  lifeMode : string;
  diagnostic_final : string;
  specialty : string;
}

export type ClinicalCase = {
  id: string;
  submissionDate: string;
  patient: PatientInfo;
  consultation: Consultation;
  history: MedicalHistory;
  exams: ExamResult[];
  diagnostic: Diagnostic;
  treatments: Treatment[];
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
  rejectionReason?: string;
};
