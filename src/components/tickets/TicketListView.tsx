import React, { useState } from 'react';
import { Ticket, PriorityLevel, TicketStatus, TicketType } from '../../types';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { SLACountdown } from '../common/SLACountdown';
import { formatDateTime } from '../../lib/utils';
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Server,
  AlertTriangle,
  Clock,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';

interface TicketListViewProps {
  title: string;
  subtitle?: string;
  tickets: Ticket[];
  onSelectTicket: (ticketId: string) => void;
  onCreateTicket?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const TicketListView: React.FC<TicketListViewProps> = ({
  title,
  subtitle,
  tickets,
  onSelectTicket,
  onCreateTicket,
  onRefresh,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filteredTickets = tickets.filter((t) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = t.ticketNumber.toLowerCase().includes(q);
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchReq = t.requesterName.toLowerCase().includes(q);
      const matchCi = t.affectedCIName?.toLowerCase().includes(q) || false;
      const matchIp = t.affectedIP?.toLowerCase().includes(q) || false;
      if (!matchNumber && !matchTitle && !matchReq && !matchCi && !matchIp) return false;
    }

    // Priority
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;

    // Status
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;

    // Type
    if (typeFilter !== 'ALL' && t.ticketType !== typeFilter) return false;

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center space-x-2.5">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition"
              title="Refresh queue"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
            </button>
          )}

          {onCreateTicket && (
            <button
              onClick={onCreateTicket}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center gap-2.5 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filter ticket #, description, user, CI, IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center space-x-1">
          <span className="text-slate-500 text-[11px] font-mono">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="P1">P1 - Critical</option>
            <option value="P2">P2 - High</option>
            <option value="P3">P3 - Medium</option>
            <option value="P4">P4 - Low</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-1">
          <span className="text-slate-500 text-[11px] font-mono">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="ON_HOLD">ON_HOLD</option>
            <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="RECALLED">RECALLED</option>
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex items-center space-x-1">
          <span className="text-slate-500 text-[11px] font-mono">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="Incident">Incident</option>
            <option value="VM Request">VM Request</option>
            <option value="Firewall Whitelist">Firewall Whitelist</option>
            <option value="Service Request">Service Request</option>
            <option value="Change Request">Change Request</option>
            <option value="Problem">Problem</option>
          </select>
        </div>
      </div>

      {/* Ticket Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {filteredTickets.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Layers className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-medium text-slate-400">No tickets match current filter criteria</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your filters or create a new ticket.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Ticket #</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Subject & Technical Scope</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Resolution SLA</th>
                  <th className="px-4 py-3">Assignee & Queue</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => onSelectTicket(t.id)}
                    className="hover:bg-slate-850/70 transition cursor-pointer group"
                  >
                    {/* Ticket # */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5 font-mono font-bold text-sky-400">
                        <span>{t.ticketNumber}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        {formatDateTime(t.createdAt).split(',')[0]}
                      </span>
                    </td>

                    {/* Type Badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[11px] font-medium">
                        {t.ticketType}
                      </span>
                    </td>

                    {/* Title & Telemetry */}
                    <td className="px-4 py-3 min-w-[240px]">
                      <div className="font-semibold text-slate-100 group-hover:text-sky-300 transition line-clamp-1">
                        {t.title}
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                        {t.affectedCIName && (
                          <span className="text-emerald-400/90 truncate max-w-[160px]">
                            CI: {t.affectedCIName}
                          </span>
                        )}
                        {t.affectedIP && (
                          <span className="text-amber-300/80">{t.affectedIP}</span>
                        )}
                        <span>Req: {t.requesterName}</span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <PriorityBadge priority={t.priority} />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={t.status} />
                    </td>

                    {/* SLA Countdown Timer */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <SLACountdown sla={t.sla} compact />
                    </td>

                    {/* Assignee & Group */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-slate-200">
                        {t.currentAssigneeName || <span className="text-slate-500 italic">Queue</span>}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {t.currentAssignmentGroup}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 transition inline-block" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
