import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Card } from './ui/Card';

// MATLAB-style color palette with enhanced colors
const COLORS = {
  real: '#2563eb',        // Blue
  realFill: 'rgba(37, 99, 235, 0.15)',
  realFillDark: 'rgba(37, 99, 235, 0.25)',
  imaginary: '#dc2626',   // Red
  imaginaryFill: 'rgba(220, 38, 38, 0.15)',
  imaginaryFillDark: 'rgba(220, 38, 38, 0.25)',
  magnitude: '#16a34a',   // Green
  magnitudeFill: 'rgba(22, 163, 74, 0.1)',
  phase: '#9333ea',       // Purple for phase
  grid: '#e2e8f0',
  gridDark: '#334155',
  axis: '#475569',
  text: '#64748b',
  textDark: '#94a3b8',
  zeroLine: '#94a3b8',
  active: '#f59e0b',      // Amber for active point
  line: '#6366f1',        // Indigo for line connection
  stem: '#0891b2',        // Cyan for stem
};

// Chart display modes
const DISPLAY_MODES = {
  STEM: 'stem',
  LINE: 'line',
  COMBINED: 'combined',
  STEM_LINE: 'stem_line',
};

// Chart titles
const CHART_TITLES = {
  magnitude: 'Magnitude Spectrum |X[n]|',
  real: 'Real Part Re{X[n]}',
  imaginary: 'Imaginary Part Im{X[n]}',
  phase: 'Phase Spectrum ∠X[n]',
  combined: 'Complex Spectrum (Real & Imaginary)',
  stem_line: 'Stem with Line Connection',
};

// Operation-specific chart configurations
const OPERATION_CONFIGS = {
  dft: { showCombined: true, showPhase: true, defaultMode: DISPLAY_MODES.STEM },
  idft: { showCombined: true, showPhase: true, defaultMode: DISPLAY_MODES.STEM },
  fft: { showCombined: true, showPhase: true, defaultMode: DISPLAY_MODES.STEM },
  twiddle: { showCombined: false, showPhase: true, defaultMode: DISPLAY_MODES.STEM },
  circularConv: { showCombined: false, showPhase: false, defaultMode: DISPLAY_MODES.STEM_LINE },
  linearConv: { showCombined: false, showPhase: false, defaultMode: DISPLAY_MODES.STEM_LINE },
  overlapSave: { showCombined: false, showPhase: false, defaultMode: DISPLAY_MODES.STEM_LINE },
  overlapAdd: { showCombined: false, showPhase: false, defaultMode: DISPLAY_MODES.STEM_LINE },
};

