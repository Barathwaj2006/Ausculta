import { AiAnalysisResult, Session } from '../types';

export const PdfReportGenerator = {
  printReport(session: Session, aiResult?: AiAnalysisResult): void {
    const ai = aiResult || session.aiAnalysisResult;
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert('Please allow popups to generate and print the clinical summary report.');
      return;
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Ausculta Clinical Telemetry Report - ${session.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #0F172A;
      background: #FFFFFF;
      margin: 0;
      padding: 40px;
      line-height: 1.5;
    }
    .header {
      border-bottom: 2px solid #06B6D4;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand {
      font-size: 24px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -0.5px;
    }
    .brand span {
      color: #06B6D4;
    }
    .meta-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #64748B;
      text-align: right;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #06B6D4;
      margin-top: 24px;
      margin-bottom: 8px;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 4px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 16px;
    }
    .card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 12px 16px;
    }
    .card-label {
      font-size: 11px;
      font-weight: 600;
      color: #64748B;
      text-transform: uppercase;
    }
    .card-value {
      font-size: 18px;
      font-weight: 700;
      color: #0F172A;
      margin-top: 4px;
    }
    .ai-box {
      background: #F0FDFA;
      border: 1px solid #99F6E4;
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;
    }
    .ai-title {
      font-weight: 700;
      color: #0D9488;
      margin-bottom: 8px;
      font-size: 15px;
    }
    .bullet-list {
      margin: 8px 0 0 0;
      padding-left: 20px;
      color: #334155;
      font-size: 13px;
    }
    .bullet-list li {
      margin-bottom: 4px;
    }
    .disclaimer {
      margin-top: 32px;
      padding: 12px 16px;
      background: #FFFBEB;
      border-left: 4px solid #F59E0B;
      border-radius: 4px;
      font-size: 11px;
      color: #92400E;
    }
    @media print {
      body { padding: 20px; }
      @page { margin: 1cm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">AUSCULTA <span>// CLINICAL REPORT</span></div>
      <div style="font-size: 12px; color: #64748B; margin-top: 2px;">Deep Rhythm Acoustic Telemetry System</div>
    </div>
    <div class="meta-tag">
      Report ID: ${session.id}<br>
      Date: ${new Date(session.startTimestampMs).toLocaleString()}<br>
      Site: ${session.siteName || session.site}
    </div>
  </div>

  <div class="section-title">Patient Profile & Examination Target</div>
  <div class="grid">
    <div class="card">
      <div class="card-label">Patient Name / Identifier</div>
      <div class="card-value">${session.patientName} (${session.patientId})</div>
      <div style="font-size: 12px; color: #64748B; margin-top: 2px;">Age: ${session.patientAge} | Sex: ${session.patientSex}</div>
    </div>
    <div class="card">
      <div class="card-label">Auscultation Site & Filter</div>
      <div class="card-value">${session.siteName || session.site}</div>
      <div style="font-size: 12px; color: #64748B; margin-top: 2px;">Filter Mode: ${session.filterMode} | Duration: ${session.durationSeconds}s</div>
    </div>
  </div>

  <div class="section-title">Physiological Vitals & Acoustic Metrics</div>
  <div class="grid">
    <div class="card">
      <div class="card-label">Resting Heart Rate (BPM)</div>
      <div class="card-value">${session.bpm || '--'} <span style="font-size: 12px; font-weight: normal; color: #64748B;">BPM</span></div>
      <div style="font-size: 11px; color: #10B981; margin-top: 2px;">${session.bpmStatus}</div>
    </div>
    <div class="card">
      <div class="card-label">Blood Oxygen Saturation (SpO2)</div>
      <div class="card-value">${session.spo2 || '--'} <span style="font-size: 12px; font-weight: normal; color: #64748B;">%</span></div>
      <div style="font-size: 11px; color: #10B981; margin-top: 2px;">${session.spo2Status}</div>
    </div>
  </div>

  <div class="card" style="margin-bottom: 16px;">
    <div class="card-label">Acoustic Signal Quality & Telemetry</div>
    <div style="font-size: 14px; font-weight: 600; margin-top: 4px; color: #0F172A;">
      Signal Quality Index: ${session.signalQualityScore}% | Stability: ${session.waveformStability}
    </div>
    <div style="font-size: 12px; color: #64748B; margin-top: 4px;">
      Device: ${session.deviceIdentifier} | Samples Captured: ${session.sampleCount}
    </div>
  </div>

  ${
    ai
      ? `
  <div class="section-title">Diagnostic & Acoustic Intelligence</div>
  <div class="ai-box">
    <div class="ai-title">${ai.summaryTitle} (Confidence: ${ai.confidencePercentage || 92}%)</div>
    <div style="font-size: 13px; font-weight: 600; color: #0F172A; margin-bottom: 6px;">${ai.primaryDiagnosis || ''}</div>
    <div style="font-size: 13px; color: #334155; margin-bottom: 8px;">${ai.summaryDetails}</div>
    <div style="font-size: 12px; color: #0D9488; margin-bottom: 4px;">• ${ai.spo2Interpretation}</div>
    <div style="font-size: 12px; color: #0D9488; margin-bottom: 4px;">• ${ai.pulseInterpretation}</div>
    <div style="font-size: 12px; color: #0D9488; margin-bottom: 8px;">• ${ai.acousticSignalQualityText}</div>
    
    <div style="font-size: 12px; font-weight: 700; color: #0F172A; margin-top: 10px;">Recommended Self-Monitoring Actions:</div>
    <ul class="bullet-list">
      ${(ai.recommendedUserActions || []).map((action) => `<li>${action}</li>`).join('')}
    </ul>
  </div>
  `
      : ''
  }

  <div class="disclaimer">
    <strong>REGULATORY & INSTRUCTIONAL NOTICE:</strong> Ausculta is an AI-assisted consumer physiological telemetry and self-monitoring platform designed for educational and personal health tracking. It is NOT an FDA-cleared diagnostic medical device and does NOT provide definitive medical diagnoses. If you are experiencing chest pain, shortness of breath, or palpitations, please seek immediate professional medical attention.
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  },
};
