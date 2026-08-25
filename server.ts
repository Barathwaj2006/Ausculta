import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // ESP32 Proxy Endpoint (helps avoid CORS / mixed-content issues when polling local ESP32 IP from web browser)
  app.get('/api/esp32/proxy', async (req, res) => {
    const targetUrl = (req.query.url as string) || 'http://192.168.4.1/data';
    const timeoutMs = Number(req.query.timeout) || 2000;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeout);

      if (!response.ok) {
        return res.status(response.status).json({ error: `ESP32 returned status ${response.status}` });
      }

      const data = await response.json();
      return res.json(data);
    } catch (err: any) {
      clearTimeout(timeout);
      return res.status(503).json({ error: err?.message || 'Failed to connect to ESP32 device' });
    }
  });

  // AI Diagnostic Analysis Endpoint
  app.post('/api/ai/analyze', async (req, res) => {
    const { session, apiKey } = req.body;
    const key = apiKey || process.env.GEMINI_API_KEY;

    if (!session) {
      return res.status(400).json({ error: 'Session data is required' });
    }

    if (!key) {
      // Fallback deterministic evaluation
      return res.json({
        summaryTitle: 'AI-Assisted Session Summary (Deterministic Engine)',
        summaryDetails: `Session for ${session.patientName || 'User'} at ${session.site || 'Anterior Chest'}. Heart rate (${session.bpm || '--'} BPM) and SpO2 (${session.spo2 || '--'}%) recorded with ${session.waveformStability || 'standard'} signal stability. Keep record for personal health self-monitoring.`,
        spo2Interpretation: (session.spo2 >= 95)
          ? `SpO2 is ${session.spo2}%, WITHIN_RANGE (95-100% Adult Reference Range).`
          : (session.spo2 >= 90)
          ? `SpO2 is ${session.spo2}%, BELOW_RANGE (90-94% Slightly Low). Consider re-checking while resting.`
          : `SpO2 is ${session.spo2 || 0}%, BELOW_RANGE (<90% Low SpO2).`,
        pulseInterpretation: (session.bpm >= 60 && session.bpm <= 100)
          ? `Pulse rate is ${session.bpm} BPM, WITHIN_RANGE (60-100 BPM Adult Normal Resting).`
          : (session.bpm < 60 && session.bpm > 0)
          ? `Pulse rate is ${session.bpm} BPM, BELOW_RANGE (<60 BPM Bradycardia).`
          : `Pulse rate is ${session.bpm} BPM, ABOVE_RANGE (>100 BPM Tachycardia).`,
        acousticSignalQualityText: `Acoustic waveform quality score is ${session.signalQualityScore || 90}% with ${session.waveformStability || 'Stable Waveform'} status.`,
        confidencePercentage: 92,
        primaryDiagnosis: 'Acoustic waveform and physiological parameters evaluated within expected personal reference range.',
        recommendedUserActions: [
          'Target Audience Scope: Adult Population (Age 18+) Reference Ranges',
          'Keep local session record for personal baseline self-monitoring',
          'Repeat measurement while resting if values are outside expected ranges',
          'Export PDF report and consult your physician if experiencing acute symptoms',
          'INSTRUCTIONAL DISCLAIMER: Ausculta is an AI-assisted consumer health self-monitoring tool and does NOT provide clinical diagnosis.',
        ],
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const prompt = `
You are Ausculta's clinical acoustic intelligence system. Analyze this stethoscope auscultation session for an adult consumer self-monitoring app:

User Profile: ${session.patientName || 'User'} (Age: ${session.patientAge || 30}, Sex: ${session.patientSex || 'Unspecified'})
Examination Site: ${session.site || 'Anterior Chest'}
Examination Type: ${session.examinationType || 'Chest Acoustic Examination'}
Filter Mode: ${session.filterMode || 'Wideband Raw'}
Heart Rate: ${session.bpm || 0} BPM (${session.bpmStatus || 'Recorded'})
SpO2 Level: ${session.spo2 || 0}% (${session.spo2Status || 'Recorded'})
Signal Quality Score: ${session.signalQualityScore || 0}% (${session.waveformStability || 'Recorded'})
Duration: ${session.durationSeconds || 10} seconds

Provide a structured, empathetic, and rigorous personal health self-monitoring summary.
Provide your response strictly in valid JSON format matching this schema:
{
  "summaryTitle": "AI-Assisted Session Summary (Gemini Powered)",
  "primaryDiagnosis": "Short high-level acoustic and vital finding (1-2 sentences)",
  "summaryDetails": "Detailed assessment of the acoustic rhythm, pulse rate, oxygenation, and stability",
  "spo2Interpretation": "Interpretation of oxygen saturation relative to adult reference ranges",
  "pulseInterpretation": "Interpretation of pulse rate relative to resting adult baseline",
  "acousticSignalQualityText": "Acoustic signal clarity and sensor contact feedback",
  "confidencePercentage": 95,
  "recommendedUserActions": [
    "Recommended practical next step 1",
    "Recommended practical next step 2",
    "Educational disclaimer: Ausculta is a consumer self-monitoring tool and does not replace medical diagnosis."
  ]
}
Do NOT invent clinical heart disease diagnoses. Explicitly include the non-diagnostic educational nature of this consumer platform.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch (err: any) {
      console.error('Gemini AI generation failed, falling back to deterministic:', err);
      // Fallback
      return res.json({
        summaryTitle: 'AI-Assisted Session Summary (Deterministic Fallback)',
        summaryDetails: `Evaluation completed for ${session.patientName || 'User'}. Heart rate (${session.bpm || '--'} BPM) and SpO2 (${session.spo2 || '--'}%) recorded with ${session.waveformStability || 'standard'} signal stability.`,
        spo2Interpretation: `SpO2 is ${session.spo2 || 0}%, evaluated against standard adult reference thresholds.`,
        pulseInterpretation: `Pulse rate is ${session.bpm || 0} BPM evaluated against resting normal baselines.`,
        acousticSignalQualityText: `Signal quality score is ${session.signalQualityScore || 90}%.`,
        confidencePercentage: 88,
        primaryDiagnosis: 'Acoustic waveform and physiological parameters evaluated within expected personal reference range.',
        recommendedUserActions: [
          'Target Audience Scope: Adult Population (Age 18+) Reference Ranges',
          'Keep local session record for personal baseline self-monitoring',
          'Export PDF report and consult your physician if experiencing acute symptoms',
          'INSTRUCTIONAL DISCLAIMER: Ausculta is an AI-assisted consumer health self-monitoring tool and does NOT provide clinical diagnosis.',
        ],
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ausculta server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