// Drawing utilities for MATLAB-style chart
const ChartRenderer = {
  // Draw MATLAB-style grid
  drawGrid(ctx, width, height, padding, chartWidth, chartHeight, isDark) {
    const gridColor = isDark ? COLORS.gridDark : COLORS.grid;
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    ctx.beginPath();

    // Horizontal grid lines
    const numHLines = 8;
    for (let i = 0; i <= numHLines; i++) {
      const y = padding.top + (chartHeight / numHLines) * i;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
    }

    // Vertical grid lines
    const numVLines = Math.min(12, 8);
    const vLineStep = Math.ceil(8 / numVLines);
    for (let i = 0; i <= 8; i += vLineStep) {
      const x = padding.left + (chartWidth / 8) * i;
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
    }
    ctx.stroke();
  },

  // Draw zero line
  drawZeroLine(ctx, zeroY, padding, width, isDark) {
    ctx.strokeStyle = isDark ? COLORS.textDark : COLORS.zeroLine;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(padding.left, zeroY);
    ctx.lineTo(width - padding.right, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);
  },

  // Draw MATLAB-style stem marker
  drawStem(ctx, x, y, zeroY, color, fillColor, isActive, radius = 5) {
    // Draw stem line
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, zeroY);
    ctx.lineTo(x, y);
    ctx.stroke();

    // Draw filled area for stem base (MATLAB style)
    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.moveTo(x - 3, zeroY);
      ctx.lineTo(x, y);
      ctx.lineTo(x + 3, zeroY);
      ctx.closePath();
      ctx.fill();
    }

    // Draw marker circle
    ctx.fillStyle = isActive ? COLORS.active : '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, isActive ? 7 : radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Active point indicator
    if (isActive) {
      ctx.fillStyle = COLORS.active;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  },

  // Draw line connection (MATLAB style)
  drawLine(ctx, values, scaleX, scaleY, color, lineWidth = 2) {
    if (values.length < 2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    const firstX = scaleX(0);
    const firstY = scaleY(values[0]);
    ctx.moveTo(firstX, firstY);

    for (let i = 1; i < values.length; i++) {
      const x = scaleX(i);
      const y = scaleY(values[i]);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  },

  // Draw filled area under curve (MATLAB style)
  drawFilledArea(ctx, values, scaleX, scaleY, zeroY, fillColor) {
    if (values.length < 2) return;

    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.moveTo(scaleX(0), zeroY);

    for (let i = 0; i < values.length; i++) {
      ctx.lineTo(scaleX(i), scaleY(values[i]));
    }

    ctx.lineTo(scaleX(values.length - 1), zeroY);
    ctx.closePath();
    ctx.fill();
  },

  // Draw axes
  drawAxes(ctx, width, height, padding) {
    ctx.strokeStyle = COLORS.axis;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();
  },

  // Draw axis labels
  drawLabels(ctx, width, height, padding, chartWidth, chartHeight, yRange, chartType, results, displayMode, isDark) {
    // X-axis labels
    ctx.fillStyle = isDark ? COLORS.textDark : COLORS.text;
    ctx.font = '12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const numLabels = Math.min(8, results.length);
    const labelStep = Math.ceil(results.length / numLabels);

    for (let i = 0; i < results.length; i += labelStep) {
      const x = padding.left + (chartWidth / (results.length - 1 || 1)) * i;
      ctx.fillText(results[i].index.toString(), x, height - padding.bottom + 10);
    }

    // X-axis title
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.fillText('Index (n)', padding.left + chartWidth / 2, height - 15);

    // Y-axis labels
    ctx.font = '11px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const numYLabels = 6;
    for (let i = 0; i <= numYLabels; i++) {
      const y = padding.top + (chartHeight / numYLabels) * i;
      const value = yRange - (yRange / numYLabels) * i;
      ctx.fillText(value.toFixed(2), padding.left - 10, y);
    }

    // Y-axis title
    ctx.save();
    ctx.translate(18, padding.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.font = 'bold 13px "Courier New", monospace';

    let yLabel;
    if (chartType === 'magnitude') {
      yLabel = '|X[n]|';
    } else if (chartType === 'real') {
      yLabel = 'Re{X[n]}';
    } else if (chartType === 'imaginary') {
      yLabel = 'Im{X[n]}';
    } else if (chartType === 'phase') {
      yLabel = '∠X[n] (rad)';
    } else if (displayMode === DISPLAY_MODES.COMBINED) {
      yLabel = 'Real / Imaginary';
    } else {
      yLabel = 'Value';
    }
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();
  },

  // Draw chart title
  drawTitle(ctx, chartType, displayMode, padding, width, chartWidth) {
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = 'center';
    ctx.fillText(CHART_TITLES[chartType] || CHART_TITLES.magnitude, padding.left + chartWidth / 2, 18);
  }
};

// Custom hook for canvas chart
function useCanvasChart(canvasRef, containerRef, results, activeIndex, chartType, displayMode, isDark) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !results || results.length === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 40, right: 40, bottom: 60, left: 70 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear canvas with background
    ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Get values based on chart type
    const getValues = (type) => results.map(d => {
      switch (type) {
        case 'real': return d.re || 0;
        case 'imaginary': return d.im || 0;
        case 'phase': return d.phase || 0;
        default: return d.magnitude || Math.sqrt((d.re || 0) ** 2 + (d.im || 0) ** 2);
      }
    });

    const realValues = chartType === 'combined' || displayMode === DISPLAY_MODES.COMBINED 
      ? results.map(d => d.re || 0) 
      : null;
    const imagValues = chartType === 'combined' || displayMode === DISPLAY_MODES.COMBINED 
      ? results.map(d => d.im || 0) 
      : null;
    const phaseValues = chartType === 'phase' ? getValues('phase') : null;
    const values = chartType !== 'combined' && chartType !== 'phase' ? getValues(chartType) : null;

    // Find min and max values for scaling
    let allValues;
    if (displayMode === DISPLAY_MODES.COMBINED || chartType === 'combined') {
      allValues = [...(realValues || []), ...(imagValues || [])];
    } else if (chartType === 'phase') {
      allValues = phaseValues || [];
    } else {
      allValues = values || [];
    }

    const maxVal = Math.max(...allValues.map(Math.abs), 0.001);
    const minVal = Math.min(...allValues, 0);
    const maxAbs = Math.max(maxVal, Math.abs(minVal), 0.001);
    const yRange = maxAbs * 1.3 || 1;

    // Scale functions
    const scaleX = (index) => padding.left + (index / (results.length - 1 || 1)) * chartWidth;
    const scaleY = (value) => padding.top + chartHeight / 2 - (value / yRange) * (chartHeight / 2);

    // Draw grid
    ChartRenderer.drawGrid(ctx, width, height, padding, chartWidth, chartHeight, isDark);

    // Draw zero line
    const zeroY = scaleY(0);
    if (minVal < 0 && maxVal > 0) {
      ChartRenderer.drawZeroLine(ctx, zeroY, padding, width, isDark);
    }

    // Draw based on display mode
    const isActivePoint = (idx) => activeIndex === results[idx]?.index;

    if (displayMode === DISPLAY_MODES.LINE) {
      // Line-only mode with filled area
      ChartRenderer.drawFilledArea(ctx, values, scaleX, scaleY, zeroY, isDark ? COLORS.magnitudeFillDark : COLORS.magnitudeFill);
      ChartRenderer.drawLine(ctx, values, scaleX, scaleY, COLORS.magnitude, 2);
      // Draw markers
      for (let i = 0; i < values.length; i++) {
        ChartRenderer.drawStem(ctx, scaleX(i), scaleY(values[i]), zeroY, COLORS.magnitude, null, isActivePoint(i), 4);
      }
    } 
    else if (displayMode === DISPLAY_MODES.STEM_LINE) {
      // Stem with line connection (MATLAB default)
      ChartRenderer.drawLine(ctx, values, scaleX, scaleY, COLORS.line, 1.5);
      for (let i = 0; i < values.length; i++) {
        ChartRenderer.drawStem(ctx, scaleX(i), scaleY(values[i]), zeroY, COLORS.stem, null, isActivePoint(i), 5);
      }
    } 
    else if (displayMode === DISPLAY_MODES.COMBINED || chartType === 'combined') {
      // Combined real and imaginary (stem style)
      // Draw imaginary (negative values) first
      for (let i = 0; i < results.length; i++) {
        ChartRenderer.drawStem(ctx, scaleX(i), scaleY(imagValues[i]), zeroY, COLORS.imaginary, isDark ? COLORS.imaginaryFillDark : COLORS.imaginaryFill, isActivePoint(i), 5);
      }
      // Draw real (positive values) on top
      for (let i = 0; i < results.length; i++) {
        ChartRenderer.drawStem(ctx, scaleX(i), scaleY(realValues[i]), zeroY, COLORS.real, isDark ? COLORS.realFillDark : COLORS.realFill, isActivePoint(i), 5);
      }
    } 
    else if (chartType === 'phase') {
      // Phase spectrum
      ChartRenderer.drawLine(ctx, phaseValues, scaleX, scaleY, COLORS.phase, 2);
      for (let i = 0; i < phaseValues.length; i++) {
        ChartRenderer.drawStem(ctx, scaleX(i), scaleY(phaseValues[i]), zeroY, COLORS.phase, null, isActivePoint(i), 5);
      }
    } 
    else {
      // Stem mode (default MATLAB style)
      ChartRenderer.drawFilledArea(ctx, values, scaleX, scaleY, zeroY, isDark ? COLORS.magnitudeFillDark : COLORS.magnitudeFill);
      for (let i = 0; i < values.length; i++) {
        ChartRenderer.drawStem(ctx, scaleX(i), scaleY(values[i]), zeroY, COLORS.magnitude, null, isActivePoint(i), 6);
      }
    }

    // Draw axes
    ChartRenderer.drawAxes(ctx, width, height, padding);

    // Draw labels
    ChartRenderer.drawLabels(ctx, width, height, padding, chartWidth, chartHeight, yRange, chartType, results, displayMode, isDark);

    // Draw title
    ChartRenderer.drawTitle(ctx, chartType, displayMode, padding, width, chartWidth);

  }, [results, activeIndex, chartType, displayMode, isDark]);
}

