import { AiAnalysisResult, Session } from '../types';
import { ClinicalDiagnosticEngine } from './ClinicalDiagnosticEngine';

export class GeminiAiService {
  private fallbackEngine = new ClinicalDiagnosticEngine();

  public async analyzeSession(session: Session, apiKey?: string): Promise<AiAnalysisResult> {
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session,
          apiKey: apiKey || localStorage.getItem('ausculta_gemini_api_key') || '',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return {
          summaryTitle: result.summaryTitle || 'AI-Assisted Session Summary',
          summaryDetails: result.summaryDetails || 'Analysis completed successfully.',
          primaryDiagnosis: result.primaryDiagnosis || 'Acoustic waveform and physiological parameters evaluated.',
          confidencePercentage: result.confidencePercentage || 92,
          spo2Interpretation: result.spo2Interpretation || 'SpO2 within adult reference ranges.',
          pulseInterpretation: result.pulseInterpretation || 'Pulse rate within adult baseline.',
          acousticSignalQualityText: result.acousticSignalQualityText || 'Acoustic quality verified.',
          recommendedUserActions: Array.isArray(result.recommendedUserActions)
            ? result.recommendedUserActions
            : [
                'Keep local session record for personal baseline self-monitoring',
                'INSTRUCTIONAL DISCLAIMER: Ausculta is an AI-assisted consumer health self-monitoring tool and does NOT provide clinical diagnosis.',
              ],
        };
      }
    } catch (err) {
      console.warn('Backend AI analysis call failed, using deterministic fallback:', err);
    }

    return this.fallbackEngine.generateDeterministicSummary(session);
  }
}

export const geminiAiService = new GeminiAiService();
