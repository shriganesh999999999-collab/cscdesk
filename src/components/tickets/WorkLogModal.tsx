import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Ticket } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Clock, Lock, CheckCircle2 } from 'lucide-react';

interface WorkLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onWorkLogAdded: (updatedTicket: Ticket) => void;
}

export const WorkLogModal: React.FC<WorkLogModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onWorkLogAdded,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  const [minutesSpent, setMinutesSpent] = useState(45);
  const [activity, setActivity] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [requesterNote, setRequesterNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim() || !actionTaken.trim()) {
      showToast('error', 'Validation Error', 'Activity summary and Action Taken are mandatory.');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - minutesSpent * 60 * 1000).toISOString();
      const endTime = now.toISOString();

      const updated = await api.addWorkLog(
        ticket.id,
        {
          startTime,
          endTime,
          minutesSpent: Number(minutesSpent),
          activity,
          actionTaken,
          isPrivate,
          requesterNote: isPrivate ? undefined : requesterNote,
        },
        currentUser
      );

      showToast('success', 'Worklog Logged', `${minutesSpent} minutes registered to ${ticket.ticketNumber}.`);
      onWorkLogAdded(updated);
      onClose();
    } catch (err: any) {
      showToast('error', 'Worklog Error', err?.message || 'Failed to add worklog');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Log Engineering Time: ${ticket.ticketNumber}`}
      subtitle="Accurate effort tracking for operational KPIs and capacity reporting"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-300">
        <div>
          <label className="block text-slate-400 mb-1 font-medium flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 text-sky-400" />
            Minutes Spent *
          </label>
          <input
            type="number"
            min={5}
            max={1440}
            step={5}
            value={minutesSpent}
            onChange={(e) => setMinutesSpent(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 font-mono text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">Activity Details *</label>
          <textarea
            rows={2}
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="e.g. Analyzed MySQL slow query log, executed EXPLAIN on queries..."
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 focus:border-sky-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">Action Taken / Resolution Step *</label>
          <input
            type="text"
            value={actionTaken}
            onChange={(e) => setActionTaken(e.target.value)}
            placeholder="e.g. Added composite index on transactions(account_id, created_at)"
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 focus:border-sky-500 focus:outline-none"
            required
          />
        </div>

        <div className="flex items-center space-x-2 pt-1">
          <input
            type="checkbox"
            id="isPrivate"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="rounded bg-slate-900 border-slate-700 text-sky-600 focus:ring-0"
          />
          <label htmlFor="isPrivate" className="text-slate-300 font-medium cursor-pointer flex items-center">
            <Lock className="w-3.5 h-3.5 mr-1 text-amber-400" />
            Private / Internal Worklog (Hidden from requester)
          </label>
        </div>

        {!isPrivate && (
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Requester-Visible Note (Optional)</label>
            <input
              type="text"
              value={requesterNote}
              onChange={(e) => setRequesterNote(e.target.value)}
              placeholder="Brief non-technical note visible to customer..."
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100"
            />
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-md transition disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Record Worklog'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
