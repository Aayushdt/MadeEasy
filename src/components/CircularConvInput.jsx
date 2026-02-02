import React, { useState, useEffect, useCallback } from 'react';
import { parseSequenceString } from '../utils/dft';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

const SAMPLE_TEXT = '(1,0), (1,0), (1,0), (1,0)';

export default function CircularConvInput({ sequence1, sequence2, setSequence2, N, setN, onError }) {
  const [rawInput, setRawInput] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('manual');

  useEffect(() => {
    if (rawInput) setError('');
  }, [rawInput]);

  const addPoint = useCallback(() => {
    setSequence2([...sequence2, { re: 0, im: 0 }]);
  }, [sequence2, setSequence2]);

  const removePoint = useCallback((index) => {
    const next = sequence2.filter((_, i) => i !== index);
    setSequence2(next.length ? next : [{ re: 0, im: 0 }]);
  }, [sequence2, setSequence2]);

  const updatePoint = useCallback((index, field, value) => {
    const num = value === '' ? 0 : Number(value);
    const next = sequence2.map((pt, i) =>
      i === index ? { ...pt, [field]: num } : pt
    );
    setSequence2(next);
  }, [sequence2, setSequence2]);

  const parseInput = useCallback((text) => {
    try {
      const parsed = parseSequenceString(text);
      if (!parsed.length) {
        const msg = 'No valid samples found. Use: 1,2,3 or (1,0),(0,-1)';
        setError(msg);
        onError?.(msg);
        return;
      }
      setSequence2(parsed);
      setError('');
      onError?.('');
    } catch (err) {
      const msg = 'Unable to parse input string.';
      setError(msg);
      onError?.(msg);
    }
  }, [setSequence2, onError]);

  const loadSample = useCallback(() => {
    parseInput(SAMPLE_TEXT);
    setRawInput(SAMPLE_TEXT);
    setActiveTab('paste');
  }, [parseInput]);

  const clearAll = useCallback(() => {
    setSequence2([{ re: 0, im: 0 }]);
    setRawInput('');
    setError('');
    onError?.('');
  }, [setSequence2, onError]);

  const handleNChange = useCallback((e) => {
    const val = e.target.value;
    setN(val === '' ? '' : Math.max(1, Number(val)));
  }, [setN]);

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Second Sequence (h[n])
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define the second sequence for convolution
          </p>
        </div>
        <Button variant="sky" size="sm" onClick={loadSample}>
          Load Sample
        </Button>
      </div>

      {/* N Indicator */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Convolution Size (N)
          </span>
          <input
            type="number"
            min="1"
            value={N || ''}
            onChange={handleNChange}
            placeholder={String(Math.max(sequence1.length, sequence2.length))}
            className="w-14 sm:w-16 rounded-md bg-white dark:bg-slate-700 px-2 py-1 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 px-2.5 py-1">
          <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-xs font-medium text-rose-700 dark:text-rose-300">
            {sequence2.length} {sequence2.length === 1 ? 'sample' : 'samples'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-slate-100 dark:bg-slate-800/50 p-1 mb-3">
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`flex-1 rounded-md px-3 py-2 text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'manual'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Manual Entry
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('paste')}
          className={`flex-1 rounded-md px-3 py-2 text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'paste'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Paste / Quick Import
        </button>
      </div>

      {/* Manual Entry */}
      {activeTab === 'manual' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1fr_1fr_60px] gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Real Part (Re)
            </span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Imaginary (Im)
            </span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 text-right">
              Action
            </span>
          </div>

          <div className="max-h-48 sm:max-h-64 overflow-y-auto">
            {sequence2.map((pt, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_1fr_50px] sm:grid-cols-[1fr_1fr_60px] gap-2 px-3 sm:px-4 py-2 items-center border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="relative">
                  <input
                    type="number"
                    value={pt.re}
                    onChange={(e) => updatePoint(index, 're', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="0"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline text-[0.65rem] text-slate-400 font-mono">
                    {index}
                  </span>
                </div>
                <input
                  type="number"
                  value={pt.im}
                  onChange={(e) => updatePoint(index, 'im', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="0"
                />
                <button
                  type="button"
                  onClick={() => removePoint(index)}
                  className="flex items-center justify-center rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                  title="Remove this sample"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="px-3 sm:px-4 py-3 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={addPoint}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 py-2.5 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 transition-all hover:border-rose-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Sample Point
            </button>
          </div>
        </div>
      )}

      {/* Paste / Quick Import */}
      {activeTab === 'paste' && (
        <div className="space-y-3">
          <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 overflow-hidden">
            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              rows={4}
              placeholder="Paste your sequence here...&#10;&#10;Supported formats:&#10;1, 2, 3, 4 (real numbers)&#10;(1,0), (0,-1), (2,3) (complex pairs)"
              className="w-full resize-none bg-transparent px-4 py-3 text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="rose"
              size="sm"
              onClick={() => parseInput(rawInput)}
              disabled={!rawInput.trim()}
            >
              Import Sequence
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={clearAll}
            >
              Clear
            </Button>
          </div>

          {error && (
            <div className="rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 px-3 py-2">
              <p className="text-xs text-rose-600 dark:text-rose-300">{error}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
