import React from 'react';
import { Clock, ShieldCheck, AlertTriangle, Layers, PauseCircle, Activity } from 'lucide-react';

export const SLAMatrixView: React.FC = () => {
  return (
    <div className="space-y-6 text-xs text-slate-300">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center space-x-2">
          <Clock className="w-5 h-5 text-sky-400" />
          <span>SLA & OLA Operational Matrix Framework</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Enterprise Service Level Agreements (SLA), Team Operational Level Agreements (OLA), and Controlled Pause Policies
        </p>
      </div>

      {/* Incident SLA Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Incident Severity & Resolution SLA Matrix</h3>
            <p className="text-[11px] text-slate-400">Enforced by the continuous real-time SLA countdown engine</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
            ITIL v4 Compliant
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/60 text-slate-400 text-[11px] font-mono uppercase border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Priority Level</th>
                <th className="px-4 py-3">Business Impact Criteria</th>
                <th className="px-4 py-3">Response SLA</th>
                <th className="px-4 py-3">Resolution SLA</th>
                <th className="px-4 py-3">Escalation Notification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              <tr className="bg-rose-950/10">
                <td className="px-4 py-3 font-bold text-rose-400">
                  <span className="px-2 py-0.5 bg-rose-950 border border-rose-800 rounded">P1 - Critical</span>
                </td>
                <td className="px-4 py-3 font-sans text-slate-200">
                  Total loss of core service, production outage, severe security breach, or massive customer disruption.
                </td>
                <td className="px-4 py-3 text-emerald-400 font-bold">15 Minutes</td>
                <td className="px-4 py-3 text-rose-400 font-bold">2 Hours (24x7)</td>
                <td className="px-4 py-3 font-sans text-slate-400">
                  Immediate SMS & Page to CISO, Infra Head & Operations Director
                </td>
              </tr>

              <tr className="bg-amber-950/10">
                <td className="px-4 py-3 font-bold text-amber-400">
                  <span className="px-2 py-0.5 bg-amber-950 border border-amber-800 rounded">P2 - High</span>
                </td>
                <td className="px-4 py-3 font-sans text-slate-200">
                  Degraded production performance, redundant link down, or major department blocked without workaround.
                </td>
                <td className="px-4 py-3 text-emerald-400 font-bold">30 Minutes</td>
                <td className="px-4 py-3 text-amber-400 font-bold">4 Hours (24x7)</td>
                <td className="px-4 py-3 font-sans text-slate-400">
                  Escalate to Lead Engineer at 50% SLA; Ops Manager at 75%
                </td>
              </tr>

              <tr>
                <td className="px-4 py-3 font-bold text-sky-400">
                  <span className="px-2 py-0.5 bg-sky-950 border border-sky-800 rounded">P3 - Medium</span>
                </td>
                <td className="px-4 py-3 font-sans text-slate-200">
                  Isolated issue affecting non-critical application, partial feature failure with viable workaround.
                </td>
                <td className="px-4 py-3 text-slate-300">60 Minutes</td>
                <td className="px-4 py-3 text-sky-300">8 Business Hours</td>
                <td className="px-4 py-3 font-sans text-slate-400">
                  Escalate to Team Queue Lead at 80% SLA
                </td>
              </tr>

              <tr>
                <td className="px-4 py-3 font-bold text-slate-400">
                  <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded">P4 - Low</span>
                </td>
                <td className="px-4 py-3 font-sans text-slate-200">
                  Cosmetic inquiry, routine administration, minor information request, non-blocking bug.
                </td>
                <td className="px-4 py-3 text-slate-400">120 Minutes</td>
                <td className="px-4 py-3 text-slate-300">24 Business Hours</td>
                <td className="px-4 py-3 font-sans text-slate-400">Weekly operational backlog review</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Internal Team OLA Targets */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
        <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Internal Operational Level Agreements (OLAs) by Specialized Team</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Defines the maximum turnaround time for child work orders when a ticket traverses multiple technical groups:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="text-sky-400 font-bold block">Cloud Operations</span>
            <span className="text-slate-400 text-[11px] block mt-1">VM Provisioning & Resizing</span>
            <span className="text-slate-100 font-bold mt-2 block">OLA: 2.0 Hours</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="text-amber-400 font-bold block">Network & Security</span>
            <span className="text-slate-400 text-[11px] block mt-1">Firewall Rule & VLAN Config</span>
            <span className="text-slate-100 font-bold mt-2 block">OLA: 1.0 Hour</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="text-emerald-400 font-bold block">Database Administration</span>
            <span className="text-slate-400 text-[11px] block mt-1">Schema Migration & Slow Queries</span>
            <span className="text-slate-100 font-bold mt-2 block">OLA: 2.0 Hours</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="text-purple-400 font-bold block">Storage & Backup</span>
            <span className="text-slate-400 text-[11px] block mt-1">LUN Allocation & Snapshots</span>
            <span className="text-slate-100 font-bold mt-2 block">OLA: 1.5 Hours</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="text-cyan-400 font-bold block">NOC & Monitoring</span>
            <span className="text-slate-400 text-[11px] block mt-1">Agent Install & Threshold Config</span>
            <span className="text-slate-100 font-bold mt-2 block">OLA: 30 Minutes</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="text-rose-400 font-bold block">Security Operations (SOC)</span>
            <span className="text-slate-400 text-[11px] block mt-1">Triage & Hardening Verification</span>
            <span className="text-slate-100 font-bold mt-2 block">OLA: 45 Minutes</span>
          </div>
        </div>
      </div>

      {/* Controlled SLA Hold Rules (Section 17 & Scenario 4) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
        <h3 className="text-sm font-bold text-slate-100 mb-2 flex items-center space-x-2">
          <PauseCircle className="w-4 h-4 text-amber-400" />
          <span>Approved SLA Pause Policy & Audit Enforcement (Scenario 4)</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          To prevent engineers from artificially freezing breach clocks on stale tickets, the system strictly enforces 10 allowable pause reasons. Any attempt to hold without an approved reason is automatically rejected.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[11px]">
          {[
            'Waiting for Requester',
            'Approved Maint. Window',
            'Waiting for Third Party',
            'Waiting for OEM',
            'Waiting for Vendor',
            'Business Approval',
            'Security Approval',
            'External Dependency',
            'Planned Activity',
            'Force Majeure',
          ].map((r, i) => (
            <div key={r} className="p-2 bg-slate-950 border border-slate-800 rounded text-center">
              <span className="text-slate-500 block text-[10px]">#0{i + 1}</span>
              <span className="text-amber-300 font-semibold">{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
