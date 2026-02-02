// Basic complex number utilities and DFT/IDFT/FFT implementation using plain JS math.

// ============== Utility Functions ==============
export function roundTo(value, decimals = 3) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function computeMagnitude(re, im) {
  return Math.sqrt(re * re + im * im);
}

export function computePhaseDegrees(re, im) {
  const radians = Math.atan2(im, re);
  return (radians * 180) / Math.PI;
}

export function formatComplex(re, im, decimals = 3) {
  const reStr = re.toFixed(decimals);
  const imAbs = Math.abs(im).toFixed(decimals);
  const sign = im >= 0 ? '+' : '-';
  return `${reStr} ${sign} j${imAbs}`;
}

// ============== Twiddle Factor ==============
export function twiddleFactor(k, n, N, isInverse = false) {
  if (N <= 0) throw new Error('N must be positive');

  const angle = (2 * Math.PI * k * n) / N;
  const sign = isInverse ? 1 : -1;

  return {
    k,
    n,
    N,
    angle: sign * angle,
    re: roundTo(Math.cos(sign * angle)),
    im: roundTo(Math.sin(sign * angle)),
    magnitude: 1,
    phase: roundTo((sign * angle * 180) / Math.PI),
    isInverse,
  };
}

// ============== DFT ==============
export function dft(input, NOverride) {
  const N = NOverride && NOverride > 0 ? NOverride : input.length;
  const result = [];
  const twoPiByN = (2 * Math.PI) / N;

  for (let k = 0; k < N; k++) {
    let sumRe = 0;
    let sumIm = 0;
    for (let n = 0; n < N; n++) {
      const angle = -twoPiByN * k * n;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const { re: xr, im: xi } = n < input.length ? input[n] : { re: 0, im: 0 };
      const re = xr * cos + xi * sin;
      const im = -xr * sin + xi * cos;
      sumRe += re;
      sumIm += im;
    }
    const re = roundTo(sumRe);
    const im = roundTo(sumIm);
    const mag = roundTo(computeMagnitude(re, im));
    const phase = roundTo(computePhaseDegrees(re, im));
    result.push({ index: k, re, im, magnitude: mag, phase });
  }

  return result;
}

// ============== IDFT ==============
export function idft(input, NOverride) {
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
      const re = xr * cos - xi * sin;
      const im = xr * sin + xi * cos;
      sumRe += re;
      sumIm += im;
    }
    const reScaled = roundTo(sumRe / N);
    const imScaled = roundTo(sumIm / N);
    const mag = roundTo(computeMagnitude(reScaled, imScaled));
    const phase = roundTo(computePhaseDegrees(reScaled, imScaled));
    result.push({ index: n, re: reScaled, im: imScaled, magnitude: mag, phase });
  }

  return result;
}

// ============== FFT (Cooley-Tukey) ==============
export function fft(input, NOverride) {
  const N = NOverride && NOverride > 0 ? NOverride : input.length;

  // Pad to power of 2 if needed
  let data = [...input];
  while (data.length < N) {
    data.push({ re: 0, im: 0 });
  }

  // Pad to next power of 2
  let size = 1;
  while (size < N) size *= 2;
  data = data.slice(0, size);

  // Bit-reversal permutation
  const n = size;
  const re = new Float64Array(n);
  const im = new Float64Array(n);

  for (let i = 0; i < n; i++) {
    re[i] = data[i].re;
    im[i] = data[i].im;
  }

  // Bit reversal
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

  // Cooley-Tukey FFT
  for (let size = 2; size <= n; size *= 2) {
    const halfSize = size / 2;
    const angle = (-2 * Math.PI) / size;

    for (let i = 0; i < n; i += size) {
      for (let j = 0; j < halfSize; j++) {
        const wRe = Math.cos(angle * j);
        const wIm = Math.sin(angle * j);
        const evenIdx = i + j;
        const oddIdx = i + j + halfSize;

        const tRe = wRe * re[oddIdx] - wIm * im[oddIdx];
        const tIm = wRe * im[oddIdx] + wIm * re[oddIdx];

        re[evenIdx] += tRe;
        im[evenIdx] += tIm;
        re[oddIdx] = re[evenIdx] - 2 * tRe;
        im[oddIdx] = im[evenIdx] - 2 * tIm;
      }
    }
  }

  // Build result
  const result = [];
  for (let k = 0; k < N; k++) {
    const r = roundTo(re[k]);
    const i = roundTo(im[k]);
    const mag = roundTo(computeMagnitude(r, i));
    const phase = roundTo(computePhaseDegrees(r, i));
    result.push({ index: k, re: r, im: i, magnitude: mag, phase });
  }

  return result;
}

// ============== Circular Convolution ==============
export function circularConvolution(seq1, seq2, N) {
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
    const mag = roundTo(computeMagnitude(re, im));
    const phase = roundTo(computePhaseDegrees(re, im));

    result.push({ index: n, re, im, magnitude: mag, phase });
  }

  return result;
}

// ============== Input Parsing ==============
export function parseSequenceString(raw) {
  if (!raw || typeof raw !== 'string') return [];
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
