import { Patient, Session } from '../types';

const PATIENTS_KEY = 'ausculta_patients_v1';
const SESSIONS_KEY = 'ausculta_sessions_v1';

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'user-self',
    name: 'My Profile',
    age: 30,
    sex: 'Male',
    notes: 'Personal Baseline Records',
  },
  {
    id: 'PAT-8291',
    name: 'Eleanor Vance',
    age: 54,
    sex: 'Female',
    notes: 'Routine cardiovascular and respiratory follow-up check.',
  },
  {
    id: 'PAT-4402',
    name: 'Marcus Chen',
    age: 28,
    sex: 'Male',
    notes: 'Post-exercise acoustic recovery monitoring.',
  },
];

const INITIAL_SESSIONS: Session[] = [
  {
    id: 'id-demo-1',
    patientId: 'user-self',
    patientName: 'My Profile',
    patientAge: 30,
    patientSex: 'Male',
    examinationType: 'Baseline Respiratory Check',
    site: 'LUNG_ANTERIOR_LEFT',
    siteName: 'Left Anterior Lung',
    filterMode: 'WIDEBAND',
    startTimestampMs: Date.now() - 86400000,
    endTimestampMs: Date.now() - 86370000,
    durationSeconds: 30,
    appSessionId: 'SESSION-BASELINE-01',
    appVersion: '1.0.0',
    deviceStatus: 'Connected (Wi-Fi AP)',
    deviceIdentifier: 'ESP32-SoftAP (192.168.4.1)',
    spo2: 98,
    spo2Status: 'Within Reference Range (95-100%)',
    bpm: 72,
    bpmStatus: 'Within Reference Range (60-100 BPM)',
    signalQualityScore: 95,
    waveformStability: 'Stable Waveform',
    isUsableSignal: true,
    sampleCount: 200,
    waveDataCsv: '',
    aiSummary: 'Waveform and physiological metrics evaluated deterministically within expected reference range.',
    aiAnalysisResult: {
      summaryTitle: 'AI-Assisted Session Summary',
      primaryDiagnosis: 'Clear vesicular breath sounds without audible adventitious noise.',
      summaryDetails: 'Vesicular acoustic profile across anterior chest. SpO2 (98%) and resting heart rate (72 BPM) demonstrate optimal baseline stability.',
      confidencePercentage: 96,
      spo2Interpretation: 'SpO2 is 98%, WITHIN_RANGE (95-100% Adult Reference Range).',
      pulseInterpretation: 'Pulse rate is 72 BPM, WITHIN_RANGE (60-100 BPM Adult Normal Resting).',
      acousticSignalQualityText: 'Acoustic waveform quality score is 95% with Stable Waveform status.',
      recommendedUserActions: [
        'Target Audience Scope: Adult Population (Age 18+) Reference Ranges',
        'Keep local session record for personal baseline self-monitoring',
        'Repeat measurement while resting if values change',
        'INSTRUCTIONAL DISCLAIMER: Ausculta is an AI-assisted consumer health self-monitoring tool and does NOT provide clinical diagnosis.',
      ],
    },
  },
  {
    id: 'id-demo-2',
    patientId: 'user-self',
    patientName: 'My Profile',
    patientAge: 30,
    patientSex: 'Male',
    examinationType: 'Cardiac Acoustic Examination',
    site: 'MITRAL',
    siteName: 'Mitral Apex',
    filterMode: 'HEART_BANDPASS',
    startTimestampMs: Date.now() - 43200000,
    endTimestampMs: Date.now() - 43180000,
    durationSeconds: 20,
    appSessionId: 'SESSION-MITRAL-02',
    appVersion: '1.0.0',
    deviceStatus: 'Connected (Wi-Fi AP)',
    deviceIdentifier: 'ESP32-SoftAP (192.168.4.1)',
    spo2: 99,
    spo2Status: 'Within Reference Range (95-100%)',
    bpm: 76,
    bpmStatus: 'Within Reference Range (60-100 BPM)',
    signalQualityScore: 92,
    waveformStability: 'Stable Waveform',
    isUsableSignal: true,
    sampleCount: 200,
    waveDataCsv: '',
    aiSummary: 'Clear S1 and S2 physiological heart sounds with regular rhythm.',
    aiAnalysisResult: {
      summaryTitle: 'AI-Assisted Session Summary',
      primaryDiagnosis: 'Regular rhythm with distinct S1/S2 acoustic transients.',
      summaryDetails: 'Mitral apex acoustic capture with 20-200 Hz bandpass isolation. Signal shows strong fundamental peaks and stable pulse rate of 76 BPM.',
      confidencePercentage: 94,
      spo2Interpretation: 'SpO2 is 99%, WITHIN_RANGE (95-100% Adult Reference Range).',
      pulseInterpretation: 'Pulse rate is 76 BPM, WITHIN_RANGE (60-100 BPM Adult Normal Resting).',
      acousticSignalQualityText: 'Acoustic waveform quality score is 92% with Stable Waveform status.',
      recommendedUserActions: [
        'Maintain current healthy resting routine',
        'Record periodic checks to build personal acoustic baseline',
        'INSTRUCTIONAL DISCLAIMER: Ausculta is an AI-assisted consumer health self-monitoring tool and does NOT provide clinical diagnosis.',
      ],
    },
  },
];

export const StorageService = {
  getPatients(): Patient[] {
    const raw = localStorage.getItem(PATIENTS_KEY);
    if (!raw) {
      this.savePatients(INITIAL_PATIENTS);
      return INITIAL_PATIENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PATIENTS;
    }
  },

  savePatients(patients: Patient[]): void {
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
  },

  addPatient(patient: Patient): Patient {
    const patients = this.getPatients();
    const existingIndex = patients.findIndex((p) => p.id === patient.id);
    if (existingIndex >= 0) {
      patients[existingIndex] = patient;
    } else {
      patients.push(patient);
    }
    this.savePatients(patients);
    return patient;
  },

  getSessions(): Session[] {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) {
      this.saveSessions(INITIAL_SESSIONS);
      return INITIAL_SESSIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SESSIONS;
    }
  },

  saveSessions(sessions: Session[]): void {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  },

  getSessionById(id: string): Session | undefined {
    const sessions = this.getSessions();
    return sessions.find((s) => s.id === id);
  },

  addSession(session: Session): Session {
    const sessions = this.getSessions();
    const existingIndex = sessions.findIndex((s) => s.id === session.id);
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session);
    }
    this.saveSessions(sessions);
    return session;
  },

  updateSession(session: Session): void {
    const sessions = this.getSessions();
    const index = sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
      this.saveSessions(sessions);
    }
  },

  deleteSession(id: string): void {
    const sessions = this.getSessions().filter((s) => s.id !== id);
    this.saveSessions(sessions);
  },
};
