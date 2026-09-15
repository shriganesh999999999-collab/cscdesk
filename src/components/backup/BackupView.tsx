import React, { useState } from 'react';
import { Archive, CheckCircle2, AlertTriangle, ShieldCheck, HardDrive, RefreshCw } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const BackupView: React.FC = () => {
  const { showToast } = useNotification();
  const { currentUser } = useAuth();

  const [backupJobs, setBackupJobs] = useState([
    {
      id: 'bk-01',
      name: 'PROD-DB-MYSQL-CLUSTER-GOLD',
      policyTier: 'Gold (Daily Full + WAL)',
      targetRepo: 'SAN-STORAGE-DC1-LUN404',
      sizeGb: 480,
      rpoHours: 0.25,
      rtoHours: 1.0,
      lastRun: 'Today 03:00 UTC',
      status: 'VERIFIED_OK',
      checksum: 'SHA256: 9b2d...f4e1',
    },
    {
      id: 'bk-02',
      name: 'PROD-VM-PAYMENT-APP-SNAPSHOTS',
      policyTier: 'Gold (Daily Snapshot)',
      targetRepo: 'AWS-S3-GLACIER-VAULT',
      sizeGb: 1250,
      rpoHours: 24,
      rtoHours: 2.0,
      lastRun: 'Today 02:30 UTC',
      status: 'VERIFIED_OK',
      checksum: 'SHA256: 4a7c...819a',
    },
    {
      id: 'bk-03',
      name: 'DEV-UAT-SANDBOX-VOLUME',
      policyTier: 'Bronze (Weekly)',
      targetRepo: 'NAS-TIER2-DEV',
      sizeGb: 340,
      rpoHours: 168,
      rtoHours: 8.0,
      lastRun: '3 days ago',
      status: 'VERIFIED_OK',
      checksum: 'SHA256: d18b...7320',
    },
  ]);

  const handleTestDrill = (id: string) => {
    showToast(
      'info',
      'Disaster Recovery Drill Initiated',
      'Automated synthetic test restoration scheduled in isolated sandbox.'
    );
  };

  return (
    <div className="space-y-5 text-xs text-slate-300">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center space-x-2">
          <Archive className="w-5 h-5 text-sky-400" />
          <span>Enterprise Backup & Disaster Recovery Verification</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Gold, Silver, and Bronze snapshot policies, automated integrity checksums, and recovery drills (Section 33)
        </p>
      </div>

      {/* RPO / RTO Compliance Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Recovery Point Objective (RPO)</span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">&lt; 15 mins</p>
          <span className="text-[10px] text-slate-500 font-mono">Continuous WAL archiving active</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Recovery Time Objective (RTO)</span>
          <p className="text-2xl font-bold font-mono text-sky-400 mt-1">&lt; 60 mins</p>
          <span className="text-[10px] text-slate-500 font-mono">Validated during last quarterly drill</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Immutability Lock</span>
          <p className="text-2xl font-bold font-mono text-purple-400 mt-1">WORM Compliant</p>
          <span className="text-[10px] text-slate-500 font-mono">30-day air-gap ransomware protection</span>
        </div>
      </div>

      {/* Backup Jobs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-4 bg-slate-950 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100">Daily Backup Execution & Verification Register</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 text-[11px] font-mono uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Protected Volume / Cluster</th>
                <th className="px-4 py-3">Policy Tier</th>
                <th className="px-4 py-3">Storage Target</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">RPO / RTO</th>
                <th className="px-4 py-3">Integrity Verification</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 font-mono text-xs">
              {backupJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-850/50 transition">
                  <td className="px-4 py-3.5">
                    <strong className="text-slate-100 block font-semibold">{job.name}</strong>
                    <span className="text-[10px] text-slate-500">{job.checksum}</span>
                  </td>

                  <td className="px-4 py-3.5 font-sans">
                    <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-mono text-[10px] border border-sky-800 font-bold">
                      {job.policyTier}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-slate-300">{job.targetRepo}</td>
                  <td className="px-4 py-3.5 text-slate-200">{job.sizeGb} GB</td>
                  <td className="px-4 py-3.5 text-slate-300">{job.rpoHours}h / {job.rtoHours}h</td>

                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-[10px] flex items-center w-fit">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Passed ({job.lastRun})
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right font-sans">
                    <button
                      onClick={() => handleTestDrill(job.id)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded text-xs transition"
                    >
                      Test Restore Drill
                    </button>
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
