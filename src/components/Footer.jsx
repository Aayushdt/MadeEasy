import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/90 dark:border-slate-800/80 dark:bg-slate-950/90 mt-8 transition-colors">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        <p className="order-2 sm:order-1">MadeEasy © Signal Processing Simplified</p>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="order-1 sm:order-2 hover:text-sky-300 hover:underline transition-colors"
        >
          View source / contribute
        </a>
      </div>
    </footer>
  );
}
