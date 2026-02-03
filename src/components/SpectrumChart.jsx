import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

const PADDING = 20;

function drawChart(canvas, results, activeIndex, isDark, width) {
  if (!canvas || !results.length) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  
  canvas.width = width * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  canvas.style.height = `${canvas.offsetHeight}px`;
  
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, canvas.offsetHeight);
  const chartWidth = width - PADDING * 2;
  const chartHeight = (canvas.offsetHeight - PADDING * 3) / 2;

  const magnitudes = results.map((r) => r.magnitude);
  const phases = results.map((r) => r.phase);
  const maxMag = Math.max(...magnitudes, 1);
  const maxAbsPhase = Math.max(...phases.map((p) => Math.abs(p)), 1);
  const barWidth = Math.max(chartWidth / Math.max(results.length, 1) - 2, 4);

  ctx.fillStyle = isDark ? '#020617' : '#ffffff';
  ctx.fillRect(0, 0, width, canvas.offsetHeight);

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
    ctx.fillText(label, 0, -6);
    ctx.restore();
  };

  drawAxes(PADDING, 'Magnitude |X[k]|');
  drawAxes(PADDING * 2 + chartHeight, 'Phase');

  ctx.save();
  ctx.translate(PADDING, PADDING);
  const magGradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
  magGradient.addColorStop(0, isDark ? '#38bdf8' : '#0ea5e9');
  magGradient.addColorStop(1, isDark ? '#0ea5e9' : '#0284c7');

  results.forEach((r, i) => {
    const x = (chartWidth / results.length) * i + (chartWidth / results.length - barWidth) / 2;
    const h = (r.magnitude / maxMag) * (chartHeight - 8);
    const y = chartHeight - h;
    ctx.fillStyle = r.index === activeIndex ? '#22d3ee' : magGradient;
    ctx.globalAlpha = r.index === activeIndex ? 1 : 0.85;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, h, [3, 3, 0, 0]);
    ctx.fill();
  });
  ctx.restore();

  ctx.save();
  ctx.translate(PADDING, PADDING * 2 + chartHeight);
  const phaseGradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
  phaseGradient.addColorStop(0, isDark ? '#c084fc' : '#a855f7');
  phaseGradient.addColorStop(0.5, isDark ? '#a855f7' : '#8b5cf6');
  phaseGradient.addColorStop(1, isDark ? '#8b5cf6' : '#7c3aed');

  results.forEach((r, i) => {
    const x = (chartWidth / results.length) * i + (chartWidth / results.length - barWidth) / 2;
    const normalized = r.phase / maxAbsPhase;
    const h = normalized * (chartHeight - 8);
    const y = h < 0 ? chartHeight : chartHeight - h;
    ctx.fillStyle = r.index === activeIndex ? '#d8b4fe' : phaseGradient;
    ctx.globalAlpha = r.index === activeIndex ? 1 : 0.8;
    ctx.beginPath();
    ctx.roundRect(x, Math.min(y, chartHeight), barWidth, Math.abs(h), [0, 0, 3, 3]);
    ctx.fill();
  });
  ctx.restore();
}

export default function SpectrumChart({ results, operation, activeIndex, setActiveIndex }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [containerWidth, setContainerWidth] = useState(300);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (canvasRef.current && results.length) {
      drawChart(canvasRef.current, results, activeIndex, isDark, containerWidth);
    }
  }, [results, activeIndex, isDark, containerWidth]);

  const handleMove = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas || !results.length) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const x = clientX - rect.left;
    const chartWidth = containerWidth - PADDING * 2;

    if (x < PADDING || x > PADDING + chartWidth) {
      setHoverInfo(null);
      return;
    }

    const index = Math.floor(((x - PADDING) / chartWidth) * results.length);
    const clampedIndex = Math.min(Math.max(index, 0), results.length - 1);
    const r = results[clampedIndex];

    setHoverInfo({
      x: clientX,
      y: event.touches ? event.touches[0].clientY : event.clientY,
      row: r,
    });
  }, [results, containerWidth]);

  const handleLeave = useCallback(() => setHoverInfo(null), []);

  const valueLabel = operation === 'dft' || operation === 'fft' ? 'X[k]' : 'x[n]';

  const chartHeight = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640 ? 160 : window.innerWidth < 1024 ? 192 : 224;
    }
    return 180;
  }, []);

  return (
    <div className="chart-card p-3 sm:p-4 relative" ref={containerRef}>
      <div className="chart-header">
        <div>
          <h2 className="chart-title">Spectrum Visualization</h2>
          <p className="chart-subtitle">Magnitude and phase response</p>
        </div>
        <div className="chart-legend">
          <span className="legend-item bg-sky-50 dark:bg-sky-900/20">
            <span className="legend-dot bg-sky-500" />
            <span className="legend-text text-sky-700 dark:text-sky-300">|X|</span>
          </span>
          <span className="legend-item bg-purple-50 dark:bg-purple-900/20">
            <span className="legend-dot bg-purple-500" />
            <span className="legend-text text-purple-700 dark:text-purple-300">∠X</span>
          </span>
        </div>
      </div>

      <div className="chart-wrapper" style={{ height: `${chartHeight}px` }}>
        <canvas
          ref={canvasRef}
          className="chart-canvas"
          style={{ height: `${chartHeight}px`, width: '100%' }}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          onTouchMove={handleMove}
          onTouchEnd={handleLeave}
        />
        <p className="chart-caption">Top: Magnitude | Bottom: Phase (degrees)</p>
      </div>

      {hoverInfo && (
        <div
          className="chart-tooltip shadow-xl"
          style={{ 
            left: Math.min(hoverInfo.x + 10, window.innerWidth - 150), 
            top: Math.min(hoverInfo.y + 10, window.innerHeight - 100) 
          }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[0.7rem] font-semibold text-sky-300">{valueLabel}</span>
            <span className="rounded-full bg-slate-700 px-1.5 py-0.5 text-xs font-bold text-white">
              {hoverInfo.row.index}
            </span>
          </div>
          <div className="space-y-0.5 font-mono text-[0.65rem] sm:text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Re:</span>
              <span className="text-slate-200">{hoverInfo.row.re.toFixed(4)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Im:</span>
              <span className="text-slate-200">{hoverInfo.row.im.toFixed(4)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-emerald-400">|X|:</span>
              <span className="text-emerald-300">{hoverInfo.row.magnitude.toFixed(4)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-purple-400">∠X:</span>
              <span className="text-purple-300">{hoverInfo.row.phase.toFixed(2)}°</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
