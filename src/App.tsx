import React, { useState, useEffect } from 'react';
import {
  Activity,
  Heart,
  Clock,
  User,
  Settings,
  Cpu,
  Wifi,
  Sparkles,
  Stethoscope,
  ChevronRight,
  Shield,
} from 'lucide-react';
import {
  ActiveScreen,
  DeviceConnectionState,
  DevicePacket,
  Patient,
  Session,
  SignalMetrics,
} from './types';
import { deviceCommunicator } from './device/DeviceCommunicator';
import { SignalMetricsCalculator } from './dsp/SignalMetricsCalculator';
import { FftCalculator } from './dsp/FftCalculator';
import { StorageService } from './services/StorageService';

import { DashboardScreen } from './screens/DashboardScreen';
import { LiveAuscultationScreen } from './screens/LiveAuscultationScreen';
import { SessionDetailScreen } from './screens/SessionDetailScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { PatientsScreen } from './screens/PatientsScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('dashboard');
  const [activeSessionId, setActiveSessionId] = useState<string>('');

  const [connectionState, setConnectionState] = useState<DeviceConnectionState>(
    deviceCommunicator.getState()
  );
  const [liveWaveform, setLiveWaveform] = useState<number[]>([]);
  const [liveSpectrum, setLiveSpectrum] = useState<number[]>(new Array(16).fill(0.05));
  const [signalMetrics, setSignalMetrics] = useState<SignalMetrics>(
    SignalMetricsCalculator.calculateFromWaveform([], 0, 0, false)
  );

  const [sessions, setSessions] = useState<Session[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  // Load initial data
  const refreshSessions = () => {
    setSessions(StorageService.getSessions());
  };
  const refreshPatients = () => {
    setPatients(StorageService.getPatients());
  };

  useEffect(() => {
    refreshSessions();
    refreshPatients();

    // Default: start in Simulator mode for instant live interactive feedback
    deviceCommunicator.startSimulationMode();

    const unsubState = deviceCommunicator.addStateListener((st) => {
      setConnectionState(st);
    });

    const unsubPacket = deviceCommunicator.addPacketListener((packet: DevicePacket) => {
      if (packet && packet.wave && packet.wave.length > 0) {
        setLiveWaveform(packet.wave);

        // Compute 16-band spectrum
        const spectrum = FftCalculator.computeSpectrum16(packet.wave);
        setLiveSpectrum(spectrum);

        // Compute signal metrics
        const metrics = SignalMetricsCalculator.calculateFromWaveform(
          packet.wave,
          packet.spo2,
          packet.bpm,
          packet.finger
        );
        setSignalMetrics(metrics);
      }
    });

    return () => {
      unsubState();
      unsubPacket();
    };
  }, []);

  const handleNavigate = (screen: ActiveScreen, sessionId?: string) => {
    setActiveScreen(screen);
    if (sessionId) {
      setActiveSessionId(sessionId);
    }
  };

  const handleConnectClick = () => {
    deviceCommunicator.startConnecting();
  };

  const handleToggleSimulator = () => {
    if (connectionState === 'SIMULATING') {
      deviceCommunicator.startConnecting();
    } else {
      deviceCommunicator.startSimulationMode();
    }
  };

  const handleSessionCreated = (newSession: Session) => {
    refreshSessions();
    setActiveSessionId(newSession.id);
    setActiveScreen('session_detail');
  };

  const handleResetData = () => {
    localStorage.removeItem('ausculta_sessions_v1');
    localStorage.removeItem('ausculta_patients_v1');
    refreshSessions();
    refreshPatients();
    alert('Sample database reset successfully.');
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#F8FAFC] flex flex-col selection:bg-[#06B6D4] selection:text-[#0B0F17]">
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-md border-b border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Tag */}
            <div
              onClick={() => handleNavigate('dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#06B6D4] to-[#22D3EE] flex items-center justify-center shadow-lg group-hover:scale-105 transition">
                <Stethoscope className="w-5 h-5 text-[#0B0F17]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-[#F8FAFC]">
                    AUSCULTA
                  </span>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#06B6D4]/15 border border-[#06B6D4]/40 text-[#22D3EE]">
                    v1.0
                  </span>
                </div>
                <div className="text-[10px] text-[#94A3B8] font-mono tracking-tight hidden sm:block">
                  Deep Rhythm Intelligence
                </div>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1">
              <button
                id="nav-dashboard"
                onClick={() => handleNavigate('dashboard')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeScreen === 'dashboard'
                    ? 'bg-[#1E293B] text-[#22D3EE] border border-[#334155]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/50'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Dashboard
              </button>

              <button
                id="nav-live-auscultation"
                onClick={() => handleNavigate('live_auscultation')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeScreen === 'live_auscultation'
                    ? 'bg-[#06B6D4] text-[#0B0F17] shadow-sm font-extrabold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/50'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                Live Stethoscope
              </button>

              <button
                id="nav-history"
                onClick={() => handleNavigate('history')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeScreen === 'history' || activeScreen === 'session_detail'
                    ? 'bg-[#1E293B] text-[#22D3EE] border border-[#334155]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/50'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                History & Reports
              </button>

              <button
                id="nav-patients"
                onClick={() => handleNavigate('patients')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeScreen === 'patients'
                    ? 'bg-[#1E293B] text-[#22D3EE] border border-[#334155]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/50'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Profiles
              </button>

              <button
                id="nav-settings"
                onClick={() => handleNavigate('settings')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeScreen === 'settings'
                    ? 'bg-[#1E293B] text-[#22D3EE] border border-[#334155]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/50'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </button>
            </nav>

            {/* Quick Live Mode Indicator / CTA */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleSimulator}
                className="hidden sm:flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-[#0F172A] border border-[#334155] text-[#22D3EE] font-mono cursor-pointer hover:border-[#475569] transition"
              >
                <Cpu className="w-3 h-3" />
                {connectionState === 'SIMULATING' ? 'Simulator Active' : 'Wi-Fi AP'}
              </button>

              <button
                onClick={() => handleNavigate('live_auscultation')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#06B6D4] hover:bg-[#22D3EE] text-[#0B0F17] text-xs font-extrabold transition shadow cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                Live Studio
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center justify-around border-t border-[#1E293B] py-2 px-2 bg-[#0B0F17]">
          <button
            onClick={() => handleNavigate('dashboard')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeScreen === 'dashboard' ? 'text-[#22D3EE] bg-[#1E293B]' : 'text-[#94A3B8]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleNavigate('live_auscultation')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeScreen === 'live_auscultation' ? 'text-[#0B0F17] bg-[#06B6D4]' : 'text-[#94A3B8]'
            }`}
          >
            Live
          </button>
          <button
            onClick={() => handleNavigate('history')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeScreen === 'history' || activeScreen === 'session_detail'
                ? 'text-[#22D3EE] bg-[#1E293B]'
                : 'text-[#94A3B8]'
            }`}
          >
            History
          </button>
          <button
            onClick={() => handleNavigate('patients')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeScreen === 'patients' ? 'text-[#22D3EE] bg-[#1E293B]' : 'text-[#94A3B8]'
            }`}
          >
            Profiles
          </button>
          <button
            onClick={() => handleNavigate('settings')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeScreen === 'settings' ? 'text-[#22D3EE] bg-[#1E293B]' : 'text-[#94A3B8]'
            }`}
          >
            Settings
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeScreen === 'dashboard' && (
          <DashboardScreen
            connectionState={connectionState}
            signalMetrics={signalMetrics}
            recentSessions={sessions}
            onNavigate={handleNavigate}
            onConnectClick={handleConnectClick}
            onToggleSimulator={handleToggleSimulator}
            liveWaveform={liveWaveform}
          />
        )}

        {activeScreen === 'live_auscultation' && (
          <LiveAuscultationScreen
            connectionState={connectionState}
            signalMetrics={signalMetrics}
            liveWaveform={liveWaveform}
            liveSpectrum={liveSpectrum}
            patients={patients}
            onConnectClick={handleConnectClick}
            onToggleSimulator={handleToggleSimulator}
            onSessionCreated={handleSessionCreated}
          />
        )}

        {activeScreen === 'session_detail' && (
          <SessionDetailScreen
            sessionId={activeSessionId || (sessions[0] && sessions[0].id) || ''}
            onNavigate={handleNavigate}
          />
        )}

        {activeScreen === 'history' && (
          <HistoryScreen
            sessions={sessions}
            onNavigate={handleNavigate}
            onRefreshSessions={refreshSessions}
          />
        )}

        {activeScreen === 'patients' && (
          <PatientsScreen
            patients={patients}
            onRefreshPatients={refreshPatients}
          />
        )}

        {activeScreen === 'settings' && (
          <SettingsScreen
            connectionState={connectionState}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Educational & Regulatory Notice Footer */}
      <footer className="mt-auto border-t border-[#1E293B] bg-[#0B0F17] py-6 text-center text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <Shield className="w-4 h-4 text-[#06B6D4]" />
            <span>Ausculta • Deep Rhythm Intelligence Platform</span>
          </div>
          <div className="text-[11px] text-[#64748B]">
            Educational physiological self-monitoring telemetry. Not for clinical diagnosis.
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
