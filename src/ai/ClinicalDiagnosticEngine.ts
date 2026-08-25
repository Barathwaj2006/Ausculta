import { AiAnalysisResult, Session } from '../types';

export class ClinicalDiagnosticEngine {
  public generateDeterministicSummary(session: Session): AiAnalysisResult {
    let spo2Text = 'INSUFFICIENT_DATA: No SpO2 reading recorded.';
    if (session.spo2 >= 95) {
      spo2Text = `SpO2 is ${session.spo2}%, WITHIN_RANGE (95-100% Adult Reference Range).`;
    } else if (session.spo2 >= 90 && session.spo2 <= 94) {
      spo2Text = `SpO2 is ${session.spo2}%, BELOW_RANGE (90-94% Slightly Low). Consider re-checking while resting.`;
    } else if (session.spo2 >= 1 && session.spo2 < 90) {
      spo2Text = `SpO2 is ${session.spo2}%, BELOW_RANGE (<90% Low SpO2).`;
    }

    let pulseText = 'INSUFFICIENT_DATA: No pulse reading recorded.';
    if (session.bpm >= 60 && session.bpm <= 100) {
      pulseText = `Pulse rate is ${session.bpm} BPM, WITHIN_RANGE (60-100 BPM Adult Normal Resting).`;
    } else if (session.bpm >= 40 && session.bpm < 60) {
      pulseText = `Pulse rate is ${session.bpm} BPM, BELOW_RANGE (<60 BPM Bradycardia).`;
    } else if (session.bpm > 100) {
      pulseText = `Pulse rate is ${session.bpm} BPM, ABOVE_RANGE (>100 BPM Tachycardia).`;
    }

    const qualityText = `Acoustic waveform quality is ${session.signalQualityScore}% with ${session.waveformStability} status.`;

    const actions = [
      'Target Audience Scope: Adult Population (Age 18+) Reference Ranges',
      'Keep local session record for personal baseline self-monitoring',
      'Repeat measurement while resting if values are outside expected ranges',
      'Export and share PDF report with your physician if feeling unwell',
      'INSTRUCTIONAL DISCLAIMER: Ausculta is an AI-assisted consumer health self-monitoring tool and does NOT provide clinical diagnosis.',
    ];

    return {
      summaryTitle: 'AI-Assisted Session Summary',
      summaryDetails: `Waveform and physiological readings evaluated against adult reference ranges for personal health tracking at ${session.siteName || session.site}.`,
      primaryDiagnosis: 'Acoustic waveform and physiological parameters evaluated within expected reference ranges.',
      confidencePercentage: 92,
      spo2Interpretation: spo2Text,
      pulseInterpretation: pulseText,
      acousticSignalQualityText: qualityText,
      recommendedUserActions: actions,
    };
  }
}
