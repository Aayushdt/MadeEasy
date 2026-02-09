/**
 * Signal Processing Utilities
 * DFT, IDFT, FFT, Convolution algorithms for complex signals
 */

// ============== Utility Functions ==============

/**
 * Rounds a number to specified decimal places
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places (default: 3)
 * @returns {number} Rounded value
 */
export function roundTo(value, decimals = 3) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Computes the magnitude of a complex number
 * @param {number} re - Real part
 * @param {number} im - Imaginary part
 * @returns {number} Magnitude (|re + j·im|)
 */
export function computeMagnitude(re, im) {
  return Math.sqrt(re * re + im * im);
}

/**
 * Computes the phase angle in degrees
 * @param {number} re - Real part
 * @param {number} im - Imaginary part
 * @returns {number} Phase in degrees (-180° to 180°)
 */
export function computePhaseDegrees(re, im) {
  return (Math.atan2(im, re) * 180) / Math.PI;
}

/**
 * Formats complex number as string
 * @param {number} re - Real part
 * @param {number} im - Imaginary part
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted string like "1.234 + j0.567"
 */
export function formatComplex(re, im, decimals = 3) {
  const reStr = re.toFixed(decimals);
  const imAbs = Math.abs(im).toFixed(decimals);
  const sign = im >= 0 ? '+' : '-';
  return `${reStr} ${sign} j${imAbs}`;
}

/**
 * Safely extracts numeric value from possibly malformed input
 * @param {any} val - Value to convert
 * @param {boolean} isReal - Whether extracting real part
 * @returns {number} Numeric value or 0
 */
export function getComplexValue(val, isReal = true) {
  if (typeof val === 'number') return val;
  if (val === '' || val === undefined || val === null) return 0;
  return Number(val) || 0;
}

/**
 * Validates input sequence
 * @param {Array} seq - Input sequence
 * @throws {Error} If sequence is invalid
 */
function validateSequence(seq) {
  if (!Array.isArray(seq) || seq.length === 0) {
    throw new Error('Invalid sequence: must be a non-empty array');
  }
  for (let i = 0; i < seq.length; i++) {
    if (typeof seq[i].re !== 'number' || typeof seq[i].im !== 'number') {
      throw new Error(`Invalid sequence: element ${i} missing re/im properties`);
    }
  }
}

// ============== Twiddle Factor ==============

/**
 * Computes twiddle factor W_N^kn = e^(-j*2*pi*k*n/N)
 * @param {number} k - Frequency bin index
 * @param {number} n - Time/sample index
 * @param {number} N - Transform size
 * @param {boolean} isInverse - Use +j for inverse transform
 * @returns {Object} Twiddle factor with real, imaginary, magnitude, phase
 * @throws {Error} If N is not positive
 */
export function twiddleFactor(k, n, N, isInverse = false) {
  if (N <= 0 || !Number.isInteger(N)) {
    throw new Error('N must be a positive integer');
  }

  const angle = (2 * Math.PI * k * n) / N;
  const sign = isInverse ? 1 : -1;
  const finalAngle = sign * angle;

  return {
    k,
    n,
    N,
    angle: finalAngle,
    re: roundTo(Math.cos(finalAngle)),
    im: roundTo(Math.sin(finalAngle)),
    magnitude: 1,
    phase: roundTo((finalAngle * 180) / Math.PI),
    isInverse,
  };
}

// ============== DFT ==============

/**
 * Discrete Fourier Transform
 * @param {Array} input - Array of {re, im} complex numbers
 * @param {number} [NOverride] - Transform size (pads or truncates)
 * @returns {Array} Array of {index, re, im, magnitude, phase}
 */
export function dft(input, NOverride) {
  validateSequence(input);

  const N = NOverride && NOverride > 0 ? NOverride : input.length;
  const result = [];
  const twoPiByN = (2 * Math.PI) / N;

  // Pre-compute cosine and sine values for efficiency
  const cosTable = [];
  const sinTable = [];
  for (let k = 0; k < N; k++) {
    cosTable[k] = [];
    sinTable[k] = [];
    for (let n = 0; n < N; n++) {
      const angle = -twoPiByN * k * n;
      cosTable[k][n] = Math.cos(angle);
      sinTable[k][n] = Math.sin(angle);
    }
  }

  for (let k = 0; k < N; k++) {
    let sumRe = 0;
    let sumIm = 0;

    for (let n = 0; n < N; n++) {
      const { re: xr, im: xi } = n < input.length ? input[n] : { re: 0, im: 0 };
      sumRe += xr * cosTable[k][n] - xi * sinTable[k][n];
      sumIm += xr * sinTable[k][n] + xi * cosTable[k][n];
    }

    const re = roundTo(sumRe);
    const im = roundTo(sumIm);
    result.push({
      index: k,
      re,
      im,
      magnitude: roundTo(computeMagnitude(re, im)),
      phase: roundTo(computePhaseDegrees(re, im)),
    });
  }

  return result;
}

