import React from 'react';
import { Card } from './ui/Card';

export default function ResultTable({ results, activeIndex, setActiveIndex, operation }) {
  const isTwiddle = operation === 'twiddle';
  const isDFT = operation === 'dft';

  if (results.length === 0) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
              {isTwiddle ? 'Calculated Values' : 'Results'}
            </h2>
            <p className="text-[0.7rem] text-slate-500 dark:text-slate-400">
              {isTwiddle ? 'Twiddle factor calculations' : `Computed ${operation.toUpperCase()} output values`}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 p-6 sm:p-8 text-center">
          <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-slate-300 dark:text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isTwiddle ? 'Enter values and click Calculate' : 'Enter a sequence and click Calculate'}
          </p>
        </div>
      </Card>
    );
  }

  const columnHeaders = isTwiddle ? (
    <>
      <th className="px-3 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-300">
        W<sub>N</sub><sup>kn</sup>
      </th>
      <th className="px-3 py-2.5 text-right font-semibold text-slate-600 dark:text-slate-300">
        Real
      </th>
      <th className="px-3 py-2.5 text-right font-semibold text-slate-600 dark:text-slate-300">
        Imaginary
      </th>
      <th className="px-3 py-2.5 text-right font-semibold text-slate-600 dark:text-slate-300">
        Angle (°)
      </th>
    </>
  ) : (
    <>
      <th className="px-3 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-300">
        {isDFT ? 'k (freq)' : 'n (time)'}
      </th>
      <th className="px-3 py-2.5 text-right font-semibold text-slate-600 dark:text-slate-300">
        Real
      </th>
      <th className="px-3 py-2.5 text-right font-semibold text-slate-600 dark:text-slate-300">
        Imaginary
      </th>
      <th className="px-3 py-2.5 text-right font-semibold text-slate-600 dark:text-slate-300">
        |Value|
      </th>
      <th className="px-3 py-2.5 text-right font-semibold text-slate-600 dark:text-slate-300">
        Phase (°)
      </th>
    </>
  );

  return (
    <Card>
      <div className="flex items-center justify-between mb-3 gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
            {isTwiddle ? 'Calculated Values' : 'Results'}
          </h2>
          <p className="text-[0.7rem] text-slate-500 dark:text-slate-400">
            {isTwiddle ? 'Twiddle factor calculations' : `Computed ${operation.toUpperCase()} output values`}
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[0.7rem] font-medium text-slate-600 dark:text-slate-300">
          <svg className="h-3.5 w-3.5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {results.length} {results.length === 1 ? 'value' : 'values'}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-950/60">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-100/80 dark:bg-slate-800/80">
              <tr>{columnHeaders}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {results.map((row) => {
                const isActive = row.index === activeIndex;
                const badgeColor = isTwiddle 
                  ? isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                  : isActive ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300';

                return (
                  <tr
                    key={row.index}
                    onClick={() => setActiveIndex(row.index)}
                    className={`cursor-pointer transition-all duration-150 ${
                      isActive
                        ? 'bg-sky-50 dark:bg-sky-500/10'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      {isTwiddle ? (
                        <div className="flex items-center gap-1">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${badgeColor}`}>
                            {row.index + 1}
                          </span>
                          <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                            W<sub>{row.N}</sub><sup>{row.k}·{row.n}</sup>
                          </span>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${badgeColor}`}>
                          {row.index}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-700 dark:text-slate-200">
                      {row.re?.toFixed(4) ?? '0.0000'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-700 dark:text-slate-200">
                      {row.im < 0 ? '' : '+'}{row.im?.toFixed(4) ?? '0.0000'}
                    </td>
                    {isTwiddle ? (
                      <td className="px-3 py-2.5 text-right font-mono text-slate-500 dark:text-slate-400">
                        {row.phase?.toFixed(2) ?? '0.00'}°
                      </td>
                    ) : (
                      <>
                        <td className="px-3 py-2.5 text-right">
                          <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                            {row.magnitude?.toFixed(4) ?? '0.0000'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-slate-500 dark:text-slate-400">
                          {row.phase?.toFixed(2) ?? '0.00'}°
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
