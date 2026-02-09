/**
 * Application Constants
 * Centralized constants for the MadeEasy signal processing application
 */

// Default sequences for demo
export const DEFAULT_SEQUENCE = [
  { re: 1, im: 0 },
  { re: 0, im: -1 },
  { re: 2, im: 3 },
  { re: 0, im: 0 },
];

export const DEFAULT_SECOND_SEQUENCE = [
  { re: 1, im: 0 },
  { re: 1, im: 0 },
  { re: 1, im: 0 },
  { re: 1, im: 0 },
];

// Sample sequences for quick testing
export const SAMPLE_SEQUENCES = {
  basic: '(1,0), (0,-1), (2,3), (0,0)',
  impulse: '(1,0), (0,0), (0,0), (0,0)',
  step: '(1,0), (1,0), (1,0), (1,0)',
  complex: '(1,1), (2,-1), (0,2), (-1,0)',
};

// Theme settings
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'madeeasy-theme',
  LAST_SEQUENCE: 'madeeasy-last-sequence',
};

// Validation messages
export const ERROR_MESSAGES = {
  INVALID_SEQUENCE: 'Please provide at least one input sample.',
  INVALID_N: 'N must be a positive integer.',
  INVALID_K: 'Please enter a value for k.',
  INVALID_TWIDDLE_N: 'Please enter a valid N (transform size).',
  MISSING_SEQUENCES: 'Please provide both sequences.',
  INVALID_BLOCK_SIZE: 'Block size N must be >= impulse response length.',
};

// Decimal precision for results
export const PRECISION = {
  DEFAULT: 3,
  DISPLAY: 4,
};
