import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '../../types';
import { api } from '../../services/api';
import { ShieldCheck, Search, Filter, Layers, Clock, Lock } from 'lucide-react';
import { formatDateTime } from '../../lib/utils';

export const AuditTrailView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');

  useEffect(() => {
    api.getAuditLogs().then(setLogs);
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchActor = log.actorName.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      const matchEntity = log.targetIdentifier.toLowerCase().includes(q) || log.targetId.toLowerCase().includes(q);
      const matchReason = (log.reason || '').toLowerCase().includes(q);
      if (!matchActor && !matchAction && !matchEntity && !matchReason) return false;
    }
    if (entityFilter !== 'ALL' && log.targetType !== entityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Forensic Audit Trail & Evidence Registry</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Immutable SOC 2 / ISO 27001 audit register recording all state modifications, approvals, reassignments, and SLA adjustments
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search audit trail by actor, action, ticket/CI ID, changes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-1">
          <span className="text-slate-500 text-[11px] font-mono">Entity:</span>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs"
          >
            <option value="ALL">All Entities ({logs.length})</option>
            <option value="Ticket">Ticket</option>
            <option value="Approval">Approval</option>
            <option value="SLAInstance">SLA Clock</option>
            <option value="ConfigurationItem">ConfigurationItem</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-[11px] font-mono uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor & Role</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity Type & Target</th>
                <th className="px-4 py-3">Audit Details & Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 font-mono text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850/50 transition">
                  <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                    {formatDateTime(log.timestamp)}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <strong className="text-slate-200 font-semibold block">{log.actorName}</strong>
                    <span className="text-[10px] text-sky-400">{log.actorRole}</span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action.includes('REJECT') || log.action.includes('BREACH')
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : log.action.includes('APPROV') || log.action.includes('RESOLV')
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : log.action.includes('PAUSE') || log.action.includes('HOLD')
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-950 text-sky-300 border border-slate-800'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-slate-300 font-semibold">{log.targetType}</span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[160px]">
                      {log.targetIdentifier}
                    </span>
                  </td>

                  <td className="px-4 py-3 max-w-md font-sans">
                    {log.reason && <p className="text-slate-300">{log.reason}</p>}
                    {log.oldValues && log.newValues && (
                      <div className="mt-1 flex items-center space-x-1.5 font-mono text-[10px] text-slate-400 bg-slate-950 p-1 rounded">
                        <span className="text-rose-400 line-through">{log.oldValues}</span>
                        <span>→</span>
                        <span className="text-emerald-400 font-bold">{log.newValues}</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
