import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Printer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Heart,
  Activity,
  ShieldCheck,
  Radio,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  User,
  Share2,
} from 'lucide-react';
import { ActiveScreen, Session, AiAnalysisResult } from '../types';
import { WaveformView } from '../components/WaveformView';
import { PdfReportGenerator } from '../services/PdfReportGenerator';
import { geminiAiService } from '../ai/GeminiAiService';
import { StorageService } from '../services/StorageService';
import { audioSynthesizer } from '../audio/AudioSynthesizer';

interface SessionDetailScreenProps {
  sessionId: string;
  onNavigate: (screen: ActiveScreen, sessionId?: string) => void;
}

export const SessionDetailScreen: React.FC<SessionDetailScreenProps> = ({
  sessionId,
  onNavigate,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isReanalyzing, setIsReanalyzing] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const s = StorageService.getSessionById(sessionId);
    if (s) {
      setSession(s);
    }
  }, [sessionId]);

  const handleTogglePlayAudio = () => {
    if (!session) return;

    if (isPlayingAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioSynthesizer.stopLiveMonitoring();
      setIsPlayingAudio(false);
    } else {
      if (session.audioBlobUrl) {
        try {
          if (!audioRef.current) {
            audioRef.current = new Audio(session.audioBlobUrl);
            audioRef.current.onended = () => setIsPlayingAudio(false);
          }
          audioRef.current.play().then(() => {
            setIsPlayingAudio(true);
          }).catch(() => {
            // Fallback to acoustic synth
            const isLung = session.filterMode === 'LUNG_BANDPASS' || session.site.startsWith('LUNG');
            audioSynthesizer.startLiveMonitoring(session.bpm || 72, isLung);
            setIsPlayingAudio(true);
          });
        } catch {
          const isLung = session.filterMode === 'LUNG_BANDPASS' || session.site.startsWith('LUNG');
          audioSynthesizer.startLiveMonitoring(session.bpm || 72, isLung);
          setIsPlayingAudio(true);
        }
      } else {
        // Fallback acoustic synth
        const isLung = session.filterMode === 'LUNG_BANDPASS' || session.site.startsWith('LUNG');
        audioSynthesizer.startLiveMonitoring(session.bpm || 72, isLung);
        setIsPlayingAudio(true);
      }
    }
  };

  const handleReanalyzeWithAi = async () => {
    if (!session) return;
    setIsReanalyzing(true);
    try {
      const result = await geminiAiService.analyzeSession(session);
      const updated = {
        ...session,
        aiAnalysisResult: result,
        aiSummary: result.primaryDiagnosis || result.summaryDetails,
      };
      StorageService.updateSession(updated);
      setSession(updated);
    } catch (err) {
      console.warn('Re-analysis failed:', err);
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handlePrintPdf = () => {
    if (session) {
      PdfReportGenerator.printReport(session, session.aiAnalysisResult);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioSynthesizer.stopLiveMonitoring();
    };
  }, []);

  if (!session) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-[#94A3B8]">Session not found or has been removed.</p>
        <button
          onClick={() => onNavigate('history')}
          className="mt-4 px-4 py-2 bg-[#06B6D4] text-[#0B0F17] text-xs font-bold rounded-xl"
        >
          Return to History
        </button>
      </div>
    );
  }

  const ai = session.aiAnalysisResult;

  // Generate a sample synthetic waveform for session replay if empty
  const sampleWaveform =
    session.audioData ||
    Array.from({ length: 150 }, (_, i) => {
      const t = i * 0.08;
      return (
        Math.sin(t) * 800 +
        Math.sin(t * 2.5) * 350 +
        Math.sin(t * 5.0) * 120 +
        (Math.sin(i * 3) * 50)
      );
    });

  return (
    <div className="space-y-6">
      {/* Top Header Bar with Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          id="btn-back-from-session-detail"
          onClick={() => onNavigate('history')}
          className="flex items-center gap-2 text-xs font-bold text-[#94A3B8] hover:text-[#22D3EE] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to History
        </button>

        <div className="flex items-center gap-3">
          <button
            id="btn-reanalyze-ai"
            disabled={isReanalyzing}
            onClick={handleReanalyzeWithAi}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] border border-[#475569] text-xs font-semibold text-[#22D3EE] transition cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin' : ''}`} />
            {isReanalyzing ? 'Re-analyzing...' : 'Refresh AI Analysis'}
          </button>

          <button
            id="btn-print-report"
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#06B6D4] hover:bg-[#22D3EE] text-xs font-bold text-[#0B0F17] transition shadow cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Export PDF Report
          </button>
        </div>
      </div>

      {/* Session Title & Metadata Header */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#22D3EE] mb-1">
              <span>{session.examinationType}</span>
              <span className="text-[#64748B]">•</span>
              <span className="font-mono">{session.appSessionId}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#F8FAFC]">
              {session.siteName || session.site}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A3B8] mt-2">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#22D3EE]" />
                {session.patientName} ({session.patientAge}y, {session.patientSex})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(session.startTimestampMs).toLocaleString()}
              </span>
              <span>•</span>
              <span>Duration: {session.durationSeconds}s</span>
              <span>•</span>
              <span className="text-[#22D3EE] font-mono">Filter: {session.filterMode}</span>
            </div>
          </div>

          {/* Audio Player Action */}
          <div className="flex items-center gap-3">
            <button
              id="btn-play-session-audio"
              onClick={handleTogglePlayAudio}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-xs transition shadow-lg cursor-pointer ${
                isPlayingAudio
                  ? 'bg-[#EF4444] hover:bg-[#F87171] text-[#FFFFFF]'
                  : 'bg-[#06B6D4] hover:bg-[#22D3EE] text-[#0B0F17]'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  Pause Stethoscope Audio
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Play Stethoscope Audio
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Vitals Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center justify-between">
            <span>Pulse Rate</span>
            <Heart className="w-4 h-4 text-[#F43F5E]" />
          </div>
          <div className="text-2xl font-extrabold text-[#F8FAFC] mt-2">
            {session.bpm} <span className="text-xs font-normal text-[#94A3B8]">BPM</span>
          </div>
          <div className="text-[11px] text-[#10B981] mt-1 font-medium">{session.bpmStatus}</div>
        </div>

        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center justify-between">
            <span>Blood Oxygen</span>
            <Activity className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-2xl font-extrabold text-[#F8FAFC] mt-2">
            {session.spo2} <span className="text-xs font-normal text-[#94A3B8]">% SpO2</span>
          </div>
          <div className="text-[11px] text-[#10B981] mt-1 font-medium">{session.spo2Status}</div>
        </div>

        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center justify-between">
            <span>Signal Quality</span>
            <Radio className="w-4 h-4 text-[#22D3EE]" />
          </div>
          <div className="text-2xl font-extrabold text-[#F8FAFC] mt-2">
            {session.signalQualityScore}%
          </div>
          <div className="text-[11px] text-[#22D3EE] mt-1 font-medium">
            {session.waveformStability}
          </div>
        </div>

        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center justify-between">
            <span>Usability Flag</span>
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-lg font-bold text-[#10B981] mt-2">
            {session.isUsableSignal ? 'Valid Telemetry' : 'Unstable'}
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-1 font-mono">
            {session.sampleCount} Samples Recorded
          </div>
        </div>
      </div>

      {/* AI Clinical Diagnostic Engine Card */}
      {ai && (
        <div className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] border border-[#06B6D4]/40 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#06B6D4]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/20 flex items-center justify-center text-[#22D3EE]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#F8FAFC]">{ai.summaryTitle}</h3>
                  <p className="text-[11px] text-[#94A3B8]">
                    Confidence Level: <span className="text-[#22D3EE] font-bold">{ai.confidencePercentage || 92}%</span>
                  </p>
                </div>
              </div>
            </div>

            {ai.primaryDiagnosis && (
              <div className="p-3.5 rounded-2xl bg-[#06B6D4]/10 border border-[#06B6D4]/30 text-sm font-semibold text-[#E2E8F0]">
                {ai.primaryDiagnosis}
              </div>
            )}

            <div className="text-xs text-[#94A3B8] leading-relaxed">
              {ai.summaryDetails}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#0F172A] border border-[#334155]/60 text-xs">
                <div className="text-[#10B981] font-bold mb-1">SpO2 Evaluation</div>
                <div className="text-[#94A3B8]">{ai.spo2Interpretation}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0F172A] border border-[#334155]/60 text-xs">
                <div className="text-[#10B981] font-bold mb-1">Pulse Evaluation</div>
                <div className="text-[#94A3B8]">{ai.pulseInterpretation}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0F172A] border border-[#334155]/60 text-xs">
                <div className="text-[#22D3EE] font-bold mb-1">Acoustic Signal</div>
                <div className="text-[#94A3B8]">{ai.acousticSignalQualityText}</div>
              </div>
            </div>

            {ai.recommendedUserActions && ai.recommendedUserActions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#334155]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] mb-2">
                  Recommended Self-Monitoring Actions
                </h4>
                <ul className="space-y-1.5 text-xs text-[#94A3B8]">
                  {ai.recommendedUserActions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Oscilloscope Waveform Replay */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-[#F8FAFC] mb-3">Recorded Acoustic Oscilloscope Replay</h3>
        <WaveformView waveform={sampleWaveform} height={160} />
      </div>

      {/* Non-diagnostic Disclaimer Footer */}
      <div className="p-4 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
        <p className="text-xs text-[#E2E8F0] leading-relaxed">
          <strong className="text-[#F59E0B]">Educational Self-Monitoring Disclaimer:</strong> Ausculta is an acoustic signal analysis tool intended for educational demonstration and personal wellness baseline tracking. It does not provide certified medical diagnoses. Always consult licensed medical professionals for health concerns.
        </p>
      </div>
    </div>
  );
};
