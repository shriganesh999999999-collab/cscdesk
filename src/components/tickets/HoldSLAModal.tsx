import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Ticket, SLAPauseReason } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { PauseCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

interface HoldSLAModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onHoldApplied: (updatedTicket: Ticket) => void;
}

export const HoldSLAModal: React.FC<HoldSLAModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onHoldApplied,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  const [reason, setReason] = useState<SLAPauseReason>('Waiting for Approved Maintenance Window');
  const [justification, setJustification] = useState('');
  const [expectedResumeTime, setExpectedResumeTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const APPROVED_REASONS: SLAPauseReason[] = [
    'Waiting for Requester',
    'Waiting for Approved Maintenance Window',
    'Waiting for Third Party',
    'Waiting for OEM',
    'Waiting for Vendor',
    'Waiting for Business Approval',
    'Waiting for Security Approval',
    'Waiting for External Dependency',
    'Planned Activity',
    'Force Majeure',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!justification || justification.trim().length < 10) {
      showToast('error', 'Audit Validation Error', 'A comprehensive justification (minimum 10 characters) is mandatory.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await api.pauseSLA(
        ticket.id,
        reason,
        justification,
        expectedResumeTime,
        currentUser
      );
      showToast(
        'warning',
        'SLA Clock Paused',
        `Ticket placed on hold. Reason: ${reason}. Event recorded in immutable SLA clock timeline.`
      );
      onHoldApplied(updated);
      onClose();
    } catch (err: any) {
      showToast('error', 'Hold Rejected by Policy', err?.message || 'Failed to pause SLA');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pause SLA Clock: ${ticket.ticketNumber}`}
      subtitle="Controlled SLA suspension under strict ITIL compliance rules"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-300">
        {/* Compliance Warning Banner */}
        <div className="p-3 bg-amber-950/70 border border-amber-800/80 rounded-lg flex items-start space-x-2 text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-semibold text-amber-300">CISO & Audit Control Policy:</span> Pausing the SLA clock freezes target countdown and extends breach deadlines. Every hold event requires approved business justification and is visible in vendor invoice audits and monthly SLA reporting.
          </div>
        </div>

        {/* Reason Dropdown */}
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Approved Hold Reason *</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as SLAPauseReason)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100"
          >
            {APPROVED_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Expected Resume Time */}
        <div>
          <label className="block text-slate-400 mb-1 font-medium">
            Expected Resume Target (Date / Maintenance Window)
          </label>
          <input
            type="text"
            value={expectedResumeTime}
            onChange={(e) => setExpectedResumeTime(e.target.value)}
            placeholder="e.g. Tonight 02:00 UTC or 2026-09-16 09:00 AM"
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100"
          />
        </div>

        {/* Mandatory Justification */}
        <div>
          <label className="block text-slate-400 mb-1 font-medium">
            Audit Justification & Technical Evidence * (min 10 characters)
          </label>
          <textarea
            rows={3}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Explain why progress is blocked and why internal engineering cannot proceed without this external dependency..."
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 focus:border-amber-500 focus:outline-none"
            required
          />
        </div>

        {/* Actions */}
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
            className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-md transition disabled:opacity-50 flex items-center space-x-1.5"
          >
            <PauseCircle className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Validating Policy...' : 'Pause SLA Clock'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
