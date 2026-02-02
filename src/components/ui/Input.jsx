import React from 'react';

export function Input({
  label,
  type = 'number',
  value,
  onChange,
  placeholder,
  min,
  max,
  className = '',
  error,
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        className={`w-full rounded-lg border bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
          error 
            ? 'border-rose-300 dark:border-rose-600 focus:ring-rose-500' 
            : 'border-slate-200 dark:border-slate-700'
        }`}
      />
      {error && (
        <p className="mt-1 text-xs text-rose-500">{error}</p>
      )}
    </div>
  );
}

export default Input;
