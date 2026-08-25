import React from 'react';
import { Wifi, Activity, AlertCircle, RefreshCw, Cpu } from 'lucide-react';
import { DeviceConnectionState } from '../types';

interface DeviceStatusCardProps {
  connectionState: DeviceConnectionState;
  isFingerContact: boolean;
  onConnectClick: () => void;
  onToggleSimulator: () => void;
  className?: string;
}

export const DeviceStatusCard: React.FC<DeviceStatusCardProps> = ({
  connectionState,
  isFingerContact,
  onConnectClick,
  onToggleSimulator,
  className = '',
}) => {
  const getStatusColor = () => {
    switch (connectionState) {
      case 'CONNECTED':
        return 'bg-[#10B981] text-[#10B981]';
      case 'SIMULATING':
        return 'bg-[#22D3EE] text-[#22D3EE]';
      case 'CONNECTING':
        return 'bg-[#F59E0B] text-[#F59E0B]';
      case 'DEVICE_UNAVAILABLE':
        return 'bg-[#EF4444] text-[#EF4444]';
      case 'DISCONNECTED':
      default:
        return 'bg-[#94A3B8] text-[#94A3B8]';
    }
  };

  const getStatusLabel = () => {
    switch (connectionState) {
      case 'CONNECTED':
        return 'Connected (Wi-Fi AP)';
      case 'SIMULATING':
        return 'Simulator Mode';
      case 'CONNECTING':
        return 'Connecting...';
      case 'DEVICE_UNAVAILABLE':
        return 'Device Unavailable';
      case 'DISCONNECTED':
      default:
        return 'Disconnected';
    }
  };

  return (
    <div
      id="device-status-card"
      className={`bg-[#1E293B] border border-[#334155] rounded-2xl p-4 shadow-lg ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center">
            <span
              className={`w-3 h-3 rounded-full ${getStatusColor().split(' ')[0]} animate-pulse`}
            />
          </div>
          <div>
            <div className="font-semibold text-[#F8FAFC] text-base flex items-center gap-2">
              <span>{getStatusLabel()}</span>
              {connectionState === 'SIMULATING' && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#06B6D4]/20 text-[#22D3EE] border border-[#06B6D4]/40">
                  Dev Synth
                </span>
              )}
            </div>
          </div>
        </div>

        {(connectionState === 'DISCONNECTED' || connectionState === 'DEVICE_UNAVAILABLE') && (
          <button
            id="btn-connect-device"
            onClick={onConnectClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#06B6D4] hover:bg-[#22D3EE] text-[#0B0F17] text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
          >
            <Wifi className="w-3.5 h-3.5" />
            Connect
          </button>
        )}

        {connectionState === 'CONNECTING' && (
          <div className="flex items-center gap-1 text-xs text-[#F59E0B] font-medium">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Polling...
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-[#334155]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-xs text-[#94A3B8] font-mono">
            Protocol: Wi-Fi SoftAP HTTP (192.168.4.1)
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-xs">
            <span className="text-[#94A3B8]">Sensor Contact:</span>
            <span
              className={`font-semibold flex items-center gap-1 ${
                isFingerContact ? 'text-[#10B981]' : 'text-[#EF4444]'
              }`}
            >
              {isFingerContact ? (
                <>
                  <Activity className="w-3 h-3" /> Firm Contact
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" /> Loss of Contact
                </>
              )}
            </span>
          </div>
        </div>

        <button
          id="btn-toggle-simulator"
          onClick={onToggleSimulator}
          className="self-start sm:self-auto text-xs text-[#22D3EE] hover:text-[#67E8F9] flex items-center gap-1 font-medium transition cursor-pointer"
        >
          <Cpu className="w-3.5 h-3.5" />
          {connectionState === 'SIMULATING' ? 'Use Real Wi-Fi AP' : 'Dev Simulator'}
        </button>
      </div>
    </div>
  );
};
