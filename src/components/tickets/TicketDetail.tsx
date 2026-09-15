import React, { useState } from 'react';
import { Ticket, ApprovalStep, TicketTask, WorkLog } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { SLACountdown } from '../common/SLACountdown';
import { formatDateTime, formatDurationMinutes } from '../../lib/utils';
import { ReassignModal } from './ReassignModal';
import { HoldSLAModal } from './HoldSLAModal';
import { WorkLogModal } from './WorkLogModal';
import { CreateKBFromResolutionModal } from './CreateKBFromResolutionModal';
import {
  ArrowLeft,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  CheckSquare,
  Server,
  Shield,
  FileText,
  Key,
  BookOpen,
  Send,
  Lock,
  Eye,
  EyeOff,
  History,
  CornerUpLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface TicketDetailProps {
  ticket: Ticket;
  onBack: () => void;
  onTicketUpdated: (updatedTicket: Ticket) => void;
}

export const TicketDetail: React.FC<TicketDetailProps> = ({
  ticket,
  onBack,
  onTicketUpdated,
}) => {
  const { currentUser, hasPermission } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'activity' | 'tasks' | 'approvals' | 'sla' | 'worklogs' | 'audit'
  >('overview');

  // Modals state
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [isHoldOpen, setIsHoldOpen] = useState(false);
  const [isWorkLogOpen, setIsWorkLogOpen] = useState(false);
  const [isKbOpen, setIsKbOpen] = useState(false);

  // Quick Resolve Dialog
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [resSummary, setResSummary] = useState('');
  const [resCode, setResCode] = useState('Configuration Tuning & Process Termination');
  const [resWorkaround, setResWorkaround] = useState('');

  // Reopen / Accept Dialog
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [csatRating, setCsatRating] = useState(5);
  const [confirmFeedback, setConfirmFeedback] = useState('');

  // Approval rejection modal
  const [rejectStepId, setRejectStepId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Credential Handover reveal
  const [showPassword, setShowPassword] = useState(false);

  // Handlers
  const handleApprovalAction = async (
    stepId: string,
    action: 'APPROVE' | 'REJECT' | 'SEND_BACK',
    comments?: string
  ) => {
    try {
      const updated = await api.submitApproval(
        ticket.id,
        stepId,
        action,
        comments || 'Approved by authorized officer',
        currentUser
      );
      showToast(
        action === 'APPROVE' ? 'success' : action === 'REJECT' ? 'error' : 'warning',
        `Approval Step: ${action}`,
        `Ticket ${ticket.ticketNumber} updated.`
      );
      onTicketUpdated(updated);
    } catch (err: any) {
      showToast('error', 'Approval Action Failed', err?.message || 'Error executing approval');
    }
  };

  const handleResumeSLA = async () => {
    try {
      const updated = await api.resumeSLA(
        ticket.id,
        'External hold cleared by engineer. Resumed active resolution work.',
        currentUser
      );
      showToast('success', 'SLA Resumed', 'Resolution countdown active.');
      onTicketUpdated(updated);
    } catch (err: any) {
      showToast('error', 'Error Resuming SLA', err?.message);
    }
  };

  const handleRecall = async () => {
    const reason = prompt('Please enter justification for recalling this ticket:');
    if (reason === null) return;
    try {
      const updated = await api.recallTicket(ticket.id, reason || 'Recalled by requester', currentUser);
      showToast('info', 'Ticket Recalled', 'Ticket pulled back to RECALLED status. You can edit or cancel.');
      onTicketUpdated(updated);
    } catch (err: any) {
      showToast('error', 'Recall Failed', err?.message);
    }
  };

  const handleExecuteResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resSummary.trim()) {
      showToast('error', 'Validation Error', 'Resolution summary is mandatory.');
      return;
    }
    try {
      const updated = await api.resolveTicket(ticket.id, resSummary, resCode, resWorkaround, currentUser);
      showToast('success', 'Ticket Resolved', 'Resolution recorded. Requester confirmation requested.');
      setIsResolveDialogOpen(false);
      onTicketUpdated(updated);
    } catch (err: any) {
      showToast('error', 'Resolve Failed', err?.message);
    }
  };

  const handleExecuteConfirmation = async (action: 'ACCEPT' | 'REOPEN') => {
    try {
      const updated = await api.confirmResolution(ticket.id, action, confirmFeedback, csatRating, currentUser);
      showToast(
        action === 'ACCEPT' ? 'success' : 'warning',
        action === 'ACCEPT' ? 'Resolution Accepted' : 'Ticket Reopened',
        action === 'ACCEPT' ? 'Ticket formally closed with CSAT rating.' : 'Reopened for investigation.'
      );
      setIsConfirmDialogOpen(false);
      onTicketUpdated(updated);
    } catch (err: any) {
      showToast('error', 'Action Failed', err?.message);
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    const summary = prompt('Enter task completion notes / telemetry output:');
    if (summary === null) return;
    try {
      const updated = await api.completeTask(ticket.id, taskId, summary || 'Completed by engineer', currentUser);
      showToast('success', 'Work Order Completed', 'Task marked finished. Next dependent task activated.');
      onTicketUpdated(updated);
    } catch (err: any) {
      showToast('error', 'Task Update Failed', err?.message);
    }
  };

  const handleDeliverCredentials = async () => {
    try {
      const updated = await api.deliverCredentials(ticket.id, 'svc-app-admin', currentUser);
      showToast('info', 'Credentials Handed Over', 'Temporary credentials delivered via secure channel.');
      onTicketUpdated(updated);
    } catch (err: any) {
      showToast('error', 'Error', err?.message);
    }
  };

  const handleAcknowledgeCredentials = async () => {
    try {
      const updated = await api.acknowledgeCredentials(ticket.id, currentUser);
      showToast('success', 'Credentials Acknowledged', 'Confirmed receipt by requester.');
      onTicketUpdated(updated);
    } catch (err: any) {
      showToast('error', 'Error', err?.message);
    }
  };

  const handleEscalate = async (level: 'L2' | 'L3' | 'Operations Manager') => {
    try {
      const updated = await api.escalateTicket(ticket.id, level, `Functional escalation to ${level}`, currentUser);
      showToast('warning', 'Ticket Escalated', `Escalated to ${level}. Single ticket and SLA preserved.`);
      onTicketUpdated(updated);
    } catch (err: any) {
      showToast('error', 'Escalation Failed', err?.message);
    }
  };

  // Eligibility check for Recall (Section 10)
  const canRecall =
    currentUser.id === ticket.requesterId &&
    ['SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'QUEUED'].includes(ticket.status);

  // Check if current user has a pending approval stage
  const pendingUserApproval = ticket.approvals.find(
    (a) =>
      a.status === 'PENDING' &&
      (a.approverUserId === currentUser.id ||
        (a.approverRole === 'Supervisor' && currentUser.role === 'Supervisor') ||
        (a.approverRole === 'Infra Head' && currentUser.role === 'Infra Head') ||
        (a.approverRole === 'CISO' && currentUser.role === 'CISO') ||
        (a.approverRole === 'Operations Manager' && currentUser.role === 'Operations Manager') ||
        currentUser.role === 'Super Admin')
  );

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-medium text-slate-400 hover:text-slate-100 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Ticket Queue</span>
        </button>

        <div className="flex items-center space-x-2">
          {canRecall && (
            <button
              onClick={handleRecall}
              className="px-3 py-1 text-xs font-semibold text-orange-300 bg-orange-950/80 hover:bg-orange-900 border border-orange-700/80 rounded-lg transition"
            >
              Recall / Pull-Back Ticket
            </button>
          )}

          {ticket.status === 'RESOLVED' && currentUser.id === ticket.requesterId && (
            <button
              onClick={() => setIsConfirmDialogOpen(true)}
              className="px-3.5 py-1 text-xs font-semibold text-emerald-300 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 rounded-lg transition"
            >
              Confirm / Reopen Resolution
            </button>
          )}
        </div>
      </div>

      {/* Ticket Master Header Card */}
      <div className="bg-slate-900 border border-slate-750 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className="font-mono text-sm font-bold text-sky-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                {ticket.ticketNumber}
              </span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                {ticket.ticketType}
              </span>
              {ticket.isMajorIncident && (
                <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold border border-rose-700 animate-pulse">
                  MAJOR INCIDENT
                </span>
              )}
            </div>
            <h1 className="text-lg font-bold text-slate-100">{ticket.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-2 font-mono">
              <span>Requester: <strong className="text-slate-200">{ticket.requesterName}</strong> ({ticket.department})</span>
              <span>•</span>
              <span>Team Queue: <strong className="text-slate-200">{ticket.currentAssignmentGroup}</strong></span>
              <span>•</span>
              <span>Assignee: <strong className="text-slate-200">{ticket.currentAssigneeName || 'Unassigned Queue'}</strong></span>
              {ticket.environment && (
                <>
                  <span>•</span>
                  <span>Env: <strong className="text-amber-300">{ticket.environment}</strong></span>
                </>
              )}
            </div>
          </div>

          {/* Right: SLA Countdown Box */}
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 shrink-0">
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Resolution SLA Timer</span>
            <SLACountdown sla={ticket.sla} />
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800/80">
          {/* Pending Approval Callout Action */}
          {pendingUserApproval && (
            <div className="flex items-center space-x-2 bg-amber-950/70 border border-amber-750 p-1.5 px-3 rounded-lg mr-2">
              <span className="text-xs text-amber-200 font-semibold">
                Action Required: {pendingUserApproval.stageName}
              </span>
              <button
                onClick={() => handleApprovalAction(pendingUserApproval.id, 'APPROVE')}
                className="px-2.5 py-0.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  setRejectStepId(pendingUserApproval.id);
                }}
                className="px-2.5 py-0.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded transition"
              >
                Reject...
              </button>
            </div>
          )}

          {/* SLA Pause / Resume Button */}
          {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
            <>
              {ticket.sla.isPaused ? (
                <button
                  onClick={handleResumeSLA}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 rounded-lg text-xs font-medium transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resume SLA Clock</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsHoldOpen(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 rounded-lg text-xs font-medium transition"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pause SLA Clock (Hold)</span>
                </button>
              )}
            </>
          )}

          {/* Reassign Ticket */}
          <button
            onClick={() => setIsReassignOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
          >
            <UserCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Reassign Ticket</span>
          </button>

          {/* Functional Escalation */}
          {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleEscalate('L2')}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition"
                title="Escalate from L1 to L2"
              >
                Escalate L1→L2
              </button>
              <button
                onClick={() => handleEscalate('L3')}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition"
                title="Escalate from L2 to L3 Core Architect"
              >
                Escalate L2→L3
              </button>
            </div>
          )}

          {/* Add Worklog */}
          <button
            onClick={() => setIsWorkLogOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Worklog</span>
          </button>

          {/* Resolve Ticket Button */}
          {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
            <button
              onClick={() => setIsResolveDialogOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition ml-auto"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Resolve Ticket</span>
            </button>
          )}

          {/* Create KB Article if Resolved */}
          {ticket.status === 'RESOLVED' && (
            <button
              onClick={() => setIsKbOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow transition ml-auto"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Create Knowledge Article from Resolution</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 space-x-1 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-sky-500 text-sky-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Overview & Telemetry
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2.5 font-medium border-b-2 transition whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'activity'
              ? 'border-sky-500 text-sky-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Activity Timeline</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
            {ticket.activities.length}
          </span>
        </button>

        {ticket.tasks.length > 0 && (
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2.5 font-medium border-b-2 transition whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'tasks'
                ? 'border-sky-500 text-sky-400 bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Work Orders ({ticket.tasks.length})</span>
          </button>
        )}

        {ticket.approvals.length > 0 && (
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2.5 font-medium border-b-2 transition whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'approvals'
                ? 'border-sky-500 text-sky-400 bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Approval Chain ({ticket.approvals.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('sla')}
          className={`px-4 py-2.5 font-medium border-b-2 transition whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'sla'
              ? 'border-sky-500 text-sky-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>SLA & OLA Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab('worklogs')}
          className={`px-4 py-2.5 font-medium border-b-2 transition whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'worklogs'
              ? 'border-sky-500 text-sky-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Work Logs ({ticket.worklogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-sky-500 text-sky-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Audit History
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-slate-900 border border-slate-750 rounded-xl p-5 text-xs text-slate-300 shadow">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Description Box */}
            <div>
              <h4 className="font-mono uppercase text-slate-400 text-[11px] font-semibold mb-2">
                Problem Description & Statement
              </h4>
              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 leading-relaxed whitespace-pre-wrap font-sans text-slate-200">
                {ticket.description || 'No detailed description provided.'}
              </div>
            </div>

            {/* Third-Party Dependency Attribution Box (Section 36 & Scenario 5) */}
            {ticket.thirdPartyDependency && (
              <div className="p-4 bg-purple-950/40 border border-purple-800/80 rounded-lg">
                <div className="flex items-center space-x-2 text-purple-300 font-semibold mb-2 text-sm">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>External Dependency & Downtime Attribution</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Attributed Root Cause:</span>
                    <strong className="text-amber-300 font-mono text-sm">
                      {ticket.thirdPartyDependency.delayAttribution}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">External Carrier / OEM:</span>
                    <strong className="text-slate-200">{ticket.thirdPartyDependency.providerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">External Ticket Ref:</span>
                    <span className="font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded">
                      {ticket.thirdPartyDependency.externalTicketNumber || 'N/A'}
                    </span>
                  </div>
                </div>
                {ticket.thirdPartyDependency.justification && (
                  <p className="mt-2 text-slate-300 bg-purple-950/60 p-2 rounded border border-purple-900 text-[11px]">
                    {ticket.thirdPartyDependency.justification}
                  </p>
                )}
              </div>
            )}

            {/* Credential Handover Workflow (Section 24) */}
            {ticket.credentialHandover && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-sky-400 font-semibold">
                    <Key className="w-4 h-4" />
                    <span>Secure Credential Handover Vault (Zero-Plaintext Policy)</span>
                  </div>
                  {ticket.credentialHandover.isHandedOver ? (
                    <span className="text-emerald-400 text-xs font-mono font-bold flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Delivered
                    </span>
                  ) : (
                    <span className="text-amber-400 text-xs font-mono">Pending Delivery</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Temporary Username</span>
                    <span className="font-mono text-slate-200 font-bold bg-slate-900 px-2 py-1 rounded inline-block mt-0.5">
                      {ticket.credentialHandover.temporaryUsername || 'svc-deploy'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Temporary Password</span>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="font-mono text-amber-300 font-bold bg-slate-900 px-2 py-1 rounded inline-block">
                        {showPassword ? 'T3mp_Pass!2026' : '••••••••••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {!ticket.credentialHandover.isHandedOver ? (
                      <button
                        onClick={handleDeliverCredentials}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-medium"
                      >
                        Generate & Deliver Credentials
                      </button>
                    ) : !ticket.credentialHandover.acknowledgedByRequester && currentUser.id === ticket.requesterId ? (
                      <button
                        onClick={handleAcknowledgeCredentials}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium"
                      >
                        Acknowledge Safe Receipt
                      </button>
                    ) : ticket.credentialHandover.acknowledgedByRequester ? (
                      <span className="text-emerald-400 text-xs font-mono">
                        ✓ Acknowledged by Requester
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            {/* Resolution Box if resolved */}
            {ticket.resolutionSummary && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-lg">
                <div className="flex items-center space-x-2 text-emerald-400 font-semibold mb-2 text-sm">
                  <CheckSquare className="w-4 h-4" />
                  <span>Technical Resolution Summary</span>
                </div>
                <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {ticket.resolutionSummary}
                </p>
                {ticket.resolutionWorkaround && (
                  <div className="mt-2 text-slate-300 font-mono text-[11px] bg-emerald-950/70 p-2 rounded border border-emerald-900">
                    <strong>Workaround:</strong> {ticket.resolutionWorkaround}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ACTIVITY TIMELINE TAB */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <h4 className="font-mono uppercase text-slate-400 text-[11px] font-semibold mb-2">
              Chronological Audit Activity Log ({ticket.activities.length} entries)
            </h4>
            <div className="relative pl-6 border-l border-slate-800 space-y-5">
              {ticket.activities.map((act) => (
                <div key={act.id} className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-3 h-3 rounded-full bg-sky-500 ring-4 ring-slate-900" />
                  <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-200">{act.action}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-750 text-[10px] text-sky-400 font-mono">
                          {act.actorName} ({act.actorRole})
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {formatDateTime(act.timestamp)}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs mt-1">{act.details}</p>
                    {act.oldValue && act.newValue && (
                      <div className="mt-1.5 flex items-center space-x-2 font-mono text-[11px] text-slate-400 bg-slate-900 p-1.5 rounded">
                        <span className="text-rose-400 line-through">{act.oldValue}</span>
                        <span>→</span>
                        <span className="text-emerald-400 font-bold">{act.newValue}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WORK ORDERS / CHILD TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-mono uppercase text-slate-400 text-[11px] font-semibold">
                Orchestrated Child Work Orders ({ticket.tasks.length})
              </h4>
            </div>

            <div className="space-y-2.5">
              {ticket.tasks.map((task, idx) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    task.status === 'COMPLETED'
                      ? 'bg-emerald-950/30 border-emerald-800/60'
                      : task.status === 'IN_PROGRESS'
                      ? 'bg-sky-950/40 border-sky-800/80 shadow'
                      : 'bg-slate-950/60 border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-sky-400">{task.taskNumber}</span>
                      <span className="font-semibold text-slate-100 text-xs">{task.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          task.status === 'COMPLETED'
                            ? 'bg-emerald-900 text-emerald-300'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-sky-900 text-sky-300 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono mt-2">
                      <span>Team: <strong className="text-slate-300">{task.team}</strong></span>
                      <span>•</span>
                      <span>OLA Target: <strong className="text-slate-300">{task.olaTargetHours}h</strong></span>
                      {task.completedBy && (
                        <>
                          <span>•</span>
                          <span>Completed by: <strong className="text-emerald-400">{task.completedBy}</strong></span>
                        </>
                      )}
                    </div>
                    {task.outputSummary && (
                      <p className="mt-1.5 text-xs text-emerald-300 font-mono bg-slate-900 p-1.5 rounded">
                        Output: {task.outputSummary}
                      </p>
                    )}
                  </div>

                  <div>
                    {task.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleTaskComplete(task.id)}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-medium transition"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPROVAL CHAIN TAB */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <h4 className="font-mono uppercase text-slate-400 text-[11px] font-semibold mb-2">
              Sequential Governance Approval Hierarchy
            </h4>
            <div className="space-y-2.5">
              {ticket.approvals.map((app, idx) => (
                <div
                  key={app.id}
                  className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs text-slate-500">Stage {idx + 1}:</span>
                      <span className="font-semibold text-slate-200">{app.stageName}</span>
                      <span className="text-xs text-slate-400">({app.approverRole})</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          app.status === 'APPROVED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : app.status === 'REJECTED'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">
                      Designated Approver: <strong className="text-slate-300">{app.approverName}</strong>
                    </p>
                    {app.comments && (
                      <p className="text-xs text-slate-300 mt-1 italic bg-slate-900 p-1.5 rounded">
                        "{app.comments}"
                      </p>
                    )}
                  </div>

                  {app.actionDate && (
                    <span className="text-[11px] font-mono text-slate-500">
                      {formatDateTime(app.actionDate)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLA & OLA TAB */}
        {activeTab === 'sla' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-[10px] uppercase font-mono text-slate-500">Priority Profile</span>
                <p className="text-base font-bold text-slate-100 font-mono mt-0.5">{ticket.sla.priority}</p>
                <p className="text-[10px] text-slate-400 mt-1">Response: {ticket.sla.responseTargetMinutes}m</p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-[10px] uppercase font-mono text-slate-500">Resolution Target</span>
                <p className="text-base font-bold text-slate-100 font-mono mt-0.5">
                  {formatDurationMinutes(ticket.sla.resolutionTargetMinutes)}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">{formatDateTime(ticket.sla.resolutionSLATarget)}</p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-[10px] uppercase font-mono text-slate-500">Paused Hold Duration</span>
                <p className="text-base font-bold text-amber-300 font-mono mt-0.5">
                  {formatDurationMinutes(ticket.sla.pausedMinutes || 0)}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Approved maintenance/hold</p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-[10px] uppercase font-mono text-slate-500">SLA Breach Status</span>
                <p
                  className={`text-base font-bold font-mono mt-0.5 ${
                    ticket.sla.isBreached ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {ticket.sla.isBreached ? 'BREACHED' : 'COMPLIANT'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Consumed: {Math.round(ticket.sla.percentageConsumed)}%
                </p>
              </div>
            </div>

            {/* SLA Clock Timeline Events */}
            <div>
              <h4 className="font-mono uppercase text-slate-400 text-[11px] font-semibold mb-2">
                Immutable SLA Clock Events ({ticket.sla.clockEvents?.length || 0})
              </h4>
              <div className="space-y-2">
                {ticket.sla.clockEvents?.map((clk) => (
                  <div
                    key={clk.id}
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-mono text-xs font-bold ${
                            clk.eventType === 'BREACHED'
                              ? 'text-rose-400'
                              : clk.eventType === 'PAUSED'
                              ? 'text-amber-400'
                              : clk.eventType === 'RESUMED'
                              ? 'text-sky-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {clk.eventType}
                        </span>
                        <span className="text-slate-300">by {clk.actorName}</span>
                        {clk.reason && <span className="text-amber-300">({clk.reason})</span>}
                      </div>
                      {clk.justification && (
                        <p className="text-slate-400 text-xs mt-0.5 font-mono">{clk.justification}</p>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">{formatDateTime(clk.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WORKLOGS TAB */}
        {activeTab === 'worklogs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-mono uppercase text-slate-400 text-[11px] font-semibold">
                Recorded Engineering Effort Logs ({ticket.worklogs.length})
              </h4>
              <button
                onClick={() => setIsWorkLogOpen(true)}
                className="px-2.5 py-1 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded transition"
              >
                + Log Work
              </button>
            </div>

            {ticket.worklogs.length === 0 ? (
              <p className="text-slate-500 text-center py-6">No engineering worklogs registered yet.</p>
            ) : (
              <div className="space-y-2">
                {ticket.worklogs.map((wkl) => (
                  <div key={wkl.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-200">{wkl.engineerName}</span>
                        <span className="text-slate-400 font-mono">({wkl.team})</span>
                        <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-mono text-[11px] font-bold">
                          {wkl.minutesSpent} mins
                        </span>
                        {wkl.isPrivate && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 text-[10px] font-mono">
                            INTERNAL ONLY
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">{formatDateTime(wkl.endTime)}</span>
                    </div>
                    <p className="text-slate-300 mt-1">{wkl.activity}</p>
                    <p className="text-slate-400 font-mono text-[11px] mt-1">
                      Action Taken: {wkl.actionTaken}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AUDIT TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <h4 className="font-mono uppercase text-slate-400 text-[11px] font-semibold">
              Immutable Governance Audit Trail
            </h4>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 font-mono text-xs">
              <p className="text-emerald-400 font-bold mb-2">✓ Forensic Audit Compliance Sealed</p>
              <p>Record ID: {ticket.id}</p>
              <p>Created: {formatDateTime(ticket.createdAt)}</p>
              <p>Updated: {formatDateTime(ticket.updatedAt)}</p>
              <p>All state changes, approvals, reassignments, and SLA pause events are cryptographically hashed and indexed in the organizational audit registry.</p>
            </div>
          </div>
        )}
      </div>

      {/* Reassign Modal */}
      <ReassignModal
        isOpen={isReassignOpen}
        onClose={() => setIsReassignOpen(false)}
        ticket={ticket}
        onReassigned={(upd) => onTicketUpdated(upd)}
      />

      {/* Hold / Pause SLA Modal */}
      <HoldSLAModal
        isOpen={isHoldOpen}
        onClose={() => setIsHoldOpen(false)}
        ticket={ticket}
        onHoldApplied={(upd) => onTicketUpdated(upd)}
      />

      {/* Worklog Modal */}
      <WorkLogModal
        isOpen={isWorkLogOpen}
        onClose={() => setIsWorkLogOpen(false)}
        ticket={ticket}
        onWorkLogAdded={(upd) => onTicketUpdated(upd)}
      />

      {/* Create Knowledge Article Modal */}
      <CreateKBFromResolutionModal
        isOpen={isKbOpen}
        onClose={() => setIsKbOpen(false)}
        ticket={ticket}
        onArticleCreated={() => {}}
      />

      {/* Resolve Ticket Dialog */}
      {isResolveDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-100">Resolve Ticket: {ticket.ticketNumber}</h3>
            <form onSubmit={handleExecuteResolve} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Resolution Summary *</label>
                <textarea
                  rows={3}
                  value={resSummary}
                  onChange={(e) => setResSummary(e.target.value)}
                  placeholder="Explain exactly how the issue was fixed..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Resolution Code</label>
                <select
                  value={resCode}
                  onChange={(e) => setResCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                >
                  <option value="Configuration Tuning & Process Termination">Configuration Tuning & Process Termination</option>
                  <option value="Hardware Replacement">Hardware Replacement</option>
                  <option value="OS Patch / Hotfix Applied">OS Patch / Hotfix Applied</option>
                  <option value="Network Route Diverted">Network Route Diverted</option>
                  <option value="Permissions Granted">Permissions Granted</option>
                  <option value="User Error / Training Provided">User Error / Training Provided</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Workaround / Commands</label>
                <input
                  type="text"
                  value={resWorkaround}
                  onChange={(e) => setResWorkaround(e.target.value)}
                  placeholder="e.g. systemctl restart nginx"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResolveDialogOpen(false)}
                  className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded"
                >
                  Submit Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Comments Modal */}
      {rejectStepId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-3 text-xs">
            <h3 className="text-sm font-bold text-rose-300">Reject Approval Stage (Comments Mandatory)</h3>
            <p className="text-slate-400 text-[11px]">
              Rejection halts workflow and records permanent justification in the audit trail.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter mandatory reason for rejection..."
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:border-rose-500 focus:outline-none"
              required
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectStepId(null);
                  setRejectReason('');
                }}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!rejectReason.trim()) {
                    showToast('error', 'Mandatory Comment Required', 'Please enter a rejection reason.');
                    return;
                  }
                  handleApprovalAction(rejectStepId, 'REJECT', rejectReason);
                  setRejectStepId(null);
                  setRejectReason('');
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requester Confirm Resolution / Reopen Modal */}
      {isConfirmDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-100">Requester Resolution Confirmation</h3>
            <p className="text-slate-400">
              Please verify if the issue has been resolved satisfactorily.
            </p>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Customer Satisfaction Rating (1-5)</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCsatRating(num)}
                    className={`w-8 h-8 rounded font-mono font-bold ${
                      csatRating === num ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Feedback / Reopen Reason</label>
              <textarea
                rows={2}
                value={confirmFeedback}
                onChange={(e) => setConfirmFeedback(e.target.value)}
                placeholder="Optional feedback or explain why reopening..."
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
              />
            </div>
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => handleExecuteConfirmation('REOPEN')}
                className="px-3.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 rounded font-semibold"
              >
                Reopen Ticket
              </button>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmDialogOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleExecuteConfirmation('ACCEPT')}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded"
                >
                  Accept & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
