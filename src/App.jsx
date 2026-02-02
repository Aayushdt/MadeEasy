import React, { useEffect, useState, useCallback } from 'react';
import Header from './components/Header';
import OperationToolbar from './components/OperationToolbar';
import InputForm from './components/InputForm';
import CircularConvInput from './components/CircularConvInput';
import TwiddleFactorInput from './components/TwiddleFactorInput';
import ResultTable from './components/ResultTable';
import SpectrumChart from './components/SpectrumChart';
import ExplanationPanel from './components/ExplanationPanel';
import Footer from './components/Footer';
import { dft, idft, fft, circularConvolution, twiddleFactor } from './utils/dft';
import { getOperationConfig, getOperationImpl } from './config/operations';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';

// Default sequence for demo
const DEFAULT_SEQUENCE = [
  { re: 1, im: 0 },
  { re: 0, im: -1 },
  { re: 2, im: 3 },
  { re: 0, im: 0 },
];

export default function App() {
  // Theme state
  const [theme, setTheme] = useState('dark');

  // Core state
  const [sequence, setSequence] = useState(DEFAULT_SEQUENCE);
  const [sequence2, setSequence2] = useState([{ re: 1, im: 0 }, { re: 1, im: 0 }, { re: 1, im: 0 }, { re: 1, im: 0 }]);
  const [N, setN] = useState('');
  const [operation, setOperation] = useState('dft');

  // Twiddle factor state
  const [kValue, setKValue] = useState(null);

  // Results state
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [activeIndex, setActiveIndex] = useState(null);

  // Get operation config
  const opConfig = getOperationConfig(operation);
  const opImpl = getOperationImpl(operation);

  // Theme persistence
  useEffect(() => {
    const stored = window.localStorage.getItem('madeeasy-theme');
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
    }
  }, []);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    window.localStorage.setItem('madeeasy-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleValidationError = useCallback((message) => {
    setError(message || '');
  }, []);

  // Twiddle factor calculation
  const calculateTwiddle = useCallback((nVal) => {
    if (!N || N <= 0) {
      setError('Please enter a valid N (transform size).');
      return;
    }
    if (kValue === null || kValue === undefined) {
      setError('Please enter a value for k.');
      return;
    }

    const tf = twiddleFactor(kValue, nVal || 0, N);
    const newResult = {
      index: results.length,
      k: kValue,
      n: nVal || 0,
      N,
      re: tf.re,
      im: tf.im,
      magnitude: 1,
      phase: tf.phase,
    };

    setResults([...results, newResult]);
    setActiveIndex(newResult.index);
    setError('');
  }, [N, kValue, results]);

  // Main calculation handler
  const handleCalculate = useCallback(() => {
    setError('');

    if (operation === 'twiddle') {
      calculateTwiddle(0);
      return;
    }

    if (operation === 'circularConv') {
      if (!sequence.length || !sequence2.length) {
        setError('Please provide both sequences.');
        return;
      }
      const convN = N || Math.max(sequence.length, sequence2.length);
      const data = circularConvolution(sequence, sequence2, convN);
      setResults(data);
      setActiveIndex(0);
      return;
    }

    // DFT/IDFT/FFT
    if (!sequence.length) {
      setError('Please provide at least one input sample.');
      return;
    }
    if (N && (!Number.isInteger(N) || N <= 0)) {
      setError('N must be a positive integer.');
      return;
    }

    let data;
    if (operation === 'dft') {
      data = dft(sequence, N);
    } else if (operation === 'idft') {
      data = idft(sequence, N);
    } else if (operation === 'fft') {
      data = fft(sequence, N);
    }

    if (data) {
      setResults(data);
      setActiveIndex(0);
    }
  }, [operation, sequence, sequence2, N, calculateTwiddle]);

  // Reset state
  const handleReset = useCallback(() => {
    setSequence(DEFAULT_SEQUENCE);
    setSequence2([{ re: 1, im: 0 }, { re: 1, im: 0 }, { re: 1, im: 0 }, { re: 1, im: 0 }]);
    setN('');
    setKValue(null);
    setResults([]);
    setError('');
    setActiveIndex(null);
  }, []);

  // Clear results on operation change
  useEffect(() => {
    setResults([]);
    setError('');
    setActiveIndex(null);
  }, [operation]);

  const NToUse = typeof N === 'number' && N > 0 ? N : sequence.length;

  // Check if operation needs two sequences
  const needsTwoSequences = operation === 'circularConv';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors">
      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 pb-16 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
        {/* Operation Toolbar */}
        <Card variant="bordered" className="p-3 sm:p-4">
          <OperationToolbar operation={operation} setOperation={setOperation} />
        </Card>

        {/* Operation Description */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 px-3 py-2">
          <span className="text-lg sm:text-xl">{opConfig.icon}</span>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
              {opConfig.fullName}
            </span>
            <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              — {opConfig.description}
            </span>
          </div>
        </div>

        {/* Circular Convolution Mode */}
        {needsTwoSequences ? (
          <div className="grid gap-4 sm:grid-cols-[1fr] lg:grid-cols-[1fr_1fr] items-start">
            <div className="space-y-4">
              <InputForm
                sequence={sequence}
                setSequence={setSequence}
                N={N}
                setN={setN}
                onError={handleValidationError}
              />
              <CircularConvInput
                sequence1={sequence}
                sequence2={sequence2}
                setSequence2={setSequence2}
                N={N}
                setN={setN}
                onError={handleValidationError}
              />
              <Card variant="bordered" className="p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                        N =
                      </span>
                      <span className="font-mono text-sm sm:text-base font-bold text-rose-500 dark:text-rose-400">
                        {N || Math.max(sequence.length, sequence2.length)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={handleReset}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleCalculate}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Calculate
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
            <ExplanationPanel operation={operation} activeIndex={activeIndex} />
          </div>
        ) : operation === 'twiddle' ? (
          /* Twiddle Factor Mode */
          <div className="grid gap-4 sm:grid-cols-[1fr] lg:grid-cols-[1fr_1fr] items-start">
            <TwiddleFactorInput
              N={N}
              setN={setN}
              k={kValue}
              setK={setKValue}
              onCalculate={calculateTwiddle}
            />
            <ExplanationPanel operation={operation} activeIndex={activeIndex} />
          </div>
        ) : (
          /* DFT/IDFT/FFT Mode */
          <div className="grid gap-4 sm:grid-cols-[1fr] lg:grid-cols-[1.4fr_1fr] xl:grid-cols-[1.5fr_1fr] items-start">
            <div className="space-y-4">
              <InputForm
                sequence={sequence}
                setSequence={setSequence}
                N={N}
                setN={setN}
                onError={handleValidationError}
              />

              {/* Action Bar */}
              <Card variant="bordered" className="p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                        N =
                      </span>
                      <span className="font-mono text-sm sm:text-base font-bold text-sky-500 dark:text-sky-400">
                        {NToUse}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      ({sequence.length} {sequence.length === 1 ? 'sample' : 'samples'})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={handleReset}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleCalculate}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Calculate
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <ExplanationPanel operation={operation} activeIndex={activeIndex} />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="rounded-xl border px-4 py-3 text-sm bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/50 dark:text-rose-100 dark:border-rose-500/40">
            {error}
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-[1fr] lg:grid-cols-[1.3fr_1.1fr] xl:grid-cols-[1.4fr_1fr] items-start">
            <ResultTable
              results={results}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              operation={operation}
            />
            {opImpl.hasChart && (
              <SpectrumChart
                results={results}
                operation={operation}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
              />
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
