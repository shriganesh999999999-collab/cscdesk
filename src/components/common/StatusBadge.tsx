import React from 'react';
import { TicketStatus, PriorityLevel } from '../../types';

interface StatusBadgeProps {
  status: TicketStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  const getStatusConfig = (st: TicketStatus) => {
    switch (st) {
      case 'DRAFT':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'SUBMITTED':
      case 'QUEUED':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/60';
      case 'PENDING_APPROVAL':
      case 'PENDING_SECURITY':
      case 'PENDING_REQUESTER':
      case 'PENDING_VENDOR':
      case 'PENDING_THIRD_PARTY':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
      case 'APPROVED':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
      case 'ASSIGNED':
      case 'ACKNOWLEDGED':
      case 'IN_PROGRESS':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60';
      case 'WAITING_FOR_CHANGE_WINDOW':
      case 'PLANNED':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
      case 'ON_HOLD':
        return 'bg-amber-900/90 text-amber-200 border-amber-600 font-semibold';
      case 'RESOLVED':
        return 'bg-emerald-900/80 text-emerald-200 border-emerald-700 font-semibold';
      case 'CLOSED':
        return 'bg-slate-800/90 text-slate-400 border-slate-700';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/60';
      case 'RECALLED':
        return 'bg-amber-950/90 text-orange-300 border-orange-700/80';
      case 'REOPENED':
        return 'bg-rose-900/90 text-rose-200 border-rose-600 font-bold';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const formatText = (st: TicketStatus) => {
    return st.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border tracking-wide uppercase font-mono ${sizeClasses} ${getStatusConfig(
        status
      )}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80 animate-pulse" />
      {formatText(status)}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: PriorityLevel; showLabel?: boolean }> = ({
  priority,
  showLabel = true,
}) => {
  const getPriorityClasses = () => {
    switch (priority) {
      case 'P1':
        return 'bg-rose-950/90 text-rose-200 border-rose-600 font-bold';
      case 'P2':
        return 'bg-amber-950/90 text-amber-200 border-amber-600 font-semibold';
      case 'P3':
        return 'bg-sky-950/80 text-sky-300 border-sky-700';
      case 'P4':
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getPriorityLabel = () => {
    switch (priority) {
      case 'P1':
        return 'Critical';
      case 'P2':
        return 'High';
      case 'P3':
        return 'Medium';
      case 'P4':
        return 'Low';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border ${getPriorityClasses()}`}
    >
      <span>{priority}</span>
      {showLabel && <span className="ml-1 opacity-90 font-sans font-normal">({getPriorityLabel()})</span>}
    </span>
  );
};
