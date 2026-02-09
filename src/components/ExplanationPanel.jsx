import React, { useState } from 'react';
import { OPERATIONS } from '../config/operations';

export default function ExplanationPanel({ operation, activeIndex }) {
  const [open, setOpen] = useState(true);

  const isDFT = operation === 'dft';
  const isIDFT = operation === 'idft';
  const isFFT = operation === 'fft';
  const isTwiddle = operation === 'twiddle';
  const isCircularConv = operation === 'circularConv';
  const isLinearConv = operation === 'linearConv';
  const isOverlapSave = operation === 'overlapSave';
  const isOverlapAdd = operation === 'overlapAdd';

  const getThemeClass = () => {
    if (isDFT || isFFT) return 'dft';
    if (isIDFT) return 'idft';
    if (isTwiddle) return 'twiddle';
    if (isCircularConv || isLinearConv || isOverlapSave || isOverlapAdd) return 'conv';
    return 'dft';
  };

  const theme = getThemeClass();

  // Linear Convolution explanation
  if (isLinearConv) {
    return (
      <aside className="explanation-panel p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="explanation-header w-full"
        >
          <div className="flex items-center gap-3">
            <div className="explanation-header-icon conv">
              <span className="text-xl">📐</span>
            </div>
            <div>
              <h2 className="explanation-title">Linear Convolution</h2>
              <p className="explanation-subtitle">Convolution of finite sequences</p>
            </div>
          </div>
          <span className={`toggle-hide ${theme}`}>
            {open ? 'Hide ▲' : 'Show ▼'}
          </span>
        </button>

        {open && (
          <div className="explanation-content">
            <div className="formula-card conv">
              <p className="formula-text">
                y[n] = Σ<sub>k=0</sub><sup>L-1</sup> x[k] · h[n−k]
              </p>
              <p className="formula-subtitle">
                Result length: N = L + M - 1
              </p>
            </div>

            <div className="mt-4">
              <p className={`section-title ${theme}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Key Concepts
              </p>
              <ul className="section-list">
                <li>
                  <strong>Linear</strong> — No wrapping, output length is L+M-1
                </li>
                <li>
                  <strong>Direct Computation</strong> — O(NM) complexity for two sequences
                </li>
                <li>
                  <strong>No Zero Padding</strong> — Unlike circular convolution
                </li>
                <li>
                  <strong>Applications</strong> — FIR filtering, system response
                </li>
              </ul>
            </div>

            <div className="mt-4 step-list">
              <p className={`section-title ${theme}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                How to Calculate
              </p>
              <div className="step-item">
                <span className="step-number">1</span>
                <span className="step-content">
                  Let L = length of x[n], M = length of h[n]
                </span>
              </div>
              <div className="step-item">
                <span className="step-number">2</span>
                <span className="step-content">
                  Output length N = L + M - 1
                </span>
              </div>
              <div className="step-item">
                <span className="step-number">3</span>
                <span className="step-content">
                  For each output n, sum <strong>x[k] × h[n-k]</strong>
                </span>
              </div>
              <div className="step-item">
                <span className="step-number">4</span>
                <span className="step-content">
                  Only include terms where indices are in valid range
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>
    );
  }

  // Overlap-Save explanation
  if (isOverlapSave) {
    return (
      <aside className="explanation-panel p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="explanation-header w-full"
        >
          <div className="flex items-center gap-3">
            <div className="explanation-header-icon conv">
              <span className="text-xl">✂️</span>
            </div>
            <div>
              <h2 className="explanation-title">Overlap-Save Method</h2>
              <p className="explanation-subtitle">Block convolution using FFT</p>
            </div>
          </div>
          <span className={`toggle-hide ${theme}`}>
            {open ? 'Hide ▲' : 'Show ▼'}
          </span>
        </button>

        {open && (
          <div className="explanation-content">
            <div className="formula-card conv">
              <p className="formula-text">
                Block Size: N ≥ M
              </p>
              <p className="formula-subtitle">
                M new samples per block (M = N - M + 1)
              </p>
            </div>

            <div className="mt-4">
              <p className={`section-title ${theme}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                Key Concepts
              </p>
              <ul className="section-list">
                <li>
                  <strong>Input Blocking</strong> — Break input into overlapping blocks
                </li>
                <li>
                  <strong>FFT Computation</strong> — Use FFT for each block
                </li>
                <li>
                  <strong>Discard Aliasing</strong> — Save only valid output samples
                </li>
                <li>
                  <strong>Efficiency</strong> — O(N log N) per block
                </li>
              </ul>
            </div>

            <div className="mt-4 step-list">
              <p className={`section-title ${theme}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Algorithm Steps
              </p>
              <div className="step-item">
                <span className="step-number">1</span>
                <span className="step-content">
                  Pad impulse response h[n] with zeros to length N
                </span>
              </div>
              <div className="step-item">
                <span className="step-number">2</span>
                <span className="step-content">
                  Compute FFT of h[n] → H[k]
                </span>
              </div>
              <div className="step-item">
                <span className="step-number">3</span>
                <span className="step-content">
                  For each block: FFT → Multiply with H[k] → IFFT
                </span>
              </div>
              <div className="step-item">
                <span className="step-number">4</span>
                <span className="step-content">
                  Discard first M-1 samples (aliased), save rest
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>
    );
  }

  // Overlap-Add explanation
  if (isOverlapAdd) {
    return (
      <aside className="explanation-panel p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="explanation-header w-full"
        >
          <div className="flex items-center gap-3">
            <div className="explanation-header-icon conv">
              <span className="text-xl">➕</span>
            </div>
            <div>
              <h2 className="explanation-title">Overlap-Add Method</h2>
              <p className="explanation-subtitle">Block convolution using FFT</p>
            </div>
          </div>
          <span className={`toggle-hide ${theme}`}>
            {open ? 'Hide ▲' : 'Show ▼'}
          </span>
        </button>

        {open && (
          <div className="explanation-content">
            <div className="formula-card conv">
              <p className="formula-text">
                Block Size: N ≥ M
              </p>
              <p className="formula-subtitle">
                M new samples per block (M = N - M + 1)
              </p>
            </div>

            <div className="mt-4">
              <p className={`section-title ${theme}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                Key Concepts
              </p>
              <ul className="section-list">
                <li>
                  <strong>Input Blocking</strong> — Break input into non-overlapping blocks
                </li>
                <li>
                  <strong>Zero Padding</strong> — Pad each block to length N
                </li>
                <li>
                  <strong>Add Overlaps</strong> — Overlap and add output segments
                </li>
                <li>
                  <strong>Efficiency</strong> — O(N log N) per block
                </li>
              </ul>
            </div>

            <div className="mt-4 step-list">
              <p className={`section-title ${theme}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Algorithm Steps
              </p>
              <div className="step-item">
                <span className="step-number">1</span>
                <span className="step-content">
                  Pad impulse response h[n] with zeros to length N
                </span>
              </div>
              <div className="step-item">
                <span className="step-number">2</span>
                <span className="step-content">
                  Compute FFT of h[n] → H[k]
                </span>
              </div>
              <div className="step-item">
                <span className="step-number">3</span>
                <span className="step-content">
                  For each block: Pad → FFT → Multiply with H[k] → IFFT
                </span>
              </div>
              <div className="step-item">
                <span className="step-number">4</span>
                <span className="step-content">
                  Add overlapping output segments together
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>
    );
  }

  // Twiddle Factor explanation
  if (isTwiddle) {
    return (
      <aside className="explanation-panel p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="explanation-header w-full"
        >
          <div className="flex items-center gap-3">
            <div className="explanation-header-icon twiddle">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="explanation-title">Twiddle Factor Formula</h2>
              <p className="explanation-subtitle">Understanding W<sub>N</sub><sup>kn</sup></p>
            </div>
          </div>
          <span className={`toggle-hide ${theme}`}>
            {open ? 'Hide ▲' : 'Show ▼'}
          </span>
        </button>

        {open && (
          <div className="explanation-content">
            <div className="formula-card twiddle">
              <p className="formula-text">
                W<sub>N</sub><sup>kn</sup> = e<sup>−j·2π·k·n / N</sup>
              </p>
              <p className="formula-subtitle">
                = cos(2πkn/N) − j·sin(2πkn/N)
              </p>
            </div>

            <div className="mt-4">
              <p className={`section-title ${theme}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Parameters
              </p>
              <ul className="section-list">
                <li>
                  <strong>N</strong> — Transform size (FFT length), must be positive integer
                </li>
                <li>
                  <strong>k</strong> — Frequency bin index, ranges from 0 to N-1
                </li>
                <li>
                  <strong>n</strong> — Time/sample index, ranges from 0 to N-1
                </li>
              </ul>
            </div>

            <div className="mt-4">
              <p className={`section-title ${theme}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                Key Properties
              </p>
              <ul className="section-list">
                <li>
                  <strong>Periodicity:</strong> W<sub>N</sub><sup>(k+N)n</sup> = W<sub>N</sub><sup>kn</sup>
                </li>
                <li>
                  <strong>Symmetry:</strong> W<sub>N</sub><sup>kn</sup> = W<sub>N</sub><sup>(N−k)n</sup>*
                </li>
                <li>
                  <strong>Special values:</strong> W<sub>N</sub><sup>0</sup> = 1, W<sub>2</sub><sup>1</sup> = −1
                </li>
              </ul>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                DFT using twiddle factors:
              </p>
              <p className="font-mono text-xs text-center text-slate-600 dark:text-slate-400">
                X[k] = Σ<sub>n=0</sub><sup>N-1</sup> x[n] · W<sub>N</sub><sup>kn</sup>
              </p>
            </div>
          </div>
        )}
      </aside>
    );
  }

  // FFT explanation
  if (isFFT) {
    return (
      <aside className="explanation-panel p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="explanation-header w-full"
        >
          <div className="flex items-center gap-3">
            <div className="explanation-header-icon fft">
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <h2 className="explanation-title">Fast Fourier Transform</h2>
              <p className="explanation-subtitle">Cooley-Tukey Algorithm - O(N log N)</p>
            </div>
          </div>
          <span className={`toggle-hide ${theme}`}>
            {open ? 'Hide ▲' : 'Show ▼'}
          </span>
        </button>

        {open && (
          <div className="explanation-content">
            <div className="formula-card fft">
              <p className="formula-text">
                FFT — O(N log N) Complexity
              </p>
              <p className="formula-subtitle">
                Much faster than DFT's O(N²) for large N
              </p>
            </div>

            <div className="mt-4">
              <p className={`section-title ${theme}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                How FFT Works
              </p>
              <ul className="section-list">
                <li>
                  <strong>Divide & Conquer</strong> — Split N-point DFT into smaller DFTs
                </li>
                <li>
                  <strong>Bit Reversal</strong> — Reorder input samples for butterfly operations
                </li>
                <li>
                  <strong>Butterfly Operations</strong> — Combine results efficiently
                </li>
                <li>
                  <strong>Power of 2</strong> — N should be power of 2 for standard Cooley-Tukey
                </li>
              </ul>
            </div>

            <div className="mt-4 step-list">
              <p className={`section-title ${theme}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Computation Steps
              </p>
              <div className="step-item">
                <span className="step-number">1</span>
                <span className="step-content">
                  Pad input to next power of 2 if needed
                </span>
              </div>
              <div className="step-item">
                <span className="step-number">2</span>
                <span className="step-content">
                  Perform bit-reversal permutation on input indices
                </span>
              </div>
              <div className="step-item">
                <span className="step-number">3</span>
                <span className="step-content">
                  Apply butterfly operations in stages (N/2, N/4, ...)
                </span>
              </div>
              <div className="step-item">
                <span className="step-number">4</span>
                <span className="step-content">
                  Combine results to get final <span className="highlight">X[k]</span> values
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>
    );
  }

  // Circular Convolution explanation
  if (isCircularConv) {
    return (
      <aside className="explanation-panel p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="explanation-header w-full"
        >
          <div className="flex items-center gap-3">
            <div className="explanation-header-icon conv">
              <span className="text-xl">🔄</span>
            </div>
            <div>
              <h2 className="explanation-title">Circular Convolution</h2>
              <p className="explanation-subtitle">Convolution of periodic sequences</p>
            </div>
          </div>
          <span className={`toggle-hide ${theme}`}>
            {open ? 'Hide ▲' : 'Show ▼'}
          </span>
        </button>

        {open && (
          <div className="explanation-content">
            <div className="formula-card conv">
              <p className="formula-text">
                y[n] = Σ<sub>k=0</sub><sup>N-1</sup> x[k] · h[(n−k) mod N]
              </p>
              <p className="formula-subtitle">
                Both sequences are periodic with period N
              </p>
            </div>

            <div className="mt-4">
              <p className={`section-title ${theme}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Key Concepts
              </p>
              <ul className="section-list">
                <li>
                  <strong>Periodicity</strong> — Both sequences wrap around with period N
                </li>
                <li>
                  <strong>Modular Index</strong> — Uses (n-k) mod N for wrapping around
                </li>
                <li>
                  <strong>DFT Property</strong> — Circular convolution in time = multiplication in frequency
                </li>
                <li>
                  <strong>Linear Convolution</strong> — Use zero-padding to N ≥ L+M-1 for linear results
                </li>
              </ul>
            </div>

            <div className="mt-4 step-list">
              <p className={`section-title ${theme}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                How to Calculate
              </p>
              <div className="step-item">
                <span className="step-number">1</span>
                <span className="step-content">
                  Choose convolution size N (max of both sequence lengths)
                </span>
              </div>
              <div className="step-item">
                <span className="step-number">2</span>
                <span className="step-content">
                  For each output index <strong>n</strong> from 0 to N-1
                </span>
              </div>
              <div className="step-item">
                <span className="step-number">3</span>
                <span className="step-content">
                  Sum products <strong>x[k] × h[(n-k) mod N]</strong> for k = 0 to N-1
                </span>
              </div>
              <div className="step-item">
                <span className="step-number">4</span>
                <span className="step-content">
                  Result is the <span className="highlight">circular convolution y[n]</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>
    );
  }

  // DFT/IDFT explanation
  const indexLabel = isIDFT ? 'n' : 'k';
  const resultLabel = isIDFT ? 'x[n]' : 'X[k]';

  return (
    <aside className="explanation-panel p-4 sm:p-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="explanation-header w-full"
      >
        <div className="flex items-center gap-3">
          <div className={`explanation-header-icon ${theme}`}>
            <svg className={`w-5 h-5 ${isIDFT ? 'text-purple-500' : 'text-sky-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="explanation-title">How It Works</h2>
            <p className="explanation-subtitle">Step-by-step calculation guide</p>
          </div>
        </div>
        <span className={`toggle-hide ${theme}`}>
          {open ? 'Hide ▲' : 'Show ▼'}
        </span>
      </button>

      {open && (
        <div className="explanation-content">
          <div className={`formula-card ${theme}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${isIDFT ? 'bg-purple-500' : 'bg-sky-500'}`} />
              <p className={`text-sm font-semibold ${isIDFT ? 'text-purple-700 dark:text-purple-300' : 'text-sky-700 dark:text-sky-300'}`}>
                {OPERATIONS[operation]?.fullName || (isDFT ? 'Discrete Fourier Transform' : 'Inverse DFT')}
              </p>
            </div>
            <p className="formula-text">
              {isDFT
                ? 'X[k] = Σₙ x[n] · e^(−j·2π·k·n / N)'
                : 'x[n] = (1/N) · Σₖ X[k] · e^(+j·2π·k·n / N)'}
            </p>
          </div>

          <div className="mt-4">
            <p className={`section-title ${theme}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Key Concepts
            </p>
            <ul className="section-list">
              <li>
                <strong>N</strong> — Transform length, total number of samples in your input
              </li>
              <li>
                <strong>{indexLabel}</strong> — Output index, selects which {isDFT ? 'frequency' : 'time sample'} to compute
              </li>
              <li>
                <strong>Complex Exponential</strong> — Uses cos(θ) − j·sin(θ) for DFT, or cos(θ) + j·sin(θ) for IDFT
              </li>
              <li>
                <strong>Result</strong> — {resultLabel} is a complex number with magnitude and phase
              </li>
            </ul>
          </div>

          <div className="mt-4 step-list">
            <p className={`section-title ${theme}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              Calculation Steps
            </p>
            <div className="step-item">
              <span className="step-number">1</span>
              <span className="step-content">
                Set <strong>{indexLabel} = {activeIndex !== null ? activeIndex : 0}</strong> (the index you want to compute)
              </span>
            </div>
            <div className="step-item">
              <span className="step-number">2</span>
              <span className="step-content">
                For each input sample <strong>n</strong>, multiply by complex exponential
                <br />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  e^(−j2π{indexLabel}n/N) for DFT, e^(+j2π{indexLabel}n/N) for IDFT
                </span>
              </span>
            </div>
            <div className="step-item">
              <span className="step-number">3</span>
              <span className="step-content">
                Sum all products to get a single complex number
              </span>
            </div>
            <div className="step-item">
              <span className="step-number">4</span>
              <span className="step-content">
                {isDFT ? (
                  <span>
                    Result is <span className="highlight">X[k]</span> with magnitude |X[k]| and phase ∠X[k]
                  </span>
                ) : (
                  <span>
                    Divide by <strong>N</strong>, result is <span className="highlight-purple">x[n]</span>
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Time Complexity: O(N²)
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              For faster computation with large N, use FFT (O(N log N))
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
