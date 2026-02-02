import React from 'react';
import { OPERATIONS } from '../config/operations';

const colorMap = {
  sky: 'bg-gradient-to-r from-sky-500 to-cyan-400',
  purple: 'bg-gradient-to-r from-purple-500 to-violet-400',
  emerald: 'bg-gradient-to-r from-emerald-500 to-teal-400',
  amber: 'bg-gradient-to-r from-amber-500 to-yellow-400',
  rose: 'bg-gradient-to-r from-rose-500 to-pink-400',
};

export default function OperationToolbar({ operation, setOperation }) {
  const operationsList = Object.values(OPERATIONS);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
        Mode:
      </span>
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
        {operationsList.map((op) => {
          const isActive = operation === op.id;
          const gradientClass = colorMap[op.color] || colorMap.sky;

          return (
            <button
              key={op.id}
              type="button"
              onClick={() => setOperation(op.id)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? `${gradientClass} text-white shadow`
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span className="text-sm">{op.icon}</span>
              <span>{op.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