// ============== IDFT ==============

/**
 * Inverse Discrete Fourier Transform
 * @param {Array} input - Array of {re, im} complex numbers (frequency domain)
 * @param {number} [NOverride] - Transform size
 * @returns {Array} Array of {index, re, im, magnitude, phase}
 */
export function idft(input, NOverride) {
  validateSequence(input);

  const N = NOverride && NOverride > 0 ? NOverride : input.length;
  const result = [];
  const twoPiByN = (2 * Math.PI) / N;

  for (let n = 0; n < N; n++) {
    let sumRe = 0;
    let sumIm = 0;

    for (let k = 0; k < N; k++) {
      const angle = twoPiByN * k * n;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const { re: xr, im: xi } = k < input.length ? input[k] : { re: 0, im: 0 };

      // Divide by N BEFORE rounding for better precision
      sumRe += (xr * cos + xi * sin);
      sumIm += (xi * cos - xr * sin);
    }

    const reScaled = roundTo(sumRe / N);
    const imScaled = roundTo(sumIm / N);

    result.push({
      index: n,
      re: reScaled,
      im: imScaled,
      magnitude: roundTo(computeMagnitude(reScaled, imScaled)),
      phase: roundTo(computePhaseDegrees(reScaled, imScaled)),
    });
  }

  return result;
}

// ============== FFT (Cooley-Tukey) ==============

/**
 * Fast Fourier Transform using Cooley-Tukey algorithm
 * @param {Array} input - Array of {re, im} complex numbers
 * @param {number} [NOverride] - Transform size
 * @returns {Array} Array of {index, re, im, magnitude, phase}
 * @throws {Error} If input is invalid
 */
export function fft(input, NOverride) {
  validateSequence(input);

  // Determine size - use NOverride or input length
  let N = NOverride && NOverride > 0 ? NOverride : input.length;

  // Pad input to N
  const data = [];
  for (let i = 0; i < N; i++) {
    data.push(i < input.length ? { ...input[i] } : { re: 0, im: 0 });
  }

  // Find next power of 2 for FFT size
  let size = 1;
  while (size < N) size *= 2;

  // Pad to power of 2
  while (data.length < size) {
    data.push({ re: 0, im: 0 });
  }

  // Convert to arrays for performance
  const n = size;
  const re = new Float64Array(n);
  const im = new Float64Array(n);

  for (let i = 0; i < n; i++) {
    re[i] = data[i].re;
    im[i] = data[i].im;
  }

  // Bit-reversal permutation
  for (let i = 0; i < n; i++) {
    let j = 0;
    let k = i;
    for (let bits = 0; bits < Math.log2(n); bits++) {
      j = (j << 1) | (k & 1);
      k >>= 1;
    }
    if (j > i) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }

  // Cooley-Tukey FFT with correct butterfly operation
  for (let len = 2; len <= n; len *= 2) {
    const halfLen = len / 2;
    const angle = (-2 * Math.PI) / len;

    for (let i = 0; i < n; i += len) {
      for (let j = 0; j < halfLen; j++) {
        // Twiddle factor
        const wRe = Math.cos(angle * j);
        const wIm = Math.sin(angle * j);

        const evenIdx = i + j;
        const oddIdx = i + j + halfLen;

        // Save original even values BEFORE modification
        const evenRe = re[evenIdx];
        const evenIm = im[evenIdx];

        // Complex multiplication: w * x[odd]
        const tRe = wRe * re[oddIdx] - wIm * im[oddIdx];
        const tIm = wRe * im[oddIdx] + wIm * re[oddIdx];

        // Butterfly: x[even] = even + t, x[odd] = even - t
        re[evenIdx] = evenRe + tRe;
        im[evenIdx] = evenIm + tIm;
        re[oddIdx] = evenRe - tRe;
        im[oddIdx] = evenIm - tIm;
      }
    }
  }

  // Build result (only return N points if padded)
  const result = [];
  for (let k = 0; k < N; k++) {
    const r = roundTo(re[k]);
    const iVal = roundTo(im[k]);
    result.push({
      index: k,
      re: r,
      im: iVal,
      magnitude: roundTo(computeMagnitude(r, iVal)),
      phase: roundTo(computePhaseDegrees(r, iVal)),
    });
  }

  return result;
}

