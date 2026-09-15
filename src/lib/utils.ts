import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatDurationMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hrs = Math.floor(minutes / 60);
  const rem = Math.round(minutes % 60);
  if (rem === 0) return `${hrs}h`;
  return `${hrs}h ${rem}m`;
}

export function calculateSLARemaining(targetIso: string, isPaused: boolean): {
  remainingMinutes: number;
  formatted: string;
  isBreached: boolean;
  statusColor: 'green' | 'amber' | 'red';
} {
  const now = new Date().getTime();
  const target = new Date(targetIso).getTime();
  const diffMs = target - now;
  const remainingMinutes = Math.round(diffMs / (1000 * 60));

  const isBreached = remainingMinutes <= 0;
  const absRemaining = Math.abs(remainingMinutes);

  let formatted = '';
  if (isBreached) {
    formatted = `Breached by ${formatDurationMinutes(absRemaining)}`;
  } else {
    formatted = `${formatDurationMinutes(absRemaining)} left`;
  }

  let statusColor: 'green' | 'amber' | 'red' = 'green';
  if (isBreached) {
    statusColor = 'red';
  } else if (remainingMinutes < 60) {
    statusColor = 'amber';
  }

  return {
    remainingMinutes,
    formatted,
    isBreached,
    statusColor,
  };
}
