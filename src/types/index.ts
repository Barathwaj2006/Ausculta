export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: string;
  notes: string;
}

export type AuscultationSiteKey =
  | 'AORTIC'
  | 'PULMONIC'
  | 'TRICUSPID'
  | 'MITRAL'
  | 'LUNG_ANTERIOR_LEFT'
  | 'LUNG_ANTERIOR_RIGHT'
  | 'LUNG_POSTERIOR_LEFT'
  | 'LUNG_POSTERIOR_RIGHT'
  | 'CAROTID_BRUIT';

export interface AuscultationSiteInfo {
  key: AuscultationSiteKey;
  displayName: string;
  category: 'Heart' | 'Lung' | 'Vascular';
  description: string;
}

export const AUSCULTATION_SITES: Record<AuscultationSiteKey, AuscultationSiteInfo> = {
  AORTIC: {
    key: 'AORTIC',
    displayName: 'Aortic Area',
    category: 'Heart',
    description: '2nd intercostal space right sternal border',
  },
  PULMONIC: {
    key: 'PULMONIC',
    displayName: 'Pulmonic Area',
    category: 'Heart',
    description: '2nd intercostal space left sternal border',
  },
  TRICUSPID: {
    key: 'TRICUSPID',
    displayName: 'Tricuspid Area',
    category: 'Heart',
    description: '4th intercostal space left lower sternal border',
  },
  MITRAL: {
    key: 'MITRAL',
    displayName: 'Mitral Apex',
    category: 'Heart',
    description: '5th intercostal space midclavicular line',
  },
  LUNG_ANTERIOR_LEFT: {
    key: 'LUNG_ANTERIOR_LEFT',
    displayName: 'Left Anterior Lung',
    category: 'Lung',
    description: 'Upper left chest field',
  },
  LUNG_ANTERIOR_RIGHT: {
    key: 'LUNG_ANTERIOR_RIGHT',
    displayName: 'Right Anterior Lung',
    category: 'Lung',
    description: 'Upper right chest field',
  },
  LUNG_POSTERIOR_LEFT: {
    key: 'LUNG_POSTERIOR_LEFT',
    displayName: 'Left Posterior Lung',
    category: 'Lung',
    description: 'Lower left back field',
  },
  LUNG_POSTERIOR_RIGHT: {
    key: 'LUNG_POSTERIOR_RIGHT',
    displayName: 'Right Posterior Lung',
    category: 'Lung',
    description: 'Lower right back field',
  },
  CAROTID_BRUIT: {
    key: 'CAROTID_BRUIT',
    displayName: 'Carotid Artery',
    category: 'Vascular',
    description: 'Lateral cervical area for bruit assessment',
  },
};

export type FilterModeKey =
  | 'WIDEBAND'
  | 'RAW'
  | 'HEART_BANDPASS'
  | 'LUNG_BANDPASS'
  | 'ECG_NOTCH';

export interface FilterModeInfo {
  key: FilterModeKey;
  displayName: string;
  lowCutoffHz: number;
  highCutoffHz: number;
  description: string;
}

export const FILTER_MODES: Record<FilterModeKey, FilterModeInfo> = {
  WIDEBAND: {
    key: 'WIDEBAND',
    displayName: 'Wideband Raw',
    lowCutoffHz: 10,
    highCutoffHz: 450,
    description: 'Full acoustic frequency spectrum without digital bandpass',
  },
  RAW: {
    key: 'RAW',
    displayName: 'Wideband Raw',
    lowCutoffHz: 10,
    highCutoffHz: 450,
    description: 'Full acoustic frequency spectrum without digital bandpass',
  },
  HEART_BANDPASS: {
    key: 'HEART_BANDPASS',
    displayName: 'Heart Mode',
    lowCutoffHz: 20,
    highCutoffHz: 200,
    description: 'Isolates cardiac acoustic spectrum (20-200 Hz)',
  },
  LUNG_BANDPASS: {
    key: 'LUNG_BANDPASS',
    displayName: 'Lung Mode',
    lowCutoffHz: 100,
    highCutoffHz: 450,
    description: 'Isolates respiratory acoustic spectrum (100-450 Hz)',
  },
  ECG_NOTCH: {
    key: 'ECG_NOTCH',
    displayName: 'ECG 60Hz Notch',
    lowCutoffHz: 0.5,
    highCutoffHz: 150,
    description: 'Suppresses AC powerline hum from cardiac leads',
  },
};

export type DeviceConnectionState =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'SIMULATING'
  | 'DEVICE_UNAVAILABLE';

export interface DevicePacket {
  wave: number[];
  spo2: number;
  bpm: number;
  finger: boolean;
  active: boolean;
  timestampMs: number;
}

export interface SignalMetrics {
  rmsAmplitude: number;
  peakToPeakAmplitude: number;
  zeroCrossingRate: number;
  meanDcOffset: number;
  signalQualityScore: number;
  waveformStability: 'STABLE_SIGNAL' | 'UNSTABLE_SIGNAL' | 'INSUFFICIENT_DATA';
  isUsableSignal: boolean;
  spo2: number;
  spo2Status: string;
  bpm: number;
  bpmStatus: string;
  populationScope: string;

  // Real-time telemetry extras
  currentBpm: number;
  fingerDetected: boolean;
  sensorActive: boolean;
  isRecording: boolean;
  rmsEnergy: number;
  murmurProbability: number;
  wheezeProbability: number;
  crackleProbability: number;
  signalQualityPercentage: number;
}

export interface AiAnalysisResult {
  summaryTitle: string;
  summaryDetails: string;
  primaryDiagnosis?: string;
  confidencePercentage?: number;
  spo2Interpretation: string;
  pulseInterpretation: string;
  acousticSignalQualityText: string;
  recommendedUserActions: string[];
}

export interface Session {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientSex: string;
  examinationType: string;
  site: AuscultationSiteKey;
  siteName: string;
  filterMode: FilterModeKey;
  startTimestampMs: number;
  endTimestampMs: number;
  durationSeconds: number;
  appSessionId: string;
  appVersion: string;
  deviceStatus: string;
  deviceIdentifier: string;
  spo2: number;
  spo2Status: string;
  bpm: number;
  bpmStatus: string;
  signalQualityScore: number;
  waveformStability: string;
  isUsableSignal: boolean;
  sampleCount: number;
  waveDataCsv: string;
  audioBlobUrl?: string;
  audioData?: number[];
  aiSummary: string;
  aiAnalysisResult?: AiAnalysisResult;
  reportPath?: string;
}

export interface Esp32Config {
  ssid: string;
  host: string;
  port: number;
  endpoint: string;
  pollIntervalMs: number;
}

export type ActiveScreen =
  | 'dashboard'
  | 'live_auscultation'
  | 'session_detail'
  | 'history'
  | 'patients'
  | 'settings';
