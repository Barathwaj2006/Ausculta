import React, { useEffect, useRef } from 'react';

interface WaveformViewProps {
  waveform: number[];
  lineColor?: string;
  backgroundColor?: string;
  gridColor?: string;
  className?: string;
  height?: number;
}

export const WaveformView: React.FC<WaveformViewProps> = ({
  waveform,
  lineColor = '#22D3EE',
  backgroundColor = '#0B0F17',
  gridColor = 'rgba(51, 65, 85, 0.4)',
  className = '',
  height = 180,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight || height;

    canvas.width = width * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, canvasHeight);

    // Grid lines (8 cols, 4 rows)
    const gridCols = 8;
    const gridRows = 4;
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    for (let i = 1; i < gridCols; i++) {
      const x = width * (i / gridCols);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }

    for (let i = 1; i < gridRows; i++) {
      const y = canvasHeight * (i / gridRows);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Flatline if empty
    if (!waveform || waveform.length === 0) {
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvasHeight / 2);
      ctx.lineTo(width, canvasHeight / 2);
      ctx.stroke();
      return;
    }

    // Oscilloscope path
    const stepX = width / Math.max(1, waveform.length - 1);
    const centerY = canvasHeight / 2;
    const maxAmplitude = 1000;

    // Glow layer
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    for (let i = 0; i < waveform.length; i++) {
      const sample = waveform[i];
      const normalizedY = Math.max(-1.0, Math.min(1.0, sample / maxAmplitude));
      const y = centerY - normalizedY * (canvasHeight / 2.2);
      const x = i * stepX;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Sharp foreground line
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    for (let i = 0; i < waveform.length; i++) {
      const sample = waveform[i];
      const normalizedY = Math.max(-1.0, Math.min(1.0, sample / maxAmplitude));
      const y = centerY - normalizedY * (canvasHeight / 2.2);
      const x = i * stepX;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [waveform, lineColor, backgroundColor, gridColor, height]);

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border border-[#334155] ${className}`}
      style={{ height: `${height}px` }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ height: `${height}px` }}
      />
    </div>
  );
};
