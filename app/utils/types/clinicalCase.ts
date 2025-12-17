// types/clinicalCase.ts

export type VitalParameters = {
  temperature: number;
  pulse: number;
  weight: number;
  height: number;
  bloodPressure: string; // ex: "120/80"
  heartRate: number;
};

export type PatientInfo = {
  id: string;
  birthDate: string; // ISO Date
  civilStatus: string;
  job: string;
  bloodGroup: string;
  gender: 'M' | 'F';
  lastMenstrualPeriod?: string; // DDR
  vitals: VitalParameters;
};

export type Symptom = {
  location: string;
  startDate: string;
  frequency: string;
  duration: string;
  intensity: number; // 1-10
  triggerActivity: string;
};

export type MedicalHistory = {
  familyHistory: string[]; // Descriptions
  allergies: Array<{ name: string; manifestation: string; trigger: string }>;
  chronicDiseases: Array<{ name: string; startDate: string; endDate?: string; observation: string; treatments: string }>;
  surgeries: Array<{ name: string; date: string; treatment: string; observation: string }>;
  hospitalizations: Array<{ startDate: string; endDate: string; description: string }>;
};

export type ExamResult = {
  examName: string;
  result: string;
  anatomy: string;
  requestDate: string;
};

export type Prescription = {
  drugName: string;
  quantity: string;
  duration: string;
  instruction: string;
  frequency: string;
};

export type ClinicalCase = {
  id: string;
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
  rejectionReason?: string; // Si rejeté
  submissionDate: string;
  patient: PatientInfo;
  consultation: {
    reason: string;
    symptoms: Symptom[];
    physicalDiagnosis: { name: string; result: string; observation: string }[];
  };
  history: MedicalHistory;
  exams: ExamResult[];
  treatments: Prescription[];
};