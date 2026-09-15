import React, { useState } from 'react';
import { Ticket, ApprovalStep } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { formatDateTime } from '../../lib/utils';
import { PriorityBadge, StatusBadge } from '../common/StatusBadge';
import {
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  CheckSquare,
  ShieldAlert,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface ApprovalsViewProps {
  tickets: Ticket[];
  onSelectTicket: (ticketId: string) => void;
  onRefresh: () => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  tickets,
  onSelectTicket,
  onRefresh,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  const [filterState, setFilterState] = useState<'PENDING' | 'HISTORY'>('PENDING');
  const [rejectionModalData, setRejectionModalData] = useState<{
    ticketId: string;
    stepId: string;
    action: 'REJECT' | 'SEND_BACK';
  } | null>(null);
  const [rejectComments, setRejectComments] = useState('');

  // Extract approvals
  interface FlattenedApproval {
    ticket: Ticket;
    step: ApprovalStep;
  }

  const allApprovals: FlattenedApproval[] = [];
  tickets.forEach((t) => {
    t.approvals.forEach((step) => {
      allApprovals.push({ ticket: t, step });
    });
  });

  const pendingApprovals = allApprovals.filter(({ step }) => {
    if (step.status !== 'PENDING') return false;
    if (currentUser.role === 'Super Admin') return true;
    if (step.approverUserId === currentUser.id) return true;
    if (step.approverRole === currentUser.role) return true;
    return false;
  });

  const historyApprovals = allApprovals.filter(
    ({ step }) => step.status === 'APPROVED' || step.status === 'REJECTED'
  );

  const handleApprove = async (ticketId: string, stepId: string) => {
    try {
      await api.submitApproval(ticketId, stepId, 'APPROVE', 'Approved by authorized officer', currentUser);
      showToast('success', 'Approved', 'Approval step marked approved. Ticket progressed.');
      onRefresh();
    } catch (err: any) {
      showToast('error', 'Approval Error', err?.message);
    }
  };

  const handleConfirmRejection = async () => {
    if (!rejectionModalData) return;
    if (!rejectComments.trim()) {
      showToast('error', 'Validation Error', 'Justification comments are mandatory for rejection or send-back.');
      return;
    }

    try {
      await api.submitApproval(
        rejectionModalData.ticketId,
        rejectionModalData.stepId,
        rejectionModalData.action,
        rejectComments,
        currentUser
      );
      showToast(
        rejectionModalData.action === 'REJECT' ? 'error' : 'warning',
        rejectionModalData.action === 'REJECT' ? 'Request Rejected' : 'Sent Back for Clarification',
        'Audit trail updated.'
      );
      setRejectionModalData(null);
      setRejectComments('');
      onRefresh();
    } catch (err: any) {
      showToast('error', 'Rejection Error', err?.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-sky-400" />
            <span>Governance & Access Approvals</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Review and clear role-based approvals for VM Provisioning, Firewall Port Openings, and Changes
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setFilterState('PENDING')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              filterState === 'PENDING'
                ? 'bg-sky-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Action ({pendingApprovals.length})
          </button>
          <button
            onClick={() => setFilterState('HISTORY')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              filterState === 'HISTORY'
                ? 'bg-sky-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Approval History ({historyApprovals.length})
          </button>
        </div>
      </div>

      {/* Persona Notice */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-sky-400" />
          <span>
            Acting as: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role} - {currentUser.team})
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          Approvals reflect authorized role hierarchy (Section 19)
        </span>
      </div>

      {/* List Area */}
      {filterState === 'PENDING' ? (
        <div className="space-y-3">
          {pendingApprovals.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">All caught up! No pending approvals.</p>
              <p className="text-xs text-slate-500 mt-1">
                You have cleared all governance requests awaiting your designation.
              </p>
            </div>
          ) : (
            pendingApprovals.map(({ ticket, step }) => (
              <div
                key={step.id}
                className="bg-slate-900 border border-slate-750 hover:border-slate-700 rounded-xl p-4 shadow-md transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-sky-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {ticket.ticketNumber}
                      </span>
                      <PriorityBadge priority={ticket.priority} />
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium">
                        {ticket.ticketType}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono font-bold">
                        Pending: {step.stageName} ({step.approverRole})
                      </span>
                    </div>

                    <h3
                      onClick={() => onSelectTicket(ticket.id)}
                      className="text-sm font-semibold text-slate-100 hover:text-sky-300 cursor-pointer transition line-clamp-1"
                    >
                      {ticket.title}
                    </h3>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {ticket.description}
                    </p>

                    <div className="flex items-center space-x-4 text-[11px] text-slate-500 font-mono mt-2">
                      <span>Requester: <strong className="text-slate-300">{ticket.requesterName}</strong></span>
                      <span>•</span>
                      <span>Department: <strong className="text-slate-300">{ticket.department}</strong></span>
                      <span>•</span>
                      <span>Submitted: {formatDateTime(ticket.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center space-x-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <button
                      onClick={() => onSelectTicket(ticket.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-medium transition"
                    >
                      Inspect Details
                    </button>
                    <button
                      onClick={() =>
                        setRejectionModalData({ ticketId: ticket.id, stepId: step.id, action: 'SEND_BACK' })
                      }
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 rounded-lg text-xs font-medium transition"
                    >
                      Send Back
                    </button>
                    <button
                      onClick={() =>
                        setRejectionModalData({ ticketId: ticket.id, stepId: step.id, action: 'REJECT' })
                      }
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(ticket.id, step.id)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* History list */
        <div className="space-y-2.5">
          {historyApprovals.map(({ ticket, step }) => (
            <div
              key={step.id}
              onClick={() => onSelectTicket(ticket.id)}
              className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 transition cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-sky-400">{ticket.ticketNumber}</span>
                  <span className="text-xs font-medium text-slate-200">{step.stageName}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      step.status === 'APPROVED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {step.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xl">{ticket.title}</p>
                {step.comments && (
                  <p className="text-[11px] text-slate-400 italic mt-0.5">"{step.comments}"</p>
                )}
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {step.actionDate ? formatDateTime(step.actionDate) : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Mandatory Rejection Comment Modal */}
      {rejectionModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-100">
              {rejectionModalData.action === 'REJECT'
                ? 'Reject Request (Mandatory Justification)'
                : 'Send Back for Clarification (Comments Required)'}
            </h3>
            <p className="text-slate-400 text-[11px]">
              Provide clear feedback to the requester regarding why this governance step was declined or requires modification.
            </p>
            <textarea
              rows={3}
              value={rejectComments}
              onChange={(e) => setRejectComments(e.target.value)}
              placeholder="Enter mandatory justification here..."
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-sky-500"
              required
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectionModalData(null);
                  setRejectComments('');
                }}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded"
              >
                Submit Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
