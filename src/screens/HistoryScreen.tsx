import React, { useState } from 'react';
import {
  Clock,
  Search,
  Filter,
  Heart,
  Activity,
  Trash2,
  ChevronRight,
  Plus,
  Radio,
} from 'lucide-react';
import { ActiveScreen, Session, AUSCULTATION_SITES } from '../types';
import { StorageService } from '../services/StorageService';
import { EmptyStateView } from '../components/StateViews';

interface HistoryScreenProps {
  sessions: Session[];
  onNavigate: (screen: ActiveScreen, sessionId?: string) => void;
  onRefreshSessions: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  sessions,
  onNavigate,
  onRefreshSessions,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('ALL');

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this auscultation session?')) {
      StorageService.deleteSession(id);
      onRefreshSessions();
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.siteName || s.site).toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.examinationType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.aiSummary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSite = selectedSiteFilter === 'ALL' || s.site === selectedSiteFilter;

    return matchesSearch && matchesSite;
  });

  // Longitudinal statistics
  const totalSessions = sessions.length;
  const avgBpm =
    totalSessions > 0
      ? Math.round(sessions.reduce((acc, s) => acc + (s.bpm || 0), 0) / totalSessions)
      : 0;
  const avgSpo2 =
    totalSessions > 0
      ? Math.round(sessions.reduce((acc, s) => acc + (s.spo2 || 0), 0) / totalSessions)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header & New Session CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F8FAFC]">Auscultation History</h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Review acoustic recordings, longitudinal vitals telemetry, and AI clinical summaries.
          </p>
        </div>

        <button
          id="btn-new-auscultation"
          onClick={() => onNavigate('live_auscultation')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#06B6D4] hover:bg-[#22D3EE] text-[#0B0F17] font-extrabold text-xs rounded-xl transition shadow cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Auscultation
        </button>
      </div>

      {/* Longitudinal Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center justify-between">
            <span>Total Recordings</span>
            <Clock className="w-4 h-4 text-[#22D3EE]" />
          </div>
          <div className="text-3xl font-extrabold text-[#F8FAFC] mt-2">{totalSessions}</div>
          <div className="text-[11px] text-[#94A3B8] mt-1">Clinical Sessions</div>
        </div>

        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center justify-between">
            <span>Average Pulse</span>
            <Heart className="w-4 h-4 text-[#F43F5E]" />
          </div>
          <div className="text-3xl font-extrabold text-[#F8FAFC] mt-2">
            {avgBpm > 0 ? avgBpm : '--'} <span className="text-xs font-normal text-[#94A3B8]">BPM</span>
          </div>
          <div className="text-[11px] text-[#10B981] mt-1">Adult Baseline Average</div>
        </div>

        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center justify-between">
            <span>Average SpO2</span>
            <Activity className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-3xl font-extrabold text-[#F8FAFC] mt-2">
            {avgSpo2 > 0 ? avgSpo2 : '--'} <span className="text-xs font-normal text-[#94A3B8]">%</span>
          </div>
          <div className="text-[11px] text-[#10B981] mt-1">Oxygen Saturation Average</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by patient, site, or finding..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0F172A] border border-[#334155] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#22D3EE]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
          <select
            value={selectedSiteFilter}
            onChange={(e) => setSelectedSiteFilter(e.target.value)}
            className="w-full sm:w-auto bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#22D3EE] cursor-pointer"
          >
            <option value="ALL">All Anatomical Sites</option>
            {Object.values(AUSCULTATION_SITES).map((s) => (
              <option key={s.key} value={s.key}>
                {s.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <EmptyStateView
          title="No Matching Auscultation Records"
          subtitle={
            totalSessions === 0
              ? 'Perform a live recording session with the ESP32 stethoscope to generate diagnostic reports.'
              : 'No sessions match your search or filter criteria.'
          }
          actionText="Start Auscultation"
          onActionClick={() => onNavigate('live_auscultation')}
        />
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onNavigate('session_detail', session.id)}
              className="bg-[#1E293B] hover:bg-[#283548] border border-[#334155] rounded-2xl p-4 transition shadow cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-[#F8FAFC] text-sm group-hover:text-[#22D3EE] transition">
                    {session.siteName || session.site}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0F172A] border border-[#334155] text-[#94A3B8] font-mono">
                    {session.filterMode}
                  </span>
                  <span className="text-[10px] text-[#64748B]">
                    {new Date(session.startTimestampMs).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-xs text-[#94A3B8] flex flex-wrap items-center gap-3">
                  <span>Patient: <strong className="text-[#E2E8F0]">{session.patientName}</strong></span>
                  <span>•</span>
                  <span>Duration: <strong>{session.durationSeconds}s</strong></span>
                  <span>•</span>
                  <span>Signal: <strong className="text-[#22D3EE]">{session.signalQualityScore}%</strong></span>
                </div>

                <div className="text-xs text-[#E2E8F0] bg-[#0F172A]/70 p-2 rounded-lg border border-[#334155]/40 line-clamp-1">
                  {session.aiAnalysisResult?.primaryDiagnosis || session.aiSummary}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#334155]/50">
                <div className="flex items-center gap-2 text-right">
                  <div className="bg-[#0F172A] px-2.5 py-1 rounded-lg border border-[#334155]/60 text-center">
                    <div className="text-xs font-bold text-[#F43F5E]">{session.bpm}</div>
                    <div className="text-[9px] text-[#94A3B8]">BPM</div>
                  </div>
                  <div className="bg-[#0F172A] px-2.5 py-1 rounded-lg border border-[#334155]/60 text-center">
                    <div className="text-xs font-bold text-[#10B981]">{session.spo2}%</div>
                    <div className="text-[9px] text-[#94A3B8]">SpO2</div>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  title="Delete Session"
                  className="p-2 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <ChevronRight className="w-5 h-5 text-[#94A3B8] group-hover:text-[#22D3EE] transition" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
