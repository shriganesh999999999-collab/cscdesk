import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Ticket as TicketIcon,
  Users,
  Layers,
  CheckSquare,
  AlertTriangle,
  GitPullRequest,
  AlertOctagon,
  Server,
  Activity,
  Archive,
  BookOpen,
  Clock,
  BarChart3,
  Receipt,
  ShieldCheck,
  Settings,
  PlusCircle,
} from 'lucide-react';

export type NavItem =
  | 'dashboard'
  | 'my-tickets'
  | 'team-queue'
  | 'catalog'
  | 'approvals'
  | 'incidents'
  | 'requests'
  | 'changes'
  | 'problems'
  | 'cmdb'
  | 'monitoring'
  | 'backup'
  | 'kb'
  | 'sla'
  | 'reports'
  | 'vendor-invoice'
  | 'audit'
  | 'admin';

interface SidebarProps {
  activeTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  onOpenCreateTicket: () => void;
  pendingApprovalsCount: number;
  openTicketsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenCreateTicket,
  pendingApprovalsCount,
  openTicketsCount,
}) => {
  const { hasPermission, currentUser } = useAuth();

  interface MenuItem {
    id: NavItem;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
    permission?: string;
  }

  const coreModules: MenuItem[] = [
    { id: 'dashboard', label: 'Operations Console', icon: LayoutDashboard },
    { id: 'my-tickets', label: 'My Tickets', icon: TicketIcon, badge: openTicketsCount },
    { id: 'team-queue', label: 'Team Queue', icon: Users },
    { id: 'approvals', label: 'My Approvals', icon: CheckSquare, badge: pendingApprovalsCount, badgeColor: 'bg-amber-500 text-slate-950 font-bold' },
    { id: 'catalog', label: 'Service Catalog', icon: Layers },
  ];

  const itsmDisciplines: MenuItem[] = [
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'requests', label: 'Service Requests', icon: TicketIcon },
    { id: 'changes', label: 'Change Mgmt (RFC)', icon: GitPullRequest },
    { id: 'problems', label: 'Problem & Known Error', icon: AlertOctagon },
  ];

  const infrastructureAssets: MenuItem[] = [
    { id: 'cmdb', label: 'CMDB & CI Topology', icon: Server },
    { id: 'monitoring', label: 'Monitoring Reviews', icon: Activity },
    { id: 'backup', label: 'Backup & Recovery', icon: Archive },
    { id: 'kb', label: 'Knowledge Base', icon: BookOpen },
  ];

  const governanceAndAdmin: MenuItem[] = [
    { id: 'sla', label: 'SLA / OLA Matrices', icon: Clock },
    { id: 'reports', label: 'Executive Analytics', icon: BarChart3 },
    { id: 'vendor-invoice', label: 'Vendor Invoice Review', icon: Receipt },
    { id: 'audit', label: 'Audit Log & Evidence', icon: ShieldCheck },
    { id: 'admin', label: 'Administration', icon: Settings },
  ];

  const renderNavGroup = (title: string, items: MenuItem[]) => (
    <div className="mb-4">
      <div className="px-3 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
        {title}
      </div>
      <div className="space-y-0.5">
        {items.map((item) => {
          if (item.permission && !hasPermission(item.permission)) return null;
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium transition ${
                isActive
                  ? 'bg-sky-950/80 text-sky-300 border border-sky-800/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium shrink-0 ml-1.5 ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-[calc(100vh-3.5rem)] sticky top-14">
      {/* Quick Create Ticket Action */}
      <div className="p-3 border-b border-slate-800/80">
        <button
          onClick={onOpenCreateTicket}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-sky-950/40 transition active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Ticket</span>
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 scrollbar-thin scrollbar-thumb-slate-800">
        {renderNavGroup('Service Desk & Queues', coreModules)}
        {renderNavGroup('ITSM Disciplines', itsmDisciplines)}
        {renderNavGroup('Infrastructure & CMDB', infrastructureAssets)}
        {renderNavGroup('Governance & Intelligence', governanceAndAdmin)}
      </div>

      {/* Footer / System Status */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px] text-slate-300">All Systems Normal</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">v2026.9</span>
      </div>
    </aside>
  );
};
