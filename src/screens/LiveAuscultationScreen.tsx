import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Activity,
  Headphones,
  VolumeX,
  Volume2,
  Square,
  Sparkles,
  Sliders,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import {
  AuscultationSiteKey,
  AUSCULTATION_SITES,
  DeviceConnectionState,
  FILTER_MODES,
  FilterModeKey,
  Patient,
  Session,
  SignalMetrics,
} from '../types';
import { WaveformView } from '../components/WaveformView';
import { SpectrumView } from '../components/SpectrumView';
import { DeviceStatusCard } from '../components/DeviceStatusCard';
import { PoorSignalStateView } from '../components/StateViews';
import { audioSynthesizer } from '../audio/AudioSynthesizer';
import { WavEncoder } from '../audio/WavEncoder';
import { StorageService } from '../services/StorageService';
import { geminiAiService } from '../ai/GeminiAiService';

interface LiveAuscultationScreenProps {
  connectionState: DeviceConnectionState;
  signalMetrics: SignalMetrics;
  liveWaveform: number[];
  liveSpectrum: number[];
  patients: Patient[];
  onConnectClick: () => void;
  onToggleSimulator: () => void;
  onSessionCreated: (session: Session) => void;
}

export const LiveAuscultationScreen: React.FC<LiveAuscultationScreenProps> = ({
  connectionState,
  signalMetrics,
  liveWaveform,
  liveSpectrum,
  patients,
  onConnectClick,
  onToggleSimulator,
  onSessionCreated,
}) => {
  const [selectedSite, setSelectedSite] = useState<AuscultationSiteKey>('MITRAL');
  const [selectedFilter, setSelectedFilter] = useState<FilterModeKey>('WIDEBAND');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('user-self');

  // Audio Monitoring
  const [isLiveListening, setIsLiveListening] = useState<boolean>(false);

  // Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isProcessingSave, setIsProcessingSave] = useState<boolean>(false);

  const wavEncoderRef = useRef<WavEncoder>(new WavEncoder(4000));
  const recordTimerRef = useRef<any>(null);
  const recordingStartTimeRef = useRef<number>(0);

  // Update audio synth telemetry
  useEffect(() => {
    const isLung =
      selectedFilter === 'LUNG_BANDPASS' ||
      selectedSite.startsWith('LUNG');
    audioSynthesizer.updateTelemetry(signalMetrics.currentBpm || 72, isLung);
  }, [signalMetrics.currentBpm, selectedFilter, selectedSite]);

  const toggleLiveAudio = () => {
    if (isLiveListening) {
      audioSynthesizer.stopLiveMonitoring();
      setIsLiveListening(false);
    } else {
      const isLung =
        selectedFilter === 'LUNG_BANDPASS' ||
        selectedSite.startsWith('LUNG');
      audioSynthesizer.startLiveMonitoring(signalMetrics.currentBpm || 72, isLung);
      setIsLiveListening(true);
    }
  };

  // Collect samples during recording
  useEffect(() => {
    if (isRecording && liveWaveform.length > 0) {
      wavEncoderRef.current.appendSamples(liveWaveform);
    }
  }, [isRecording, liveWaveform]);

  // Handle Recording Toggle
  const handleToggleRecording = async () => {
    if (isRecording) {
      // STOP RECORDING & SAVE
      setIsRecording(false);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      setIsProcessingSave(true);

      const endTime = Date.now();
      const duration = Math.max(1, Math.round((endTime - recordingStartTimeRef.current) / 1000));
      const patient = patients.find((p) => p.id === selectedPatientId) || patients[0];

      // Generate Audio Blob
      const audioBlob = wavEncoderRef.current.encodeToBlob();
      const audioBlobUrl = URL.createObjectURL(audioBlob);

      const siteInfo = AUSCULTATION_SITES[selectedSite];

      const newSession: Session = {
        id: `sess-${Date.now()}`,
        patientId: patient.id,
        patientName: patient.name,
        patientAge: patient.age,
        patientSex: patient.sex,
        examinationType: `${siteInfo.category} Acoustic Examination`,
        site: selectedSite,
        siteName: siteInfo.displayName,
        filterMode: selectedFilter,
        startTimestampMs: recordingStartTimeRef.current,
        endTimestampMs: endTime,
        durationSeconds: duration,
        appSessionId: `SESSION-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        appVersion: '1.0.0',
        deviceStatus:
          connectionState === 'SIMULATING'
            ? 'Simulator Mode'
            : connectionState === 'CONNECTED'
            ? 'Wi-Fi SoftAP'
            : 'Unspecified',
        deviceIdentifier: 'Ausculta-ESP32 (192.168.4.1)',
        spo2: signalMetrics.spo2 || 98,
        spo2Status: signalMetrics.spo2Status || 'Within Normal Range',
        bpm: signalMetrics.currentBpm || 72,
        bpmStatus: signalMetrics.bpmStatus || 'Within Resting Range',
        signalQualityScore: signalMetrics.signalQualityScore || 90,
        waveformStability: signalMetrics.waveformStability || 'Stable Waveform',
        isUsableSignal: true,
        sampleCount: wavEncoderRef.current.getSamples().length || 200,
        waveDataCsv: '',
        audioBlobUrl,
        aiSummary: 'Processing physiological insights...',
      };

      // Run AI evaluation
      try {
        const aiResult = await geminiAiService.analyzeSession(newSession);
        newSession.aiAnalysisResult = aiResult;
        newSession.aiSummary = aiResult.primaryDiagnosis || aiResult.summaryDetails;
      } catch (err) {
        console.warn('AI analysis error on save:', err);
      }

      // Persist to storage
      StorageService.addSession(newSession);
      setIsProcessingSave(false);
      onSessionCreated(newSession);
    } else {
      // START RECORDING
      wavEncoderRef.current.clear();
      recordingStartTimeRef.current = Date.now();
      setRecordingSeconds(0);
      setIsRecording(true);

      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
      audioSynthesizer.stopLiveMonitoring();
    };
  }, []);

  const siteInfo = AUSCULTATION_SITES[selectedSite];
  const filterInfo = FILTER_MODES[selectedFilter];

  return (
    <div className="space-y-6">
      {/* Hardware Connection Card */}
      <DeviceStatusCard
        connectionState={connectionState}
        isFingerContact={signalMetrics.fingerDetected}
        onConnectClick={onConnectClick}
        onToggleSimulator={onToggleSimulator}
      />

      {!signalMetrics.fingerDetected && connectionState !== 'DISCONNECTED' && (
        <PoorSignalStateView />
      )}

      {/* Main Studio Oscilloscope + Visualizer Container */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-5 shadow-xl">
        {/* Oscilloscope Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#334155]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22D3EE] animate-pulse" />
              <h2 className="text-base font-bold text-[#F8FAFC]">
                Acoustic Waveform Oscilloscope
              </h2>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#0F172A] border border-[#334155] text-[#22D3EE] font-mono">
              {filterInfo.displayName} ({filterInfo.lowCutoffHz}-{filterInfo.highCutoffHz} Hz)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Audio Stethoscope Listening */}
            <button
              id="btn-toggle-live-audio"
              onClick={toggleLiveAudio}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                isLiveListening
                  ? 'bg-[#06B6D4] border-[#22D3EE] text-[#0B0F17] shadow'
                  : 'bg-[#0F172A] border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              {isLiveListening ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                  <span>Stethoscope Audio: ON</span>
                </>
              ) : (
                <>
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Live Stethoscope Audio</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Oscilloscope Canvas */}
        <WaveformView waveform={liveWaveform} height={200} className="mb-4" />

        {/* 16-Band Spectral Decomposition */}
        <div className="mt-4 pt-4 border-t border-[#334155]/60">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-2 font-mono">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#22D3EE]" />
              16-Band Real-Time FFT Spectral Decomposition
            </span>
            <span>20 Hz — 450 Hz</span>
          </div>
          <SpectrumView spectrum={liveSpectrum} height={90} />
        </div>

        {/* Vitals Telemetry Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="bg-[#0F172A] border border-[#334155]/60 rounded-xl p-3">
            <div className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider">
              Heart Rate
            </div>
            <div className="text-2xl font-extrabold text-[#F8FAFC] mt-1 flex items-baseline gap-1">
              <span>{signalMetrics.currentBpm > 0 ? signalMetrics.currentBpm : '--'}</span>
              <span className="text-xs font-normal text-[#94A3B8]">BPM</span>
            </div>
            <div className="text-[10px] text-[#10B981] truncate mt-0.5">
              {signalMetrics.bpmStatus}
            </div>
          </div>

          <div className="bg-[#0F172A] border border-[#334155]/60 rounded-xl p-3">
            <div className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider">
              SpO2 Level
            </div>
            <div className="text-2xl font-extrabold text-[#F8FAFC] mt-1 flex items-baseline gap-1">
              <span>{signalMetrics.spo2 > 0 ? signalMetrics.spo2 : '--'}</span>
              <span className="text-xs font-normal text-[#94A3B8]">%</span>
            </div>
            <div className="text-[10px] text-[#10B981] truncate mt-0.5">
              {signalMetrics.spo2Status}
            </div>
          </div>

          <div className="bg-[#0F172A] border border-[#334155]/60 rounded-xl p-3">
            <div className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider">
              Signal Quality
            </div>
            <div className="text-2xl font-extrabold text-[#F8FAFC] mt-1">
              {signalMetrics.signalQualityScore > 0 ? `${signalMetrics.signalQualityScore}%` : '--'}
            </div>
            <div className="text-[10px] text-[#22D3EE] truncate mt-0.5">
              {signalMetrics.waveformStability}
            </div>
          </div>

          <div className="bg-[#0F172A] border border-[#334155]/60 rounded-xl p-3">
            <div className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider">
              Sensor Contact
            </div>
            <div
              className={`text-sm font-bold mt-2.5 flex items-center gap-1.5 ${
                signalMetrics.fingerDetected ? 'text-[#10B981]' : 'text-[#EF4444]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  signalMetrics.fingerDetected ? 'bg-[#10B981]' : 'bg-[#EF4444]'
                }`}
              />
              {signalMetrics.fingerDetected ? 'Firm Contact' : 'Loss of Contact'}
            </div>
          </div>
        </div>
      </div>

      {/* Recording Control & Configuration Bar */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-5 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          {/* Patient Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Subject Profile
            </label>
            <select
              id="select-patient"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#22D3EE] cursor-pointer"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.age}y, {p.sex})
                </option>
              ))}
            </select>
          </div>

          {/* Filter Mode Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#22D3EE]" /> DSP Filter Band
            </label>
            <select
              id="select-filter-mode"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as FilterModeKey)}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#22D3EE] cursor-pointer"
            >
              {Object.values(FILTER_MODES).map((f) => (
                <option key={f.key} value={f.key}>
                  {f.displayName} ({f.lowCutoffHz}-{f.highCutoffHz} Hz)
                </option>
              ))}
            </select>
          </div>

          {/* Auscultation Site Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-[#F43F5E]" /> Anatomical Site
            </label>
            <select
              id="select-auscultation-site"
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value as AuscultationSiteKey)}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#22D3EE] cursor-pointer"
            >
              {Object.values(AUSCULTATION_SITES).map((s) => (
                <option key={s.key} value={s.key}>
                  {s.displayName} ({s.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Recording Action Button & Timer */}
        <div className="mt-6 pt-5 border-t border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-4 h-4 rounded-full ${
                isRecording ? 'bg-[#EF4444] animate-ping' : 'bg-[#334155]'
              }`}
            />
            <div>
              <div className="text-xs font-bold text-[#F8FAFC]">
                {isRecording ? 'RECORDING SESSION IN PROGRESS' : 'READY TO RECORD'}
              </div>
              <div className="text-xs text-[#94A3B8] font-mono mt-0.5">
                Duration: {String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:
                {String(recordingSeconds % 60).padStart(2, '0')} (Target: 10s - 30s)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              id="btn-toggle-recording"
              disabled={isProcessingSave}
              onClick={handleToggleRecording}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-sm transition flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer ${
                isRecording
                  ? 'bg-[#EF4444] hover:bg-[#F87171] text-[#FFFFFF]'
                  : 'bg-[#06B6D4] hover:bg-[#22D3EE] text-[#0B0F17]'
              }`}
            >
              {isProcessingSave ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  Generating AI Report...
                </>
              ) : isRecording ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  Stop & Generate Report
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  Start Recording Session
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
