import React, { useEffect, useRef } from 'react';

interface SpectrumViewProps {
  spectrum: number[];
  barColor?: string;
  backgroundColor?: string;
  className?: string;
  height?: number;
}

export const SpectrumView: React.FC<SpectrumViewProps> = ({
  spectrum,
  barColor = '#22D3EE',
  backgroundColor = '#0B0F17',
  className = '',
  height = 100,
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

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, canvasHeight);

    const barCount = 16;
    const barWidth = (width / barCount) * 0.75;
    const gap = (width / barCount) * 0.25;

    for (let i = 0; i < barCount; i++) {
      const rawValue = i < spectrum.length ? spectrum[i] : 0.05;
      const value = Math.max(0.05, Math.min(1.0, rawValue));
      const barHeight = canvasHeight * value;
      const x = i * (barWidth + gap) + gap / 2;
      const y = canvasHeight - barHeight;

      // Rounded rectangle
      ctx.fillStyle = barColor;
      ctx.globalAlpha = 0.85;

      const radius = 4;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0]);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }, [spectrum, barColor, backgroundColor, height]);

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
