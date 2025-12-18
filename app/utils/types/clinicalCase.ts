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
  birthDate: string; // ISO Date "YYYY-MM-DD"
  civilStatus: string;
  job: string;
  bloodGroup: string;
  gender: 'M' | 'F';
  lastMenstrualPeriod?: string;
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

export type Consultation = {
  reason: string;
  symptoms: Symptom[];
  physicalDiagnosis: Array<{
    name: string;
    result: string;
    observation: string;
  }>;
};

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

export type ClinicalCase = {
  id: string;
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
  rejectionReason?: string;
  submissionDate: string;
  patient: PatientInfo;
  consultation: Consultation;
  history: MedicalHistory;
  exams: ExamResult[];
  treatments: Treatment[];
};
