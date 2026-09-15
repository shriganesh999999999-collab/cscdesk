import React, { useState, useEffect } from 'react';
import { SLAInstance } from '../../types';
import { calculateSLARemaining } from '../../lib/utils';
import { Clock, PauseCircle, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface SLACountdownProps {
  sla: SLAInstance;
  compact?: boolean;
}

export const SLACountdown: React.FC<SLACountdownProps> = ({ sla, compact = false }) => {
  const [, setTick] = useState(0);

  // Update timer every 30 seconds for live countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (sla.isPaused) {
    return (
      <div className={`inline-flex items-center text-xs font-mono font-medium text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/80 ${compact ? 'py-0.5' : ''}`}>
        <PauseCircle className="w-3.5 h-3.5 mr-1.5 text-amber-400 shrink-0" />
        <span>SLA PAUSED</span>
        {!compact && sla.pauseReason && (
          <span className="ml-1.5 text-amber-400/80 text-[11px] font-sans truncate max-w-[140px]">
            ({sla.pauseReason})
          </span>
        )}
      </div>
    );
  }

  if (sla.resolutionSLAEnd && !sla.isBreached) {
    return (
      <div className="inline-flex items-center text-xs font-mono font-medium text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400 shrink-0" />
        <span>SLA MET</span>
      </div>
    );
  }

  const { remainingMinutes, formatted, isBreached, statusColor } = calculateSLARemaining(
    sla.resolutionSLATarget,
    sla.isPaused
  );

  const totalMinutes = sla.resolutionTargetMinutes || 480;
  const consumedMinutes = totalMinutes - remainingMinutes;
  const pct = Math.min(100, Math.max(0, Math.round((consumedMinutes / totalMinutes) * 100)));

  return (
    <div className={`flex flex-col ${compact ? 'w-28' : 'w-44'}`}>
      <div className="flex items-center justify-between text-xs font-mono mb-1">
        <div className="flex items-center">
          {isBreached ? (
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400 mr-1 shrink-0 animate-bounce" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
          )}
          <span
            className={`font-semibold ${
              statusColor === 'red'
                ? 'text-rose-400'
                : statusColor === 'amber'
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {formatted}
          </span>
        </div>
      </div>
      {/* Progress track */}
      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-slate-700/50">
        <div
          className={`h-full transition-all duration-500 ${
            statusColor === 'red'
              ? 'bg-rose-500'
              : statusColor === 'amber'
              ? 'bg-amber-500'
              : 'bg-emerald-500'
          }`}
          style={{ width: `${isBreached ? 100 : pct}%` }}
        />
      </div>
    </div>
  );
};
