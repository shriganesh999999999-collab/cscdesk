import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Server, Plus, Trash2, Shield, Network, HardDrive, Activity } from 'lucide-react';
import { Ticket } from '../../types';

interface VMComponent {
  id: string;
  role: 'Web Server (Nginx)' | 'Application Server' | 'Database Server (MySQL)' | 'Cache (Redis)' | 'Streaming (Kafka)' | 'Utility Server';
  hostnamePrefix: string;
  os: string;
  vCpu: number;
  ramGb: number;
  diskGb: number;
}

interface VMRequestFormProps {
  onSuccess: (createdTicket: Ticket) => void;
  onCancel: () => void;
}

export const VMRequestForm: React.FC<VMRequestFormProps> = ({ onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  const [projectName, setProjectName] = useState('Payment Gateway Modernization');
  const [environment, setEnvironment] = useState<'DEV' | 'UAT' | 'PRE-PROD' | 'PROD' | 'DR'>('PROD');
  const [dataCenter, setDataCenter] = useState('DC-West-01 (Equinix SV5)');
  const [businessJustification, setBusinessJustification] = useState(
    'Deployment of new PCI-DSS compliant real-time payment aggregation microservices stack requiring low-latency inter-VLAN communications.'
  );

  const [vmList, setVmList] = useState<VMComponent[]>([
    {
      id: 'vm-1',
      role: 'Web Server (Nginx)',
      hostnamePrefix: 'prd-pay-web',
      os: 'Red Hat Enterprise Linux 9.2',
      vCpu: 4,
      ramGb: 16,
      diskGb: 150,
    },
    {
      id: 'vm-2',
      role: 'Application Server',
      hostnamePrefix: 'prd-pay-api',
      os: 'Ubuntu 22.04 LTS',
      vCpu: 8,
      ramGb: 32,
      diskGb: 300,
    },
    {
      id: 'vm-3',
      role: 'Cache (Redis)',
      hostnamePrefix: 'prd-pay-redis',
      os: 'Ubuntu 22.04 LTS',
      vCpu: 4,
      ramGb: 16,
      diskGb: 100,
    },
  ]);

  const [backupPolicy, setBackupPolicy] = useState('Daily Gold Snapshot (30-day retention)');
  const [monitoringPolicy, setMonitoringPolicy] = useState('Tier-1 24x7 NOC Alerting (Prometheus/Zabbix)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addVm = () => {
    const nextIdx = vmList.length + 1;
    setVmList([
      ...vmList,
      {
        id: `vm-${Date.now()}`,
        role: 'Application Server',
        hostnamePrefix: `prd-app-0${nextIdx}`,
        os: 'Ubuntu 22.04 LTS',
        vCpu: 4,
        ramGb: 16,
        diskGb: 150,
      },
    ]);
  };

  const removeVm = (id: string) => {
    if (vmList.length === 1) {
      showToast('warning', 'Minimum Component Required', 'A VM request must have at least one server component.');
      return;
    }
    setVmList(vmList.filter((v) => v.id !== id));
  };

  const updateVm = (id: string, field: keyof VMComponent, val: any) => {
    setVmList(vmList.map((v) => (v.id === id ? { ...v, [field]: val } : v)));
  };

  const totalVcpu = vmList.reduce((acc, v) => acc + Number(v.vCpu), 0);
  const totalRam = vmList.reduce((acc, v) => acc + Number(v.ramGb), 0);
  const totalDisk = vmList.reduce((acc, v) => acc + Number(v.diskGb), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      showToast('error', 'Validation Error', 'Project / Application Name is mandatory.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ticket = await api.createTicket(
        {
          title: `Provision ${vmList.length}-Node Stack: ${projectName} (${environment})`,
          description: `${businessJustification}\n\nComponents requested:\n${vmList
            .map(
              (v, idx) =>
                `VM #${idx + 1}: ${v.role} (${v.hostnamePrefix}) - ${v.vCpu} vCPU, ${v.ramGb}GB RAM, ${v.diskGb}GB Disk, OS: ${v.os}`
            )
            .join('\n')}\n\nBackup: ${backupPolicy}\nMonitoring: ${monitoringPolicy}`,
          ticketType: 'VM Request',
          priority: environment === 'PROD' ? 'P2' : 'P3',
          impact: environment === 'PROD' ? 'Department' : 'Small Team',
          urgency: environment === 'PROD' ? 'High' : 'Medium',
          category: 'Cloud & VM',
          subcategory: 'Virtual Machine Provisioning',
          service: 'Enterprise Cloud & Datacenter',
          environment,
          currentAssignmentGroup: 'Cloud Operations Team',
          customFields: {
            projectName,
            dataCenter,
            numberOfVMs: vmList.length,
            vCpuTotal: totalVcpu,
            ramGbTotal: totalRam,
            diskGbTotal: totalDisk,
            backupPolicy,
            monitoringPolicy,
          },
        },
        currentUser
      );

      showToast(
        'success',
        'VM Request Submitted',
        `${ticket.ticketNumber} created with 6 implementation tasks queued.`
      );
      onSuccess(ticket);
    } catch (err: any) {
      showToast('error', 'Submission Failed', err?.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs text-slate-300">
      {/* Scope Header */}
      <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
        <div className="flex items-center space-x-2 text-sky-400 font-semibold mb-2 text-sm">
          <Server className="w-4 h-4" />
          <span>Multi-VM Enterprise Provisioning Architecture</span>
        </div>
        <p className="text-slate-400">
          Submits a single parent request (VMR-2026-XXXX) that automatically orchestrates 6 dependent work orders across Cloud, Network, Security, Backup, and Monitoring teams.
        </p>
      </div>

      {/* Project & Environment Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Project / Application Name *</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 focus:border-sky-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">Target Environment</label>
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 focus:border-sky-500 focus:outline-none"
          >
            <option value="DEV">DEV (Non-prod)</option>
            <option value="UAT">UAT (User Acceptance)</option>
            <option value="PRE-PROD">PRE-PROD (Staging)</option>
            <option value="PROD">PROD (Production)</option>
            <option value="DR">DR (Disaster Recovery)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">Target Data Center</label>
          <select
            value={dataCenter}
            onChange={(e) => setDataCenter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 focus:border-sky-500 focus:outline-none"
          >
            <option value="DC-West-01 (Equinix SV5)">DC-West-01 (Equinix SV5)</option>
            <option value="DC-East-02 (Ashburn)">DC-East-02 (Ashburn)</option>
            <option value="Cloud-VPC-Prod-West">Cloud-VPC-Prod-West (Hybrid)</option>
          </select>
        </div>
      </div>

      {/* Server Components List (Multi-VM Support) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-200">Server Components in this Request ({vmList.length})</span>
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-mono text-[11px] border border-sky-800">
              Total: {totalVcpu} vCPU / {totalRam} GB RAM / {totalDisk} GB SSD
            </span>
          </div>
          <button
            type="button"
            onClick={addVm}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-sky-300 border border-slate-700 rounded-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Component</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {vmList.map((vm, index) => (
            <div
              key={vm.id}
              className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg grid grid-cols-1 sm:grid-cols-6 gap-2.5 items-end"
            >
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">
                  Server Role #{index + 1}
                </label>
                <select
                  value={vm.role}
                  onChange={(e) => updateVm(vm.id, 'role', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-750 rounded px-2 py-1 text-slate-200"
                >
                  <option value="Web Server (Nginx)">Web Server (Nginx)</option>
                  <option value="Application Server">Application Server</option>
                  <option value="Database Server (MySQL)">Database Server (MySQL)</option>
                  <option value="Cache (Redis)">Cache (Redis)</option>
                  <option value="Streaming (Kafka)">Streaming (Kafka)</option>
                  <option value="Utility Server">Utility Server</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Hostname Prefix</label>
                <input
                  type="text"
                  value={vm.hostnamePrefix}
                  onChange={(e) => updateVm(vm.id, 'hostnamePrefix', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-750 rounded px-2 py-1 text-slate-200 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">OS Distribution</label>
                <select
                  value={vm.os}
                  onChange={(e) => updateVm(vm.id, 'os', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-750 rounded px-2 py-1 text-slate-200 text-xs"
                >
                  <option value="Red Hat Enterprise Linux 9.2">RHEL 9.2</option>
                  <option value="Ubuntu 22.04 LTS">Ubuntu 22.04 LTS</option>
                  <option value="Rocky Linux 9">Rocky Linux 9</option>
                  <option value="Windows Server 2022">Windows Server 2022</option>
                </select>
              </div>

              <div className="flex space-x-1.5">
                <div className="flex-1">
                  <label className="block text-[10px] text-slate-400 mb-1">vCPU</label>
                  <input
                    type="number"
                    min={1}
                    max={64}
                    value={vm.vCpu}
                    onChange={(e) => updateVm(vm.id, 'vCpu', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-750 rounded px-1.5 py-1 text-slate-200 text-xs text-center font-mono"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-slate-400 mb-1">RAM(GB)</label>
                  <input
                    type="number"
                    min={2}
                    max={512}
                    value={vm.ramGb}
                    onChange={(e) => updateVm(vm.id, 'ramGb', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-750 rounded px-1.5 py-1 text-slate-200 text-xs text-center font-mono"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-slate-400 mb-1">Disk(GB)</label>
                  <input
                    type="number"
                    min={20}
                    max={4000}
                    value={vm.diskGb}
                    onChange={(e) => updateVm(vm.id, 'diskGb', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-750 rounded px-1.5 py-1 text-slate-200 text-xs text-center font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeVm(vm.id)}
                  className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded transition"
                  title="Remove Component"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Policies & Auxiliary Integration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-400 mb-1 font-medium flex items-center">
            <HardDrive className="w-3.5 h-3.5 mr-1 text-sky-400" />
            Backup & Snapshot Retention Policy
          </label>
          <select
            value={backupPolicy}
            onChange={(e) => setBackupPolicy(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100"
          >
            <option value="Daily Gold Snapshot (30-day retention)">Daily Gold Snapshot (30-day retention)</option>
            <option value="Silver Snapshot (Weekly + 14-day retention)">Silver Snapshot (Weekly + 14-day retention)</option>
            <option value="Bronze Non-Prod (Weekly, 7-day retention)">Bronze Non-Prod (Weekly, 7-day retention)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium flex items-center">
            <Activity className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            NOC Monitoring & Observability SLA
          </label>
          <select
            value={monitoringPolicy}
            onChange={(e) => setMonitoringPolicy(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100"
          >
            <option value="Tier-1 24x7 NOC Alerting (Prometheus/Zabbix)">Tier-1 24x7 NOC Alerting (Prometheus/Zabbix)</option>
            <option value="Standard Business Hours Alerting">Standard Business Hours Alerting</option>
            <option value="Internal Self-Service Dashboards only">Internal Self-Service Dashboards only</option>
          </select>
        </div>
      </div>

      {/* Justification */}
      <div>
        <label className="block text-slate-400 mb-1 font-medium">Business Justification *</label>
        <textarea
          rows={3}
          value={businessJustification}
          onChange={(e) => setBusinessJustification(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 focus:border-sky-500 focus:outline-none"
          required
        />
      </div>

      {/* Generated Workflow Preview */}
      <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
        <p className="text-[11px] font-mono uppercase text-slate-400 font-semibold mb-1.5">
          Orchestrated Implementation Pipeline Preview:
        </p>
        <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">1. Cloud Provisioning</span>
          <span className="text-slate-500">→</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">2. Network & IP</span>
          <span className="text-slate-500">→</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">3. Firewall Rules</span>
          <span className="text-slate-500">→</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">4. Backup Policy</span>
          <span className="text-slate-500">→</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">5. Monitoring</span>
          <span className="text-slate-500">→</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">6. Security Hardening</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-md transition disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit VM Request'}
        </button>
      </div>
    </form>
  );
};
