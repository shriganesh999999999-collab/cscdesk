import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Ticket, User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { ALL_ORGANIZATION_USERS } from '../../services/mockData';
import { UserCheck, AlertCircle } from 'lucide-react';

interface ReassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onReassigned: (updatedTicket: Ticket) => void;
}

export const ReassignModal: React.FC<ReassignModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onReassigned,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  const [toTeam, setToTeam] = useState('Cloud Operations Team');
  const [toEngineerId, setToEngineerId] = useState('');
  const [reason, setReason] = useState('L1 cannot resolve - Requires L2 Specialist');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available teams
  const teams = [
    'Cloud Operations Team',
    'Network & Security',
    'Database Administration',
    'NOC & Monitoring',
    'IT Service Desk',
    'Core Infrastructure L3',
    'Data Center Facilities',
    'Information Security',
    'Backup & Storage',
  ];

  // Engineers filtered by team or all available
  const availableEngineers = ALL_ORGANIZATION_USERS.filter((u) => u.isActive);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) {
      showToast('error', 'Validation Error', 'Reassignment justification/comments are required.');
      return;
    }

    const engineer = ALL_ORGANIZATION_USERS.find((u) => u.id === toEngineerId);
    const toEngineerName = engineer ? engineer.name : 'Team Queue Dispatch';

    setIsSubmitting(true);
    try {
      const updated = await api.reassignTicket(
        ticket.id,
        toTeam,
        toEngineerId,
        toEngineerName,
        reason,
        comments,
        currentUser
      );
      showToast(
        'success',
        'Ticket Reassigned',
        `Reassigned to ${toTeam} (${toEngineerName}). SLA clock preserved.`
      );
      onReassigned(updated);
      onClose();
    } catch (err: any) {
      showToast('error', 'Reassignment Failed', err?.message || 'Error reassigning ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reassign Ticket: ${ticket.ticketNumber}`}
      subtitle="Transfer ticket ownership while preserving the original SLA clock"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-300">
        {/* SLA Preservation Notice */}
        <div className="p-3 bg-sky-950/60 border border-sky-800/80 rounded-lg flex items-start space-x-2 text-sky-200">
          <AlertCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <p className="text-[11px]">
            <span className="font-semibold">SLA Continuity Notice:</span> Reassigning a ticket preserves the original SLA target and elapsed time. The clock does NOT reset.
          </p>
        </div>

        {/* Current Assignment (Read-only) */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase">Current Assignment Group</span>
            <p className="font-semibold text-slate-200 mt-0.5">{ticket.currentAssignmentGroup}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase">Current Assignee</span>
            <p className="font-semibold text-slate-200 mt-0.5">
              {ticket.currentAssigneeName || 'Unassigned / Queue'}
            </p>
          </div>
        </div>

        {/* Target Assignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Target Support Team *</label>
            <select
              value={toTeam}
              onChange={(e) => setToTeam(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100"
            >
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Target Engineer (Optional)</label>
            <select
              value={toEngineerId}
              onChange={(e) => setToEngineerId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100"
            >
              <option value="">-- Assign to Team Queue --</option>
              {availableEngineers.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Reassignment Reason *</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100"
          >
            <option value="L1 cannot resolve - Requires L2 Specialist">L1 cannot resolve - Requires L2 Specialist</option>
            <option value="L2 cannot resolve - Requires L3 Core Architect">L2 cannot resolve - Requires L3 Core Architect</option>
            <option value="Wrong team assigned initially">Wrong team assigned initially</option>
            <option value="Specialist expertise required">Specialist expertise required</option>
            <option value="Assigned engineer unavailable / on leave">Assigned engineer unavailable / on leave</option>
            <option value="Workload balancing">Workload balancing</option>
          </select>
        </div>

        {/* Comments */}
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Handover Notes & Technical Context *</label>
          <textarea
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Explain what has been verified, why handoff is needed, and any troubleshooting logs..."
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 focus:border-sky-500 focus:outline-none text-xs"
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
            className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-md transition disabled:opacity-50"
          >
            {isSubmitting ? 'Transferring...' : 'Execute Reassignment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