// ============== Input Parsing ==============

/**
 * Parses sequence string into array of complex numbers
 * @param {string} raw - Raw input string
 * @returns {Array} Array of {re, im} objects
 * @throws {Error} If parsing fails
 */
export function parseSequenceString(raw) {
  if (!raw || typeof raw !== 'string') {
    return [];
  }

  const cleaned = raw.replace(/\s+/g, '');
  if (!cleaned) return [];

  const items = [];
  let buffer = '';
  let depth = 0;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      if (buffer) {
        items.push(buffer);
        buffer = '';
      }
    } else {
      buffer += ch;
    }
  }
  if (buffer) items.push(buffer);

  const result = [];

  for (const token of items) {
    if (!token) continue;

    if (token.startsWith('(') && token.endsWith(')')) {
      const inner = token.slice(1, -1);
      const parts = inner.split(',');
      if (parts.length !== 2) {
        throw new Error(`Invalid complex pair "${token}". Use format (a,b).`);
      }
      const re = Number(parts[0]);
      const im = Number(parts[1]);
      if (Number.isNaN(re) || Number.isNaN(im)) {
        throw new Error(`Invalid numbers in "${token}".`);
      }
      result.push({ re, im });
    } else {
      const re = Number(token);
      if (Number.isNaN(re)) {
        throw new Error(`Invalid real value "${token}".`);
      }
      result.push({ re, im: 0 });
    }
  }

  return result;
}

// ============== Circular Convolution ==============

/**
 * Computes circular convolution of two sequences
 * @param {Array} seq1 - First sequence
 * @param {Array} seq2 - Second sequence
 * @param {number} [N] - Convolution size (defaults to max length)
 * @returns {Array} Convolution result
 * @throws {Error} If sequences are invalid
 */
export function circularConvolution(seq1, seq2, N) {
  validateSequence(seq1);
  validateSequence(seq2);

  const L = N || Math.max(seq1.length, seq2.length);
  const result = [];

  for (let n = 0; n < L; n++) {
    let sumRe = 0;
    let sumIm = 0;

    for (let k = 0; k < L; k++) {
      const x1 = seq1[k] || { re: 0, im: 0 };
      const x2 = seq2[(n - k + L) % L] || { re: 0, im: 0 };

      // Complex multiplication
      const re = x1.re * x2.re - x1.im * x2.im;
      const im = x1.re * x2.im + x1.im * x2.re;

      sumRe += re;
      sumIm += im;
    }

    const re = roundTo(sumRe);
    const im = roundTo(sumIm);
    result.push({
      index: n,
      re,
      im,
      magnitude: roundTo(computeMagnitude(re, im)),
      phase: roundTo(computePhaseDegrees(re, im)),
    });
  }

  return result;
}

// ============== Linear Convolution ==============

/**
 * Computes linear convolution of two finite sequences
 * @param {Array} seq1 - First sequence (length L)
 * @param {Array} seq2 - Second sequence (length M)
 * @returns {Array} Linear convolution result (length L+M-1)
 */
export function linearConvolution(seq1, seq2) {
  validateSequence(seq1);
  validateSequence(seq2);

  const L = seq1.length;
  const M = seq2.length;
  const resultLength = L + M - 1;
  const result = [];

  for (let n = 0; n < resultLength; n++) {
    let sumRe = 0;
    let sumIm = 0;

    // Only compute overlapping indices
    const kStart = Math.max(0, n - M + 1);
    const kEnd = Math.min(n + 1, L);

    for (let k = kStart; k < kEnd; k++) {
      const j = n - k;
      const x1 = seq1[k];
      const x2 = seq2[j];

      // Complex multiplication
      const re = x1.re * x2.re - x1.im * x2.im;
      const im = x1.re * x2.im + x1.im * x2.re;

      sumRe += re;
      sumIm += im;
    }

    const re = roundTo(sumRe);
    const im = roundTo(sumIm);
    result.push({
      index: n,
      re,
      im,
      magnitude: roundTo(computeMagnitude(re, im)),
      phase: roundTo(computePhaseDegrees(re, im)),
    });
  }

  return result;
}

// ============== Overlap-Save Method ==============

/**
 * Block convolution using overlap-save method
 * @param {Array} x - Input signal
 * @param {Array} h - Impulse response (length M)
 * @param {number} N - Block size (must be >= M)
 * @returns {Array} Filtered output
 * @throws {Error} If N < M
 */
