import React, { useState } from 'react';
import { twiddleFactor } from '../utils/dft';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export default function TwiddleFactorInput({ N, setN, k, setK, onCalculate }) {
  const [nVal, setNVal] = useState(0);
  const [angleMode, setAngleMode] = useState('deg');

  const handleCalculate = () => {
    if (N && k !== null && k !== undefined) {
      onCalculate?.(nVal);
    }
  };

  const result = N && k !== null ? twiddleFactor(k, nVal, N) : null;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          <span className="text-xl">🧮</span>
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Twiddle Factor Calculator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compute W<sub>N</sub><sup>kn</sup> = e<sup>−j2πkn/N</sup>
          </p>
        </div>
      </div>

      {/* Input Parameters */}
      <div className="grid gap-4 sm:grid-cols-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            N (FFT Size)
          </label>
          <input
            type="number"
            min="1"
            value={N || ''}
            onChange={(e) => {
              setN(e.target.value ? Number(e.target.value) : '');
              setK(null);
            }}
            placeholder="e.g., 8"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            k (Frequency)
          </label>
          <input
            type="number"
            min="0"
            max={(N || 1) - 1}
            value={k ?? ''}
            onChange={(e) => setK(e.target.value ? Number(e.target.value) : null)}
            placeholder="0 to N-1"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            n (Time Index)
          </label>
          <input
            type="number"
            min="0"
            value={nVal}
            onChange={(e) => setNVal(Number(e.target.value) || 0)}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Calculate Button */}
      <Button
        variant="primary"
        onClick={handleCalculate}
        disabled={!N || k === null}
        className="w-full"
      >
        Calculate & Add to Results
      </Button>

      {/* Live Preview */}
      {result && (
        <div className="mt-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800/50 dark:to-slate-900/50 border border-emerald-100 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              W<sub>{N}</sub><sup>{k}·{nVal}</sup>
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setAngleMode('deg')}
                className={`px-2 py-0.5 text-[0.65rem] rounded ${
                  angleMode === 'deg' ? 'bg-emerald-200 dark:bg-emerald-800' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                °
              </button>
              <button
                type="button"
                onClick={() => setAngleMode('rad')}
                className={`px-2 py-0.5 text-[0.65rem] rounded ${
                  angleMode === 'rad' ? 'bg-emerald-200 dark:bg-emerald-800' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                rad
              </button>
            </div>
          </div>

          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between py-1 border-b border-emerald-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Real (cos):</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{result.re.toFixed(6)}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-emerald-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Imaginary (sin):</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{result.im < 0 ? '' : '+'}{result.im.toFixed(6)}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600 dark:text-slate-400">Angle θ:</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                {angleMode === 'rad' ? `${result.angle.toFixed(6)} rad` : `${result.phase.toFixed(4)}°`}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
