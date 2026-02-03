import React from 'react';

function Row({ row, isActive, onClick, operation }) {
  return (
    <div
      className={`table-row-item ${isActive ? 'row-active' : ''}`}
      onClick={() => onClick(row.index)}
    >
      <span className="relative flex items-center gap-2">
        <span className="inline-flex sm:hidden w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-[0.65rem] font-bold text-center items-center justify-center text-slate-600 dark:text-slate-300">
          {row.index}
        </span>
        <span className="hidden sm:inline font-mono text-sm">{row.index}</span>
        <span className="index-badge-small">{row.index}</span>
      </span>
      <span className="relative">
        <span className="sm:hidden flex items-center gap-1 font-mono text-xs text-slate-800 dark:text-slate-100">
          {row.re.toFixed(3)} {row.im >= 0 ? '+' : '-'} {Math.abs(row.im).toFixed(3)}j
        </span>
        <span className="hidden sm:flex items-center gap-1.5 font-mono text-sm">
          <span className="text-slate-800 dark:text-slate-100">{row.re.toFixed(4)}</span>
          <span className={row.im >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
            {row.im >= 0 ? '+' : '-'} {Math.abs(row.im).toFixed(4)}j
          </span>
        </span>
      </span>
      <div className="flex justify-end items-center gap-2">
        <span className={`index-badge ${isActive ? 'badge-active-sky' : 'badge-inactive-sky'} sm:hidden`}>
          {isActive ? '●' : '○'}
        </span>
        <span className="hidden sm:inline font-mono font-medium text-emerald-600 dark:text-emerald-400">
          {row.magnitude.toFixed(3)}
        </span>
      </div>
    </div>
  );
}

export default function ResultTable({ results, operation, activeIndex, setActiveIndex }) {
  if (!results?.length) {
    return (
      <div className="result-card p-4 sm:p-6">
        <div className="empty-state">
          <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="empty-text">Enter a sequence to see results</p>
        </div>
      </div>
    );
  }

  const titleMap = {
    dft: 'DFT Results',
    fft: 'FFT Results',
    idft: 'IDFT Results',
    circularConv: 'Convolution Results',
    twiddle: 'Twiddle Factors',
  };

  return (
    <div className="result-card p-3 sm:p-4">
      <div className="result-header">
        <div>
          <h2 className="result-title">{titleMap[operation] || 'Results'}</h2>
          <p className="result-subtitle">{results.length} {results.length === 1 ? 'value' : 'values'}</p>
        </div>
        <div className="result-badge">
          <svg className="badge-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="hidden sm:inline">Magnitude</span>
          <span className="sm:hidden">|X|</span>
        </div>
      </div>

      <div className="table-container">
        <div className="result-table">
          <div className="hidden sm:grid table-header-row">
            <span>Index</span>
            <span>Complex Value (Re + jIm)</span>
            <span className="text-right">Magnitude</span>
          </div>
          <div className="table-body">
            {results.map((row) => (
              <Row
                key={row.index}
                row={row}
                isActive={activeIndex === row.index}
                onClick={setActiveIndex}
                operation={operation}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
