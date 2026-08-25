import React, { useState } from 'react';
import {
  Settings,
  Wifi,
  Key,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Sparkles,
} from 'lucide-react';
import { Esp32Config, DeviceConnectionState } from '../types';
import { deviceCommunicator } from '../device/DeviceCommunicator';

interface SettingsScreenProps {
  connectionState: DeviceConnectionState;
  onResetData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  connectionState,
  onResetData,
}) => {
  const [config, setConfig] = useState<Esp32Config>(deviceCommunicator.getConfig());
  const [geminiKey, setGeminiKey] = useState<string>(
    localStorage.getItem('ausculta_gemini_api_key') || ''
  );
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'testing' | 'success' | 'failed';
    message: string;
  }>({ status: 'idle', message: '' });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    deviceCommunicator.updateConfig(config);
    if (geminiKey) {
      localStorage.setItem('ausculta_gemini_api_key', geminiKey);
    } else {
      localStorage.removeItem('ausculta_gemini_api_key');
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestEsp32Connection = async () => {
    setTestResult({ status: 'testing', message: 'Pinging ESP32 device...' });
    const targetUrl = `http://${config.host}:${config.port}${config.endpoint}`;

    try {
      const proxyUrl = `/api/esp32/proxy?url=${encodeURIComponent(targetUrl)}&timeout=2000`;
      const start = Date.now();
      const res = await fetch(proxyUrl);
      const duration = Date.now() - start;

      if (res.ok) {
        const data = await res.json();
        setTestResult({
          status: 'success',
          message: `Connection successful (${duration}ms latency). Packet received with ${
            Array.isArray(data.wave) ? data.wave.length : 0
          } wave samples.`,
        });
      } else {
        setTestResult({
          status: 'failed',
          message: `ESP32 returned HTTP ${res.status}. Check Wi-Fi SoftAP connection.`,
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'failed',
        message: `Connection timed out. Ensure your computer is connected to '${config.ssid}' Wi-Fi AP.`,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#F8FAFC]">System & Hardware Settings</h1>
        <p className="text-xs text-[#94A3B8] mt-1">
          Configure ESP32 Wi-Fi SoftAP telemetry protocols and AI diagnostic engine preferences.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* ESP32 Wi-Fi Protocol Configuration */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-bold text-[#F8FAFC] mb-4 pb-3 border-b border-[#334155]">
            <Wifi className="w-4 h-4 text-[#22D3EE]" />
            <span>ESP32 Wi-Fi SoftAP Protocol (HTTP Polling)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-1">
                SoftAP SSID Network Name
              </label>
              <input
                type="text"
                value={config.ssid}
                onChange={(e) => setConfig({ ...config, ssid: e.target.value })}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#22D3EE]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-1">
                ESP32 Host IP Address
              </label>
              <input
                type="text"
                value={config.host}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#22D3EE] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-1">
                HTTP Port
              </label>
              <input
                type="number"
                value={config.port}
                onChange={(e) => setConfig({ ...config, port: Number(e.target.value) })}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#22D3EE] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-1">
                Data Endpoint URI
              </label>
              <input
                type="text"
                value={config.endpoint}
                onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#22D3EE] font-mono"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#334155]/60">
            <button
              type="button"
              id="btn-test-esp32"
              onClick={handleTestEsp32Connection}
              disabled={testResult.status === 'testing'}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#334155] border border-[#475569] text-xs font-semibold text-[#22D3EE] transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testResult.status === 'testing' ? 'animate-spin' : ''}`} />
              {testResult.status === 'testing' ? 'Testing Connection...' : 'Test Hardware Connection'}
            </button>

            {testResult.status === 'success' && (
              <span className="text-xs text-[#10B981] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {testResult.message}
              </span>
            )}
            {testResult.status === 'failed' && (
              <span className="text-xs text-[#EF4444] flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {testResult.message}
              </span>
            )}
          </div>
        </div>

        {/* AI Intelligence Service */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-bold text-[#F8FAFC] mb-4 pb-3 border-b border-[#334155]">
            <Sparkles className="w-4 h-4 text-[#A855F7]" />
            <span>AI Clinical Diagnostic Engine Configuration</span>
          </div>

          <p className="text-xs text-[#94A3B8] mb-4 leading-relaxed">
            Ausculta incorporates a built-in deterministic clinical intelligence engine that operates offline without any external services. You can optionally specify a Gemini API key to activate enhanced cloud-based acoustic pattern descriptions.
          </p>

          <div>
            <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-1">
              Gemini API Key (Optional)
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#22D3EE] font-mono"
            />
            <p className="text-[11px] text-[#64748B] mt-1.5">
              Leave blank to use the server environment variable or deterministic onboard logic.
            </p>
          </div>
        </div>

        {/* Save Bar & Data Management */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onResetData}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#EF4444]/40 text-xs font-bold text-[#EF4444] hover:bg-[#EF4444]/10 transition cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            Reset Sample Data
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs font-bold text-[#10B981] flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" /> Settings Saved!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#06B6D4] hover:bg-[#22D3EE] text-xs font-extrabold text-[#0B0F17] transition shadow cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
