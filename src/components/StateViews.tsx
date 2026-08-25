import React from 'react';
import { Activity, Stethoscope, WifiOff, AlertTriangle, Radio } from 'lucide-react';

export const LoadingStateView: React.FC<{ message?: string; className?: string }> = ({
  message = 'Processing physiological audio stream...',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-[#1E293B] border border-[#334155] rounded-2xl ${className}`}
    >
      <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[#06B6D4]/10 border-2 border-[#22D3EE] animate-pulse">
        <Activity className="w-8 h-8 text-[#22D3EE] animate-spin" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-[#E2E8F0]">{message}</h3>
      <p className="mt-1 text-xs text-[#94A3B8]">AI Diagnostic Engine Analyzing Signals</p>
    </div>
  );
};

export const EmptyStateView: React.FC<{
  title?: string;
  subtitle?: string;
  actionText?: string;
  onActionClick?: () => void;
  className?: string;
}> = ({
  title = 'No Auscultation Records',
  subtitle = 'Perform a live recording session with the ESP32 stethoscope to generate diagnostic reports.',
  actionText = 'Start Live Auscultation',
  onActionClick,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-[#1E293B] border border-[#334155] rounded-2xl ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-[#334155] flex items-center justify-center text-2xl">
        <Stethoscope className="w-7 h-7 text-[#22D3EE]" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-[#F8FAFC]">{title}</h3>
      <p className="mt-2 text-sm text-[#94A3B8] max-w-md">{subtitle}</p>
      {onActionClick && (
        <button
          onClick={onActionClick}
          className="mt-5 px-4 py-2 bg-[#06B6D4] hover:bg-[#22D3EE] text-[#0B0F17] font-bold text-sm rounded-xl transition shadow active:scale-95 cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export const ErrorStateView: React.FC<{
  errorMessage?: string;
  onRetry: () => void;
  className?: string;
}> = ({
  errorMessage = 'Unable to connect to ESP32 SoftAP at 192.168.4.1',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-[#1E293B] border border-[#EF4444]/40 rounded-2xl ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-[#EF4444]/20 flex items-center justify-center text-[#EF4444]">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="mt-3 text-base font-bold text-[#F8FAFC]">Hardware Communication Error</h3>
      <p className="mt-2 text-xs text-[#94A3B8] max-w-sm">{errorMessage}</p>
      <button
        onClick={onRetry}
        className="mt-4 px-4 py-2 border border-[#06B6D4] text-[#22D3EE] hover:bg-[#06B6D4]/10 text-xs font-semibold rounded-lg transition cursor-pointer"
      >
        Retry Connection
      </button>
    </div>
  );
};

export const DisconnectedStateView: React.FC<{
  onConnectClick: () => void;
  onSimulatorClick: () => void;
  className?: string;
}> = ({ onConnectClick, onSimulatorClick, className = '' }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-[#1E293B] border border-[#334155] rounded-2xl ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-[#334155] flex items-center justify-center text-[#94A3B8]">
        <WifiOff className="w-7 h-7 text-[#94A3B8]" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-[#F8FAFC]">ESP32 Device Disconnected</h3>
      <p className="mt-2 text-xs text-[#94A3B8] max-w-md">
        Connect to your ESP32 Wi-Fi SoftAP ('Ausculta-ESP32' at 192.168.4.1) or enable isolated Simulator Mode for dev testing.
      </p>
      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={onConnectClick}
          className="px-4 py-2 bg-[#06B6D4] hover:bg-[#22D3EE] text-[#0B0F17] font-bold text-xs rounded-xl transition shadow cursor-pointer"
        >
          Connect Wi-Fi AP
        </button>
        <button
          onClick={onSimulatorClick}
          className="px-4 py-2 border border-[#06B6D4] text-[#22D3EE] hover:bg-[#06B6D4]/10 font-bold text-xs rounded-xl transition cursor-pointer"
        >
          Dev Simulator
        </button>
      </div>
    </div>
  );
};

export const PoorSignalStateView: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/50 ${className}`}
    >
      <Radio className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
      <div>
        <h4 className="text-xs font-bold text-[#F59E0B]">Sensor Contact Warning</h4>
        <p className="text-xs text-[#E2E8F0] mt-0.5">
          Ensure firm chest contact. SpO2 sensor finger detector indicates poor signal quality.
        </p>
      </div>
    </div>
  );
};
