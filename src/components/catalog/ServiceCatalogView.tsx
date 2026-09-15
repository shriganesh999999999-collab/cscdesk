import React from 'react';
import {
  Server,
  Shield,
  Database,
  Lock,
  Archive,
  Layers,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';

interface ServiceCatalogViewProps {
  onSelectService: (serviceType: 'vm' | 'firewall' | 'standard') => void;
}

export const ServiceCatalogView: React.FC<ServiceCatalogViewProps> = ({ onSelectService }) => {
  const catalogItems = [
    {
      id: 'vm-request',
      title: 'Multi-VM Cloud & Infrastructure Provisioning',
      category: 'Cloud & Compute',
      description:
        'Request 1 to 10 virtual machines with automated orchestration across Cloud, Network VLANs, Firewall ports, Gold Backup policies, and NOC monitoring.',
      sla: 'Standard: 8 Business Hours (PROD)',
      icon: Server,
      accent: 'border-sky-700 hover:border-sky-500 bg-sky-950/20',
      iconBg: 'bg-sky-950 text-sky-400',
      actionType: 'vm' as const,
      popular: true,
    },
    {
      id: 'firewall-whitelist',
      title: 'Firewall Port Whitelist & Access Rule',
      category: 'Network & Perimeter Security',
      description:
        'Submit ingress/egress firewall openings, inter-VLAN routing, and external partner IP whitelisting with automated CISO risk evaluation pipeline.',
      sla: 'Standard: 4 Business Hours (PROD)',
      icon: Shield,
      accent: 'border-amber-750 hover:border-amber-500 bg-amber-950/20',
      iconBg: 'bg-amber-950 text-amber-400',
      actionType: 'firewall' as const,
      popular: true,
    },
    {
      id: 'db-instance',
      title: 'Database Instance & Read Replica Deployment',
      category: 'Database Administration',
      description:
        'Provision high-availability MySQL, PostgreSQL, or Redis clusters with automated WAL archiving, failover proxies, and monitoring probes.',
      sla: 'Standard: 6 Business Hours',
      icon: Database,
      accent: 'border-emerald-750 hover:border-emerald-500 bg-emerald-950/20',
      iconBg: 'bg-emerald-950 text-emerald-400',
      actionType: 'standard' as const,
    },
    {
      id: 'ssl-cert',
      title: 'TLS/SSL Wildcard Certificate Installation',
      category: 'Security & PKI',
      description:
        'Order corporate PKI certificates, renew expiring domain certificates, and bind them to perimeter load balancers or edge reverse proxies.',
      sla: 'Standard: 4 Business Hours',
      icon: Lock,
      accent: 'border-purple-750 hover:border-purple-500 bg-purple-950/20',
      iconBg: 'bg-purple-950 text-purple-400',
      actionType: 'standard' as const,
    },
    {
      id: 'backup-restore',
      title: 'Emergency Data Restore / Snapshot Drill',
      category: 'Storage & Business Continuity',
      description:
        'Execute point-in-time database or VM restoration drills from Gold/Silver backup repositories into isolated sandbox testing environments.',
      sla: 'Standard: 2 Hours (Target MTTR)',
      icon: Archive,
      accent: 'border-cyan-750 hover:border-cyan-500 bg-cyan-950/20',
      iconBg: 'bg-cyan-950 text-cyan-400',
      actionType: 'standard' as const,
    },
    {
      id: 'iam-access',
      title: 'Privileged Infrastructure Access & Bastion Role',
      category: 'Identity & Access (IAM)',
      description:
        'Request temporary time-bound SSH access to production bastions or administrative privileges under zero-trust authorization.',
      sla: 'Standard: 1 Business Hour',
      icon: Layers,
      accent: 'border-slate-700 hover:border-slate-500 bg-slate-900/40',
      iconBg: 'bg-slate-800 text-slate-300',
      actionType: 'standard' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center space-x-2">
          <Layers className="w-5 h-5 text-sky-400" />
          <span>Self-Service IT & Infrastructure Catalog</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Standardized enterprise service fulfillment with automated approval workflows, SLA tracking, and task delegation
        </p>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {catalogItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`border rounded-xl p-5 flex flex-col justify-between transition group shadow-md ${item.accent}`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-lg ${item.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {item.popular && (
                    <span className="px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800 text-[10px] font-mono font-bold flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Popular
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                  {item.category}
                </span>
                <h3 className="text-sm font-bold text-slate-100 mt-1 group-hover:text-sky-300 transition">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  {item.sla}
                </span>
                <button
                  onClick={() => onSelectService(item.actionType)}
                  className="flex items-center space-x-1 text-xs font-semibold text-sky-400 group-hover:text-sky-300 transition"
                >
                  <span>Request</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
