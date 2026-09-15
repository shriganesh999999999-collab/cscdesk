import React from 'react';
import { Ticket } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Server,
  Layers,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../common/StatusBadge';
import { SLACountdown } from '../common/SLACountdown';

interface OperationsDashboardProps {
  tickets: Ticket[];
  onSelectTicket: (ticketId: string) => void;
  onNavigateTo: (tab: any) => void;
  onOpenCreateTicket: () => void;
}

export const OperationsDashboard: React.FC<OperationsDashboardProps> = ({
  tickets,
  onSelectTicket,
  onNavigateTo,
  onOpenCreateTicket,
}) => {
  const { currentUser } = useAuth();

  // Metrics
  const activeTickets = tickets.filter((t) => t.status !== 'CLOSED' && t.status !== 'RESOLVED');
  const criticalP1s = activeTickets.filter((t) => t.priority === 'P1');
  const highP2s = activeTickets.filter((t) => t.priority === 'P2');

  const breachedTickets = tickets.filter((t) => t.sla.isBreached);
  const atRiskTickets = activeTickets.filter((t) => !t.sla.isBreached && t.sla.percentageConsumed >= 70);

  const pendingApprovals = tickets.flatMap((t) =>
    t.approvals.filter((a) => a.status === 'PENDING')
  );

  const myApprovals = pendingApprovals.filter(
    (a) =>
      a.approverUserId === currentUser.id ||
      (a.approverRole === currentUser.role) ||
      currentUser.role === 'Super Admin'
  );

  return (
    <div className="space-y-6">
      {/* Top Banner for Active Major Incidents / Outages */}
      {criticalP1s.length > 0 && (
        <div className="bg-rose-950/80 border border-rose-600 rounded-xl p-4 text-rose-100 flex items-center justify-between shadow-lg shadow-rose-950/50 animate-in fade-in">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-600 text-white rounded-lg animate-pulse">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-wide">ACTIVE MAJOR INCIDENT IN PROGRESS</span>
                <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-rose-900 border border-rose-500 font-bold">
                  P1 CRITICAL
                </span>
              </div>
              <p className="text-xs text-rose-200 mt-0.5 font-medium">
                {criticalP1s[0].ticketNumber}: {criticalP1s[0].title}
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectTicket(criticalP1s[0].id)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition shadow shrink-0"
          >
            Enter Incident Bridge →
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open Tickets Total */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 font-medium">Active Queue</span>
            <div className="p-2 bg-sky-950 text-sky-400 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-100">{activeTickets.length}</span>
            <span className="text-xs text-slate-400 font-mono">active tickets</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Critical: <strong className="text-rose-400">{criticalP1s.length}</strong></span>
            <span>High: <strong className="text-amber-400">{highP2s.length}</strong></span>
          </div>
        </div>

        {/* SLA Compliance Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 font-medium">SLA Risk Monitor</span>
            <div className="p-2 bg-amber-950 text-amber-400 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-amber-400">{atRiskTickets.length}</span>
            <span className="text-xs text-slate-400 font-mono">at-risk (&gt;70% elapsed)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Breached: <strong className="text-rose-400">{breachedTickets.length}</strong></span>
            <span className="text-emerald-400 font-medium">94.8% MTTR Target</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 font-medium">My Approvals</span>
            <div className="p-2 bg-purple-950 text-purple-400 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-purple-300">{myApprovals.length}</span>
            <span className="text-xs text-slate-400 font-mono">pending your sign-off</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            <button
              onClick={() => onNavigateTo('approvals')}
              className="text-sky-400 hover:text-sky-300 transition flex items-center space-x-1"
            >
              <span>Review pending approvals</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Infrastructure CIs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 font-medium">CMDB Infrastructure</span>
            <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">420+</span>
            <span className="text-xs text-slate-400 font-mono">CIs registered</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>2 Datacenters</span>
            <span>1 Cloud VPC</span>
          </div>
        </div>
      </div>

      {/* Main Grid: At-Risk SLA Tickets & Quick Service Catalog Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-Time SLA Triage Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Priority & SLA Triage Desk</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Immediate attention required: P1/P2 tickets and expiring SLA clocks
              </p>
            </div>
            <button
              onClick={() => onNavigateTo('team-queue')}
              className="text-xs text-sky-400 hover:text-sky-300 transition flex items-center space-x-1"
            >
              <span>View full queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {activeTickets.slice(0, 5).map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTicket(t.id)}
                className="p-3 bg-slate-950/70 hover:bg-slate-850/80 border border-slate-800 rounded-lg transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-mono text-xs font-bold text-sky-400">{t.ticketNumber}</span>
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                    <span className="text-[11px] text-slate-400 font-mono">({t.ticketType})</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium truncate group-hover:text-sky-300 transition">
                    {t.title}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Queue: {t.currentAssignmentGroup} • Assignee: {t.currentAssigneeName || 'Unassigned'}
                  </p>
                </div>

                <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3">
                  <SLACountdown sla={t.sla} compact />
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white transition" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Quick Launchpad & Operational Shortcuts */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
            <h3 className="text-sm font-bold text-slate-100 mb-3">Operational Fast-Actions</h3>
            <div className="space-y-2">
              <button
                onClick={onOpenCreateTicket}
                className="w-full text-left p-2.5 rounded-lg bg-sky-950/40 hover:bg-sky-900/60 border border-sky-800/80 text-sky-200 transition flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-semibold block">Create Incident / Service Request</span>
                  <span className="text-[10px] text-sky-400/80">With automatic duplicate detection</span>
                </div>
                <ArrowRight className="w-4 h-4 text-sky-400" />
              </button>

              <button
                onClick={() => onNavigateTo('catalog')}
                className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 transition flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-semibold block">Multi-VM Provisioning</span>
                  <span className="text-[10px] text-slate-400">Deploy 1-10 VMs with 6 orchestrated work orders</span>
                </div>
                <Server className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTo('catalog')}
                className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 transition flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-semibold block">Firewall Whitelist / Port Opening</span>
                  <span className="text-[10px] text-slate-400">Zero-Trust CISO sign-off pipeline</span>
                </div>
                <ShieldAlert className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTo('cmdb')}
                className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 transition flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-semibold block">CMDB Asset Topology Explorer</span>
                  <span className="text-[10px] text-slate-400">Lookup VIPs, Hostnames & Relationships</span>
                </div>
                <Activity className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Persona Hint Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-400">
            <span className="font-mono uppercase text-[10px] text-sky-400 font-bold block mb-1">
              Active Persona: {currentUser.name}
            </span>
            <p className="text-slate-300">
              Role: <strong className="text-white">{currentUser.role}</strong> ({currentUser.team}).
              Use the top-right role switcher to test any of the 10 enterprise personas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
