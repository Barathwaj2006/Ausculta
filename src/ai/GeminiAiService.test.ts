import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeminiAiService } from './GeminiAiService';
import { Session } from '../types';

describe('GeminiAiService', () => {
  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    const mockLocalStorage = {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value.toString(); }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
      clear: vi.fn(() => { for (const key in store) delete store[key]; })
    };
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      configurable: true,
    });
  });

  let service: GeminiAiService;
  let mockSession: Session;

  beforeEach(() => {
    service = new GeminiAiService();
    mockSession = {
      id: 'test-id',
      patientId: 'patient-1',
      patientName: 'John Doe',
      patientAge: 30,
      patientSex: 'Male',
      examinationType: 'Routine',
      site: 'AORTIC',
      siteName: 'Test Site',
      filterMode: 'WIDEBAND',
      startTimestampMs: Date.now(),
      endTimestampMs: Date.now() + 30000,
      durationSeconds: 30,
      appSessionId: 'app-session-1',
      appVersion: '1.0.0',
      deviceStatus: 'CONNECTED',
      deviceIdentifier: 'device-1',
      bpm: 75,
      bpmStatus: 'NORMAL',
      spo2: 98,
      spo2Status: 'NORMAL',
      audioBlobUrl: 'test.wav',
      signalQualityScore: 90,
      waveformStability: 'STABLE',
      isUsableSignal: true,
      sampleCount: 1000,
      waveDataCsv: '0,0,0',
      aiSummary: ''
    };

    // Reset fetch mock before each test
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return AI summary on successful fetch', async () => {
    const mockResponse = {
      summaryTitle: 'Test AI Summary',
      summaryDetails: 'Test Details',
      primaryDiagnosis: 'Test Diagnosis',
      confidencePercentage: 95,
      spo2Interpretation: 'Test SpO2',
      pulseInterpretation: 'Test Pulse',
      acousticSignalQualityText: 'Test Quality',
      recommendedUserActions: ['Action 1', 'Action 2'],
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await service.analyzeSession(mockSession);

    expect(global.fetch).toHaveBeenCalledWith('/api/ai/analyze', expect.any(Object));
    expect(result).toEqual(mockResponse);
  });

  it('should fallback to deterministic engine if fetch throws an error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    // Spy on console.warn to keep test output clean and verify it's called
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await service.analyzeSession(mockSession);

    expect(global.fetch).toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Backend AI analysis call failed, using deterministic fallback:',
      expect.any(Error)
    );
    expect(result.summaryTitle).toBe('AI-Assisted Session Summary');
    // From ClinicalDiagnosticEngine logic
    expect(result.spo2Interpretation).toContain('WITHIN_RANGE');

    consoleWarnSpy.mockRestore();
  });

  it('should fallback to deterministic engine if fetch returns non-ok response', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await service.analyzeSession(mockSession);

    expect(global.fetch).toHaveBeenCalled();
    expect(result.summaryTitle).toBe('AI-Assisted Session Summary');
    expect(result.pulseInterpretation).toContain('WITHIN_RANGE');
  });
});
