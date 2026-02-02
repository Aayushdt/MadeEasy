import React from 'react';

export function Card({ children, className = '', variant = 'default' }) {
  const variants = {
    default: 'glass-panel',
    bordered: 'border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl',
    elevated: 'bg-white dark:bg-slate-800 shadow-lg rounded-xl',
  };

  return (
    <div className={`${variants[variant]} p-4 sm:p-5 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, icon: Icon }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10">
            <Icon className="h-5 w-5 text-sky-500" />
          </div>
        )}
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Card;
