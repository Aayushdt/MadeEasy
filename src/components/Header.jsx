import React, { useCallback } from 'react';

export default function Header({ theme, onToggleTheme }) {
  const handleThemeToggle = useCallback(() => {
    onToggleTheme();
  }, [onToggleTheme]);

  return (
    <header 
      className="border-b border-slate-200 bg-white/90 dark:border-slate-800/70 dark:bg-slate-950/80 backdrop-blur sticky top-0 z-50 transition-colors"
      role="banner"
    >
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              <span className="text-sky-500">Made</span>
              <span>Easy</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Signal Processing Made Simple
            </p>
          </div>
          <button
            type="button"
            onClick={handleThemeToggle}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 shadow-sm hover:border-sky-400 hover:text-sky-700 hover:bg-white transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-sky-200"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            aria-pressed={theme === 'dark'}
          >
            <span className="hidden sm:inline">Theme</span>
            <span
              aria-hidden="true"
              className="flex h-5 w-10 items-center rounded-full bg-slate-200 dark:bg-slate-800 p-0.5 transition-transform"
            >
              <span
                className={`h-4 w-4 rounded-full bg-sky-500 shadow transition-transform ${
                  theme === 'dark' ? 'translate-x-5' : ''
                }`}
              />
            </span>
            <span className="uppercase tracking-wide text-[0.65rem] sm:text-[0.7rem] text-slate-400">
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
