import React, { useState, useEffect } from 'react';
import { ConfigurationItem, Ticket } from '../../types';
import { api } from '../../services/api';
import {
  Server,
  Database,
  Shield,
  Layers,
  Network,
  Activity,
  HardDrive,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface CMDBTopologyViewProps {
  onSelectTicket?: (ticketId: string) => void;
}

export const CMDBTopologyView: React.FC<CMDBTopologyViewProps> = ({ onSelectTicket }) => {
  const [cis, setCis] = useState<ConfigurationItem[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedCi, setSelectedCi] = useState<ConfigurationItem | null>(null);

  useEffect(() => {
    api.getCIs().then((res) => {
      setCis(res);
      if (res.length > 0) setSelectedCi(res[0]);
    });
    api.getTickets().then(setTickets);
  }, []);

  const filteredCis = cis.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchIp = c.ipAddress.toLowerCase().includes(q);
      const matchOwner = c.owner.toLowerCase().includes(q);
      const matchNum = c.ciNumber.toLowerCase().includes(q);
      if (!matchName && !matchIp && !matchOwner && !matchNum) return false;
    }
    if (selectedClass !== 'ALL' && c.ciClass !== selectedClass) return false;
    return true;
  });

  const getCiIcon = (ciClass: string) => {
    switch (ciClass) {
      case 'Database Cluster':
        return <Database className="w-4 h-4 text-emerald-400" />;
      case 'Next-Gen Firewall':
        return <Shield className="w-4 h-4 text-amber-400" />;
      case 'Virtual Machine':
        return <Server className="w-4 h-4 text-sky-400" />;
      case 'Storage SAN Array':
        return <HardDrive className="w-4 h-4 text-purple-400" />;
      case 'Core Router':
        return <Network className="w-4 h-4 text-cyan-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  const ciTickets = selectedCi
    ? tickets.filter((t) => t.affectedCIId === selectedCi.id)
    : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center space-x-2">
          <Server className="w-5 h-5 text-emerald-400" />
          <span>CMDB & Infrastructure Topology</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Enterprise Configuration Item (CI) registry, relationships, IP assignments, and live incident correlation
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search CI by Hostname, IP address, Owner, Serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-1">
          <span className="text-slate-500 text-[11px] font-mono">CI Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs"
          >
            <option value="ALL">All Classes ({cis.length})</option>
            <option value="Virtual Machine">Virtual Machines</option>
            <option value="Database Cluster">Database Clusters</option>
            <option value="Next-Gen Firewall">Firewalls & Perimeter</option>
            <option value="Core Router">Core Routing</option>
            <option value="Storage SAN Array">Storage SAN</option>
          </select>
        </div>
      </div>

      {/* Split View: CI List & CI Detail Topology */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: CI Table/Cards */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-3 max-h-[calc(100vh-250px)] overflow-y-auto space-y-2">
          {filteredCis.map((ci) => {
            const isSelected = selectedCi?.id === ci.id;
            return (
              <div
                key={ci.id}
                onClick={() => setSelectedCi(ci)}
                className={`p-3 rounded-lg border transition cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-600 shadow'
                    : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getCiIcon(ci.ciClass)}
                    <span className="font-semibold text-slate-200 text-xs font-mono">{ci.name}</span>
                  </div>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                      ci.status === 'OPERATIONAL'
                        ? 'bg-emerald-950 text-emerald-400'
                        : 'bg-rose-950 text-rose-400'
                    }`}
                  >
                    {ci.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1.5">
                  <span className="text-amber-300/90">{ci.ipAddress}</span>
                  <span>{ci.environment}</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-1">
                  {ci.dataCenter} • Owner: {ci.owner}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected CI Telemetry & Topology Canvas */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          {selectedCi ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                      {selectedCi.ciNumber}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {selectedCi.ciClass}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                      {selectedCi.environment}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mt-1">{selectedCi.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Located at {selectedCi.dataCenter} • Owned by {selectedCi.owner}
                  </p>
                </div>

                <div className="text-right font-mono text-xs">
                  <span className="text-slate-400 block text-[10px]">Primary IP</span>
                  <strong className="text-amber-300 text-sm">{selectedCi.ipAddress}</strong>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">OS / Firmware</span>
                  <p className="font-medium text-slate-200 mt-0.5 truncate">{selectedCi.osVersion}</p>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">vCPU / Compute</span>
                  <p className="font-medium text-slate-200 mt-0.5 font-mono">{selectedCi.vCpu || 'N/A'}</p>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">RAM Memory</span>
                  <p className="font-medium text-slate-200 mt-0.5 font-mono">
                    {selectedCi.ramGb ? `${selectedCi.ramGb} GB` : 'N/A'}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Storage Volume</span>
                  <p className="font-medium text-slate-200 mt-0.5 font-mono">
                    {selectedCi.diskGb ? `${selectedCi.diskGb} GB` : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Upstream / Downstream Topology Links */}
              <div>
                <h4 className="font-mono uppercase text-slate-400 text-[11px] font-semibold mb-2 flex items-center space-x-1.5">
                  <Network className="w-3.5 h-3.5 text-sky-400" />
                  <span>Upstream & Downstream Infrastructure Relationships</span>
                </h4>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3 font-mono text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 text-[11px] w-28">Parent Uplink:</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-750 text-slate-200">
                      SW-CORE-EQUINIX-01 (10.240.0.1)
                    </span>
                    <span className="text-slate-500 text-[11px]">→ VLAN 100 Trunk</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 text-[11px] w-28">Perimeter Guard:</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-750 text-amber-300">
                      FW-PALOALTO-PROD-01 (10.240.1.1)
                    </span>
                    <span className="text-slate-500 text-[11px]">→ Zone: Internal-App</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 text-[11px] w-28">Storage SAN:</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-750 text-purple-300">
                      SAN-STORAGE-TIER1 (10.240.40.1)
                    </span>
                    <span className="text-slate-500 text-[11px]">→ LUN 404 FiberChannel</span>
                  </div>
                </div>
              </div>

              {/* Linked Tickets & Incidents */}
              <div>
                <h4 className="font-mono uppercase text-slate-400 text-[11px] font-semibold mb-2 flex items-center justify-between">
                  <span>Linked Incidents & Work Orders ({ciTickets.length})</span>
                </h4>
                {ciTickets.length === 0 ? (
                  <p className="text-slate-500 text-xs italic">No active incidents associated with this CI.</p>
                ) : (
                  <div className="space-y-1.5">
                    {ciTickets.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => onSelectTicket && onSelectTicket(t.id)}
                        className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between hover:bg-slate-850 cursor-pointer transition text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-sky-400">{t.ticketNumber}</span>
                          <span className="text-slate-200 truncate max-w-sm">{t.title}</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 text-[10px]">
                            {t.status}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-slate-500 text-center py-12">Select a Configuration Item to view telemetry.</p>
          )}
        </div>
      </div>
    </div>
  );
};
