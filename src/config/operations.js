// Operation configuration - easy to add new operations here
export const OPERATIONS = {
  dft: {
    id: 'dft',
    name: 'DFT',
    fullName: 'Discrete Fourier Transform',
    description: 'Transform time-domain signal to frequency domain',
    icon: '📊',
    color: 'sky',
    inputs: 'sequence',
    outputs: 'frequency',
  },
  idft: {
    id: 'idft',
    name: 'IDFT',
    fullName: 'Inverse Discrete Fourier Transform',
    description: 'Transform frequency spectrum back to time domain',
    icon: '📈',
    color: 'purple',
    inputs: 'frequency',
    outputs: 'sequence',
  },
  fft: {
    id: 'fft',
    name: 'FFT',
    fullName: 'Fast Fourier Transform',
    description: 'Fast O(N log N) frequency transform',
    icon: '⚡',
    color: 'amber',
    inputs: 'sequence',
    outputs: 'frequency',
  },
  twiddle: {
    id: 'twiddle',
    name: 'Twiddle Factor',
    fullName: 'Twiddle Factor (W_N^kn)',
    description: 'Calculate the twiddle factor for specific k, n values',
    icon: '🧮',
    color: 'emerald',
    inputs: 'kn',
    outputs: 'complex',
  },
  circularConv: {
    id: 'circularConv',
    name: 'Circular Conv',
    fullName: 'Circular Convolution',
    description: 'Convolution of two periodic sequences',
    icon: '🔄',
    color: 'rose',
    inputs: 'twoSequences',
    outputs: 'sequence',
  },
};

// Operation registry - maps operation ID to its implementation
export const OPERATION_IMPLEMENTATIONS = {
  dft: {
    needsSequence: true,
    needsN: true,
    hasResults: true,
    hasChart: true,
  },
  idft: {
    needsSequence: true,
    needsN: true,
    hasResults: true,
    hasChart: true,
  },
  fft: {
    needsSequence: true,
    needsN: true,
    hasResults: true,
    hasChart: true,
  },
  twiddle: {
    needsSequence: false,
    needsN: true,
    needsK: true,
    needsN_param: true,
    hasResults: true,
    hasChart: false,
  },
  circularConv: {
    needsSequence: true,
    needsN: true,
    needsSecondSequence: true,
    hasResults: true,
    hasChart: true,
  },
};

export const getOperationConfig = (operationId) => OPERATIONS[operationId] || OPERATIONS.dft;

export const getOperationImpl = (operationId) => OPERATION_IMPLEMENTATIONS[operationId] || OPERATION_IMPLEMENTATIONS.dft;
