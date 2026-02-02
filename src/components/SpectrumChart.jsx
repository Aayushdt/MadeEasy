import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Card } from './ui/Card';

const PADDING = 28;

function drawChart(canvas, results, activeIndex, isDark) {
  if (!canvas || !results.length) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width * dpr;
  const height = rect.height * dpr;

  canvas.width = width;
  canvas.height = height;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, rect.width, rect.height);
  const chartWidth = rect.width - PADDING * 2;
  const chartHeight = (rect.height - PADDING * 3) / 2;

  // Calculate max values
  const magnitudes = results.map((r) => r.magnitude);
  const phases = results.map((r) => r.phase);
  const maxMag = Math.max(...magnitudes, 1);
  const maxAbsPhase = Math.max(...phases.map((p) => Math.abs(p)), 1);
  const barWidth = chartWidth / Math.max(results.length, 1) - 4;

  // Background
  ctx.fillStyle = isDark ? '#020617' : '#ffffff';
  ctx.fillRect(0, 0, rect.width, rect.height);

  // Helper: draw axes
  const drawAxes = (offsetY, label) => {
    ctx.save();
    ctx.translate(PADDING, offsetY);
    ctx.strokeStyle = isDark ? '#1f2937' : '#d1d5db';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, chartHeight);
    ctx.lineTo(chartWidth, chartHeight);
    ctx.stroke();
    ctx.fillStyle = isDark ? '#9ca3af' : '#4b5563';
    ctx.font = '10px system-ui';
    ctx.fillText(label, 0, -8);
    ctx.restore();
  };

  drawAxes(PADDING, 'Magnitude |X[k]|');
  drawAxes(PADDING * 2 + chartHeight, 'Phase ∠X[k] (°)');

  // Draw magnitude bars
  ctx.save();
  ctx.translate(PADDING, PADDING);
  const magGradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
  magGradient.addColorStop(0, isDark ? '#38bdf8' : '#0ea5e9');
  magGradient.addColorStop(1, isDark ? '#0ea5e9' : '#0284c7');

  results.forEach((r, i) => {
    const x = (chartWidth / results.length) * i + 2;
    const h = (r.magnitude / maxMag) * (chartHeight - 10);
    const y = chartHeight - h;
    ctx.fillStyle = r.index === activeIndex ? '#22d3ee' : magGradient;
    ctx.globalAlpha = r.index === activeIndex ? 1 : 0.85;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, h, [4, 4, 0, 0]);
    ctx.fill();
  });
  ctx.restore();

  // Draw phase bars
  ctx.save();
  ctx.translate(PADDING, PADDING * 2 + chartHeight);
  const phaseGradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
  phaseGradient.addColorStop(0, isDark ? '#c084fc' : '#a855f7');
  phaseGradient.addColorStop(0.5, isDark ? '#a855f7' : '#8b5cf6');
  phaseGradient.addColorStop(1, isDark ? '#8b5cf6' : '#7c3aed');

  results.forEach((r, i) => {
    const x = (chartWidth / results.length) * i + 2;
    const normalized = r.phase / maxAbsPhase;
    const h = normalized * (chartHeight - 10);
    const y = h < 0 ? chartHeight : chartHeight - h;
    ctx.fillStyle = r.index === activeIndex ? '#d8b4fe' : phaseGradient;
    ctx.globalAlpha = r.index === activeIndex ? 1 : 0.8;
    ctx.beginPath();
    ctx.roundRect(x, Math.min(y, chartHeight), barWidth, Math.abs(h), [0, 0, 4, 4]);
    ctx.fill();
  });
  ctx.restore();
}

export default function SpectrumChart({ results, operation, activeIndex, setActiveIndex }) {
  const canvasRef = useRef(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [isDark, setIsDark] = useState(false);

  // Detect theme
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Draw chart
  useEffect(() => {
    drawChart(canvasRef.current, results, activeIndex, isDark);
  }, [results, activeIndex, isDark]);

  // Handle mouse/touch move
  const handleMove = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas || !results.length) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const chartWidth = rect.width - PADDING * 2;

    if (x < PADDING || x > PADDING + chartWidth) {
      setHoverInfo(null);
      return;
    }

    const index = Math.floor(((x - PADDING) / chartWidth) * results.length);
    const clampedIndex = Math.min(Math.max(index, 0), results.length - 1);
    const r = results[clampedIndex];

    setHoverInfo({
      x: event.clientX,
      y: event.clientY,
      row: r,
    });
  }, [results]);

  const handleLeave = useCallback(() => setHoverInfo(null), []);

  const valueLabel = operation === 'dft' ? 'X[k]' : 'x[n]';

  return (
    <Card className="relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
            Spectrum Visualization
          </h2>
          <p className="text-[0.7rem] text-slate-500 dark:text-slate-400">
            Magnitude and phase response
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-lg bg-sky-50 dark:bg-sky-900/20 px-2 py-1">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            <span className="text-[0.65rem] font-medium text-sky-700 dark:text-sky-300">|X|</span>
          </span>
          <span className="flex items-center gap-1 rounded-lg bg-purple-50 dark:bg-purple-900/20 px-2 py-1">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
            <span className="text-[0.65rem] font-medium text-purple-700 dark:text-purple-300">∠X</span>
          </span>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-48 sm:h-56 lg:h-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/80 cursor-crosshair"
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          onTouchMove={(e) => handleMove(e.touches[0])}
          onTouchEnd={handleLeave}
        />
        <p className="mt-2 text-[0.68rem] sm:text-xs text-slate-500 dark:text-slate-400 text-center">
          Top: Magnitude &nbsp; | &nbsp; Bottom: Phase (degrees)
        </p>
      </div>

      {hoverInfo && (
        <div
          className="chart-tooltip shadow-xl"
          style={{ left: hoverInfo.x + 12, top: hoverInfo.y + 12 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[0.7rem] font-semibold text-sky-300">{valueLabel}</span>
            <span className="rounded-full bg-slate-700 px-1.5 py-0.5 text-xs font-bold text-white">
              {hoverInfo.row.index}
            </span>
          </div>
          <div className="space-y-1 font-mono text-[0.65rem] sm:text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Re:</span>
              <span className="text-slate-200">{hoverInfo.row.re.toFixed(4)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Im:</span>
              <span className="text-slate-200">{hoverInfo.row.im.toFixed(4)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-emerald-400">|X|:</span>
              <span className="text-emerald-300">{hoverInfo.row.magnitude.toFixed(4)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-purple-400">∠X:</span>
              <span className="text-purple-300">{hoverInfo.row.phase.toFixed(2)}°</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