export default function SpectrumChart({ results, activeIndex, setActiveIndex, operation = 'dft' }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [chartType, setChartType] = useState('magnitude');
  const [displayMode, setDisplayMode] = useState(DISPLAY_MODES.STEM);
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

  // Get operation-specific configuration
  const opConfig = useMemo(() => OPERATION_CONFIGS[operation] || OPERATION_CONFIGS.dft, [operation]);

  // Set default mode when operation changes
  useEffect(() => {
    setDisplayMode(opConfig.defaultMode);
  }, [operation, opConfig]);

  // Use custom hook for canvas drawing
  useCanvasChart(canvasRef, containerRef, results, activeIndex, chartType, displayMode, isDark);

  // Memoized click handler
  const handleCanvasClick = useCallback((event) => {
    if (!results || results.length === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const padding = { left: 70, right: 40 };
    const chartWidth = rect.width - padding.left - padding.right;

    const x = event.clientX - rect.left;
    const relativeX = x - padding.left;

    if (relativeX >= 0 && relativeX <= chartWidth) {
      const clickedIndex = Math.round((relativeX / chartWidth) * (results.length - 1));
      if (clickedIndex >= 0 && clickedIndex < results.length) {
        setActiveIndex(results[clickedIndex].index);
      }
    }
  }, [results, setActiveIndex]);

  // Chart type buttons configuration
  const chartTypeButtons = useMemo(() => {
    const buttons = [
      { type: 'magnitude', label: '|X|', color: 'emerald', title: 'Magnitude' },
      { type: 'real', label: 'Re', color: 'blue', title: 'Real Part' },
      { type: 'imaginary', label: 'Im', color: 'red', title: 'Imaginary Part' },
    ];
    if (opConfig.showPhase) {
      buttons.push({ type: 'phase', label: '∠', color: 'purple', title: 'Phase' });
    }
    buttons.push({ type: 'combined', label: 'Both', color: 'violet', title: 'Combined View' });
    return buttons;
  }, [opConfig]);

  // Display mode buttons configuration
  const displayModeButtons = useMemo(() => [
    { mode: DISPLAY_MODES.STEM, label: 'Stem', icon: '│', title: 'Stem plot' },
    { mode: DISPLAY_MODES.STEM_LINE, label: 'Stem+Line', icon: '╮', title: 'Stem with line' },
    { mode: DISPLAY_MODES.LINE, label: 'Line', icon: '─', title: 'Line only' },
  ], []);

  // Helper to get color class
  const getColorClass = (baseColor, isActive) => {
    const colorMap = {
      emerald: 'emerald-500',
      blue: 'blue-500',
      red: 'red-500',
      purple: 'purple-500',
      violet: 'violet-500',
    };
    const color = colorMap[baseColor] || 'emerald-500';
    return isActive 
      ? `bg-${color} text-white shadow-sm` 
      : `text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100`;
  };

  if (!results || results.length === 0) {
    return (
      <Card className="chart-card p-4">
        <div className="flex items-center justify-center h-[320px] text-slate-400">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm">Enter data to visualize spectrum</p>
            <p className="text-xs mt-1 text-slate-500">Supports DFT, FFT, and convolution results</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="chart-card p-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            MATLAB-Style Visualization
          </span>
          <span className="text-xs text-slate-500">
            {results.length} points • {results.length === 1 ? 'sample' : 'samples'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Chart type selector */}
          <div
            className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5"
            role="group"
            aria-label="Chart type selection"
          >
            {chartTypeButtons.map(({ type, label, color, title }) => (
              <button
                key={type}
                type="button"
                onClick={() => setChartType(type)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${getColorClass(color, chartType === type)}`}
                aria-pressed={chartType === type}
                title={title}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Display mode selector */}
          <div
            className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5"
            role="group"
            aria-label="Display mode selection"
          >
            {displayModeButtons.map(({ mode, label, icon, title }) => (
              <button
                key={mode}
                type="button"
                onClick={() => setDisplayMode(mode)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                  displayMode === mode
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                aria-pressed={displayMode === mode}
                title={title}
              >
                <span aria-hidden="true">{icon}</span>
                <span className="hidden xs:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="w-full h-[300px] cursor-crosshair"
        onClick={handleCanvasClick}
        role="img"
        aria-label={`${CHART_TITLES[chartType] || CHART_TITLES.magnitude} chart`}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs" role="legend" aria-label="Chart legend">
        {(chartType === 'combined' || displayMode === DISPLAY_MODES.COMBINED) ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-blue-500 rounded" aria-hidden="true" />
              <span className="text-slate-600 dark:text-slate-300">Real Part</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-red-500 rounded" aria-hidden="true" />
              <span className="text-slate-600 dark:text-slate-300">Imaginary Part</span>
            </div>
          </>
        ) : chartType === 'phase' ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-purple-500" aria-hidden="true" />
              <span className="text-slate-600 dark:text-slate-300">Phase</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-emerald-500" aria-hidden="true" />
              <span className="text-slate-600 dark:text-slate-300">Magnitude</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-indigo-500 rounded" aria-hidden="true" />
              <span className="text-slate-600 dark:text-slate-300">
                {displayMode === DISPLAY_MODES.LINE ? 'Connected Line' : 'Stem Base'}
              </span>
            </div>
          </>
        )}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />
          <span className="text-slate-600 dark:text-slate-300">Active Point</span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 text-center text-xs text-slate-400">
        Click on the chart to select a specific frequency bin
      </div>
    </Card>
  );
}
