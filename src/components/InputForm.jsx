import React, { useState, useEffect, useCallback } from 'react';
import { parseSequenceString } from '../utils/dft';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

const SAMPLE_TEXT = '(1,0), (0,-1), (2,3), (0,0)';

export default function InputForm({ sequence, setSequence, N, setN, onError }) {
  const [rawInput, setRawInput] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('manual');

  useEffect(() => {
    if (N && N > sequence.length) {
      const needed = N - sequence.length;
      const zeros = Array(needed).fill({ re: 0, im: 0 });
      setSequence([...sequence, ...zeros]);
    }
  }, [N]);

  useEffect(() => {
    if (rawInput) setError('');
  }, [rawInput]);

  const addPoint = useCallback(() => {
    setSequence([...sequence, { re: 0, im: 0 }]);
  }, [sequence]);

  const removePoint = useCallback((index) => {
    const next = sequence.filter((_, i) => i !== index);
    setSequence(next.length ? next : [{ re: 0, im: 0 }]);
  }, [sequence]);

  const updatePoint = useCallback((index, field, value) => {
    const num = value === '' ? 0 : Number(value);
    const next = sequence.map((pt, i) =>
      i === index ? { ...pt, [field]: num } : pt
    );
    setSequence(next);
  }, [sequence]);

  const parseInput = useCallback((text) => {
    try {
      const parsed = parseSequenceString(text);
      if (!parsed.length) {
        const msg = 'No valid samples found. Use: 1,2,3 or (1,0),(0,-1)';
        setError(msg);
        onError?.(msg);
        return;
      }
      setSequence(parsed);
      setError('');
      onError?.('');
    } catch (err) {
      const msg = 'Unable to parse input string.';
      setError(msg);
      onError?.(msg);
    }
  }, [setSequence, onError]);

  const loadSample = useCallback(() => {
    parseInput(SAMPLE_TEXT);
    setRawInput(SAMPLE_TEXT);
    setActiveTab('paste');
    if (!N) setN(4);
  }, [parseInput, N, setN]);

  const clearAll = useCallback(() => {
    setSequence([{ re: 0, im: 0 }]);
    setRawInput('');
    setN('');
    setError('');
    onError?.('');
  }, [setSequence, setN, onError]);

  const handleNChange = useCallback((e) => {
    const val = e.target.value;
    setN(val === '' ? '' : Math.max(1, Number(val)));
  }, [setN]);

  const handlePasteImport = useCallback(() => {
    parseInput(rawInput);
  }, [parseInput, rawInput]);

  return (
    <Card className="calculate-card">
      {/* Header with gradient accent */}
      <div className="card-header">
        <div className="header-icon">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="header-content">
          <h2 className="header-title">Input Sequence</h2>
          <p className="header-subtitle">Enter your complex signal samples</p>
        </div>
        <Button variant="sky" size="sm" onClick={loadSample}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Try Sample
        </Button>
      </div>

      {/* Transform Size Indicator */}
      <div className="transform-indicator">
        <div className="indicator-item">
          <span className="indicator-label">Transform Size (N)</span>
          <input
            type="number"
            min="1"
            value={N || ''}
            onChange={handleNChange}
            placeholder={String(sequence.length)}
            className="indicator-input"
          />
        </div>
        <div className="indicator-item highlight">
          <div className="pulse-dot" />
          <span className="indicator-text">
            {sequence.length} {sequence.length === 1 ? 'sample' : 'samples'}
          </span>
        </div>
      </div>

      {/* Input Method Tabs */}
      <div className="input-tabs">
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Manual Entry
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('paste')}
          className={`tab-button ${activeTab === 'paste' ? 'active' : ''}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Paste / Import
        </button>
      </div>

      {/* Manual Entry */}
      {activeTab === 'manual' && (
        <div className="sequence-table">
          <div className="table-header">
            <span className="col-real">Real Part (Re)</span>
            <span className="col-imag">Imaginary (Im)</span>
            <span className="col-action">Action</span>
          </div>

          <div className="table-body">
            {sequence.map((pt, index) => (
              <div key={index} className="table-row">
                <div className="col-real">
                  <input
                    type="number"
                    value={pt.re}
                    onChange={(e) => updatePoint(index, 're', e.target.value)}
                    className="number-input"
                    placeholder="0"
                  />
                  <span className="index-badge">{index}</span>
                </div>
                <div className="col-imag">
                  <input
                    type="number"
                    value={pt.im}
                    onChange={(e) => updatePoint(index, 'im', e.target.value)}
                    className="number-input"
                    placeholder="0"
                  />
                </div>
                <div className="col-action">
                  <button
                    type="button"
                    onClick={() => removePoint(index)}
                    className="remove-button"
                    title="Remove this sample"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addPoint} className="add-button">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Sample Point
          </button>
        </div>
      )}

      {/* Paste / Quick Import */}
      {activeTab === 'paste' && (
        <div className="paste-section">
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            rows={4}
            placeholder="Paste your sequence here...&#10;&#10;Supported formats:&#10;1, 2, 3, 4 (real numbers)&#10;(1,0), (0,-1), (2,3) (complex pairs)"
            className="paste-textarea"
          />

          <div className="format-examples">
            <p className="examples-title">Quick Examples:</p>
            <div className="examples-list">
              <button
                type="button"
                onClick={() => { setRawInput('1, 2, 3, 4'); parseInput('1, 2, 3, 4'); }}
                className="example-button"
              >
                1, 2, 3, 4
              </button>
              <button
                type="button"
                onClick={() => { setRawInput(SAMPLE_TEXT); parseInput(SAMPLE_TEXT); }}
                className="example-button"
              >
                (1,0), (0,-1), (2,3)
              </button>
            </div>
          </div>

          <div className="action-buttons">
            <Button
              variant="sky"
              size="sm"
              onClick={handlePasteImport}
              disabled={!rawInput.trim()}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import Sequence
            </Button>
            <Button variant="secondary" size="sm" onClick={clearAll}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear
            </Button>
          </div>

          {error && (
            <div className="error-message">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
