import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Shield, Radio, Server, ArrowRight } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const MonitoringView: React.FC = () => {
  const { showToast } = useNotification();
  const { currentUser } = useAuth();

  const [shifts, setShifts] = useState([
    {
      id: 'sh-01',
      shiftName: 'NOC Alpha Shift (00:00 - 08:00 UTC)',
      shiftLead: 'Kevin Patel (L1 Engineer)',
      alertsTriaged: 142,
      criticalEvents: 3,
      handoverNotes: 'All BGP sessions stable after transit route optimization. Core DB replica lag normal (< 12ms).',
      status: 'VERIFIED',
      verifiedBy: 'David Zhao (Ops Manager)',
    },
    {
      id: 'sh-02',
      shiftName: 'NOC Bravo Shift (08:00 - 16:00 UTC)',
      shiftLead: 'Rachel Green (L2 Specialist)',
      alertsTriaged: 289,
      criticalEvents: 5,
      handoverNotes: 'Storage SAN LUN IOPS elevated during payment batch job. Investigated and tuned MySQL buffer pool.',
      status: 'VERIFIED',
      verifiedBy: 'Marcus Vance (Infra Head)',
    },
    {
      id: 'sh-03',
      shiftName: 'NOC Charlie Shift (16:00 - 24:00 UTC)',
      shiftLead: 'Vikram Seth (L3 Core Architect)',
      alertsTriaged: 184,
      criticalEvents: 1,
      handoverNotes: 'Active shift in progress. Monitored Equinix border router BGP session flap INC-2026-000002.',
      status: 'ACTIVE',
    },
  ]);

  const handleSignShift = (id: string) => {
    setShifts(
      shifts.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'VERIFIED',
              verifiedBy: `${currentUser.name} (${currentUser.role})`,
            }
          : s
      )
    );
    showToast('success', 'Shift Review Verified', 'NOC daily handover signed and logged in audit register.');
  };

  return (
    <div className="space-y-5 text-xs text-slate-300">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center space-x-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <span>24x7 NOC Monitoring & Shift Handover Reviews</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Standardized alert triage review, handover logs, and operational telemetry health (Sections 31 & 32)
        </p>
      </div>

      {/* Live Probe Status Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <span className="font-bold text-slate-100 text-sm">Zabbix & Prometheus Real-Time Telemetry</span>
            <p className="text-slate-400 text-[11px]">Monitoring 420 production endpoints across West & East DCs</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 font-mono text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">UPTIME SLA</span>
            <strong className="text-emerald-400">99.982%</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">AVG LATENCY</span>
            <strong className="text-sky-400">4.2 ms</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">SYNTHETIC PROBES</span>
            <strong className="text-slate-200">100% OK</strong>
          </div>
        </div>
      </div>

      {/* Shifts Handover Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-4 bg-slate-950 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100">Daily NOC Operational Handover Register</h3>
          <p className="text-[11px] text-slate-400">Formal handover log between consecutive 8-hour monitoring cycles</p>
        </div>

        <div className="divide-y divide-slate-800/70">
          {shifts.map((s) => (
            <div key={s.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-100">{s.shiftName}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      s.status === 'VERIFIED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                <p className="text-slate-300 mt-1 leading-relaxed">{s.handoverNotes}</p>
                <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono mt-2">
                  <span>Shift Lead: <strong className="text-slate-300">{s.shiftLead}</strong></span>
                  <span>•</span>
                  <span>Triaged: <strong className="text-slate-300">{s.alertsTriaged} alerts</strong></span>
                  <span>•</span>
                  <span>Critical: <strong className="text-rose-400">{s.criticalEvents}</strong></span>
                  {s.verifiedBy && (
                    <>
                      <span>•</span>
                      <span>Verified: <strong className="text-emerald-400">{s.verifiedBy}</strong></span>
                    </>
                  )}
                </div>
              </div>

              <div>
                {s.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleSignShift(s.id)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold text-xs transition"
                  >
                    Sign & Verify Handover
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
