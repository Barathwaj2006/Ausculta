import React from 'react';
import {
  Activity,
  Heart,
  Radio,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  ActiveScreen,
  DeviceConnectionState,
  Session,
  SignalMetrics,
} from '../types';
import { DeviceStatusCard } from '../components/DeviceStatusCard';
import { WaveformView } from '../components/WaveformView';

interface DashboardScreenProps {
  connectionState: DeviceConnectionState;
  signalMetrics: SignalMetrics;
  recentSessions: Session[];
  onNavigate: (screen: ActiveScreen, sessionId?: string) => void;
  onConnectClick: () => void;
  onToggleSimulator: () => void;
  liveWaveform: number[];
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  connectionState,
  signalMetrics,
  recentSessions,
  onNavigate,
  onConnectClick,
  onToggleSimulator,
  liveWaveform,
}) => {
  const latestSession = recentSessions[0];

  return (
    <div className="space-y-6">
      {/* Top Banner / Device Connection status */}
      <DeviceStatusCard
        connectionState={connectionState}
        isFingerContact={signalMetrics.fingerDetected}
        onConnectClick={onConnectClick}
        onToggleSimulator={onToggleSimulator}
      />

      {/* Main Quick Action Hero */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-[#334155] rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#06B6D4]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#22D3EE] mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Acoustic Diagnostic Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
              Deep Rhythm Stethoscope
            </h2>
            <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed">
              Capture high-fidelity cardiopulmonary acoustic signals with real-time DSP filtering, 16-band FFT spectral decomposition, and AI-assisted clinical insights.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-dashboard-start-auscultation"
              onClick={() => onNavigate('live_auscultation')}
              className="flex items-center gap-2 px-6 py-3.5 bg-[#06B6D4] hover:bg-[#22D3EE] text-[#0B0F17] font-extrabold text-sm rounded-xl transition shadow-lg active:scale-95 cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              Start Live Auscultation
            </button>
            <button
              id="btn-dashboard-view-history"
              onClick={() => onNavigate('history')}
              className="flex items-center gap-2 px-4 py-3.5 bg-[#1E293B] hover:bg-[#334155] text-[#E2E8F0] border border-[#475569] text-sm font-semibold rounded-xl transition active:scale-95 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              Review History
            </button>
          </div>
        </div>
      </div>

      {/* Live Vitals Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Heart Rate / Pulse */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Pulse Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F43F5E]/15 flex items-center justify-center text-[#F43F5E]">
              <Heart className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-[#F8FAFC]">
              {signalMetrics.currentBpm > 0 ? signalMetrics.currentBpm : '--'}
              <span className="text-xs font-medium text-[#94A3B8] ml-1.5">BPM</span>
            </div>
            <p className="text-xs text-[#10B981] mt-1 font-medium">
              {signalMetrics.bpmStatus !== 'INSUFFICIENT_DATA'
                ? signalMetrics.bpmStatus
                : 'Awaiting sensor contact'}
            </p>
          </div>
        </div>

        {/* Blood Oxygen Saturation */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              SpO2 Saturation
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 flex items-center justify-center text-[#10B981]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-[#F8FAFC]">
              {signalMetrics.spo2 > 0 ? signalMetrics.spo2 : '--'}
              <span className="text-xs font-medium text-[#94A3B8] ml-1.5">%</span>
            </div>
            <p className="text-xs text-[#10B981] mt-1 font-medium">
              {signalMetrics.spo2Status !== 'INSUFFICIENT_DATA'
                ? signalMetrics.spo2Status
                : 'Awaiting pulse reading'}
            </p>
          </div>
        </div>

        {/* Signal Quality & Stability */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Signal Stability
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/15 flex items-center justify-center text-[#22D3EE]">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-[#F8FAFC]">
              {signalMetrics.signalQualityScore > 0 ? `${signalMetrics.signalQualityScore}%` : '--'}
            </div>
            <p className="text-xs text-[#22D3EE] mt-1 font-medium">
              {signalMetrics.waveformStability}
            </p>
          </div>
        </div>
      </div>

      {/* Live Acoustic Waveform Preview */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-ping" />
            <h3 className="text-sm font-bold text-[#F8FAFC]">Live Digital Oscilloscope Feed</h3>
          </div>
          <button
            onClick={() => onNavigate('live_auscultation')}
            className="text-xs text-[#22D3EE] hover:text-[#67E8F9] flex items-center gap-1 font-semibold transition cursor-pointer"
          >
            Open Full Studio <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <WaveformView waveform={liveWaveform} height={140} />
      </div>

      {/* Recent Sessions & Latest Clinical Finding */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest AI Summary Card */}
        {latestSession ? (
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#22D3EE] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  Latest Session Insight
                </span>
                <span className="text-xs text-[#94A3B8] font-mono">
                  {new Date(latestSession.startTimestampMs).toLocaleDateString()}
                </span>
              </div>
              <h4 className="text-base font-bold text-[#F8FAFC]">
                {latestSession.siteName || latestSession.site} Examination
              </h4>
              <p className="text-xs text-[#94A3B8] mt-1">
                Patient: <span className="text-[#E2E8F0] font-semibold">{latestSession.patientName}</span> | SpO2: {latestSession.spo2}% | Pulse: {latestSession.bpm} BPM
              </p>
              <div className="mt-3 p-3 rounded-xl bg-[#0F172A] border border-[#334155]/60 text-xs text-[#E2E8F0] leading-relaxed">
                {latestSession.aiAnalysisResult?.primaryDiagnosis || latestSession.aiSummary}
              </div>
            </div>

            <button
              onClick={() => onNavigate('session_detail', latestSession.id)}
              className="mt-4 w-full py-2.5 bg-[#334155] hover:bg-[#475569] text-[#F8FAFC] font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              View Full Clinical Report <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-5 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-[#94A3B8]">No previous sessions recorded yet.</p>
            <button
              onClick={() => onNavigate('live_auscultation')}
              className="mt-3 px-4 py-2 bg-[#06B6D4] text-[#0B0F17] font-bold text-xs rounded-xl"
            >
              Record First Session
            </button>
          </div>
        )}

        {/* Recent Session History List */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#F8FAFC]">Recent Auscultations</h3>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs text-[#22D3EE] hover:underline cursor-pointer"
            >
              View All ({recentSessions.length})
            </button>
          </div>

          <div className="space-y-2">
            {recentSessions.slice(0, 3).map((session) => (
              <div
                key={session.id}
                onClick={() => onNavigate('session_detail', session.id)}
                className="p-3 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] border border-[#334155]/60 transition flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <div className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#22D3EE] transition">
                    {session.siteName || session.site}
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mt-0.5">
                    {session.patientName} • {session.durationSeconds}s • {session.bpm} BPM • {session.spo2}% SpO2
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#22D3EE] transition" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