export function overlapSave(x, h, N) {
  validateSequence(x);
  validateSequence(h);

  const M = h.length;

  if (N < M) {
    throw new Error(`Block size N (${N}) must be >= impulse response length M (${M})`);
  }

  // Pad impulse response
  const hPadded = [];
  for (let i = 0; i < N; i++) {
    hPadded.push(i < M ? { ...h[i] } : { re: 0, im: 0 });
  }

  // Compute FFT of impulse response
  const H = fft(hPadded, N);

  // Pad input with M-1 zeros at start
  const xPadded = [];
  for (let i = 0; i < M - 1; i++) {
    xPadded.push({ re: 0, im: 0 });
  }
  xPadded.push(...x);

  const result = [];
  let n = 0;
  const validPerBlock = N - M + 1;

  while (n < xPadded.length) {
    // Get N samples
    const block = [];
    for (let i = 0; i < N; i++) {
      if (n + i < xPadded.length) {
        block.push({ ...xPadded[n + i] });
      } else {
        block.push({ re: 0, im: 0 });
      }
    }

    // FFT of block
    const X = fft(block, N);

    // Frequency domain multiplication
    const Y = [];
    for (let k = 0; k < N; k++) {
      const re = X[k].re * H[k].re - X[k].im * H[k].im;
      const im = X[k].re * H[k].im + X[k].im * H[k].re;
      Y.push({ re: roundTo(re), im: roundTo(im) });
    }

    // IFFT
    const yTime = idft(Y, N);

    // Save last M samples (discard first M-1)
    for (let i = M - 1; i < N; i++) {
      const y = yTime[i];
      result.push({
        index: result.length,
        re: y.re,
        im: y.im,
        magnitude: roundTo(computeMagnitude(y.re, y.im)),
        phase: roundTo(computePhaseDegrees(y.re, y.im)),
      });
    }

    n += validPerBlock;
  }

  return result;
}

// ============== Overlap-Add Method ==============

/**
 * Block convolution using overlap-add method
 * @param {Array} x - Input signal
 * @param {Array} h - Impulse response (length M)
 * @param {number} N - Block size (must be >= M)
 * @returns {Array} Filtered output
 * @throws {Error} If N < M
 */
export function overlapAdd(x, h, N) {
  validateSequence(x);
  validateSequence(h);

  const M = h.length;

  if (N < M) {
    throw new Error(`Block size N (${N}) must be >= impulse response length M (${M})`);
  }

  // Pad impulse response
  const hPadded = [];
  for (let i = 0; i < N; i++) {
    hPadded.push(i < M ? { ...h[i] } : { re: 0, im: 0 });
  }

  // Compute FFT of impulse response
  const H = fft(hPadded, N);

  const result = [];
  const output = [];
  const M_1 = M - 1;
  const validPerBlock = N - M + 1;
  let n = 0;
  let outputIndex = 0;

  while (n < x.length) {
    // Get M samples (zero-padded last block)
    const block = [];
    for (let i = 0; i < validPerBlock; i++) {
      block.push(n + i < x.length ? { ...x[n + i] } : { re: 0, im: 0 });
    }

    // Pad block to length N
    const blockPadded = [];
    for (let i = 0; i < N; i++) {
      blockPadded.push(i < block.length ? block[i] : { re: 0, im: 0 });
    }

    // FFT of block
    const X = fft(blockPadded, N);

    // Frequency domain multiplication
    const Y = [];
    for (let k = 0; k < N; k++) {
      const re = X[k].re * H[k].re - X[k].im * H[k].im;
      const im = X[k].re * H[k].im + X[k].im * H[k].re;
      Y.push({ re: roundTo(re), im: roundTo(im) });
    }

    // IFFT
    const yTime = idft(Y, N);

    // Overlap-add
    for (let i = 0; i < N; i++) {
      const outIdx = outputIndex + i;
      if (outIdx < output.length) {
        output[outIdx].re += yTime[i].re;
        output[outIdx].im += yTime[i].im;
      } else {
        output.push({ re: yTime[i].re, im: yTime[i].im });
      }
    }

    n += validPerBlock;
    outputIndex += validPerBlock;
  }

  // Format output
  for (let i = 0; i < output.length; i++) {
    const y = output[i];
    const re = roundTo(y.re);
    const im = roundTo(y.im);
    result.push({
      index: i,
      re,
      im,
      magnitude: roundTo(computeMagnitude(re, im)),
      phase: roundTo(computePhaseDegrees(re, im)),
    });
  }

  return result;
}
