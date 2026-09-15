import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { Header } from './components/layout/Header';
import { Sidebar, NavItem } from './components/layout/Sidebar';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { CreateTicketModal } from './components/tickets/CreateTicketModal';
import { TicketListView } from './components/tickets/TicketListView';
import { TicketDetail } from './components/tickets/TicketDetail';
import { OperationsDashboard } from './components/dashboard/OperationsDashboard';
import { ApprovalsView } from './components/approvals/ApprovalsView';
import { CMDBTopologyView } from './components/cmdb/CMDBTopologyView';
import { KnowledgeBaseView } from './components/kb/KnowledgeBaseView';
import { ServiceCatalogView } from './components/catalog/ServiceCatalogView';
import { SLAMatrixView } from './components/sla/SLAMatrixView';
import { VendorInvoiceView } from './components/reports/VendorInvoiceView';
import { AuditTrailView } from './components/audit/AuditTrailView';
import { MonitoringView } from './components/monitoring/MonitoringView';
import { BackupView } from './components/backup/BackupView';
import { AdminConsoleView } from './components/admin/AdminConsoleView';
import { api } from './services/api';
import { Ticket, TicketType } from './types';

const MainLayout: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<NavItem>('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialType, setCreateInitialType] = useState<TicketType>('Incident');

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTickets();
      setTickets(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Global hotkey: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openTicketDetail = (ticketId: string) => {
    setSelectedTicketId(ticketId);
  };

  const handleTicketCreated = (newTicket: Ticket) => {
    fetchTickets();
    setSelectedTicketId(newTicket.id);
  };

  const handleTicketUpdated = (updatedTicket: Ticket) => {
    setTickets((prev) => prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)));
  };

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || null;

  // Counters
  const pendingApprovalsCount = tickets
    .flatMap((t) => t.approvals)
    .filter(
      (a) =>
        a.status === 'PENDING' &&
        (a.approverUserId === currentUser.id ||
          a.approverRole === currentUser.role ||
          currentUser.role === 'Super Admin')
    ).length;

  const myOpenTicketsCount = tickets.filter(
    (t) =>
      (t.requesterId === currentUser.id || t.currentAssigneeId === currentUser.id) &&
      t.status !== 'CLOSED' &&
      t.status !== 'RESOLVED'
  ).length;

  const handleSelectServiceFromCatalog = (serviceType: 'vm' | 'firewall' | 'standard') => {
    if (serviceType === 'vm') setCreateInitialType('VM Request');
    else if (serviceType === 'firewall') setCreateInitialType('Firewall Whitelist');
    else setCreateInitialType('Service Request');
    setIsCreateOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setSelectedTicketId(null);
          }}
          onOpenCreateTicket={() => {
            setCreateInitialType('Incident');
            setIsCreateOpen(true);
          }}
          pendingApprovalsCount={pendingApprovalsCount}
          openTicketsCount={myOpenTicketsCount}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {selectedTicketId && activeTicket ? (
            <TicketDetail
              ticket={activeTicket}
              onBack={() => setSelectedTicketId(null)}
              onTicketUpdated={handleTicketUpdated}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <OperationsDashboard
                  tickets={tickets}
                  onSelectTicket={openTicketDetail}
                  onNavigateTo={(tab) => setActiveTab(tab)}
                  onOpenCreateTicket={() => {
                    setCreateInitialType('Incident');
                    setIsCreateOpen(true);
                  }}
                />
              )}

              {activeTab === 'my-tickets' && (
                <TicketListView
                  title="My Assigned & Requested Tickets"
                  subtitle={`Filtered by active user ${currentUser.name} (${currentUser.role})`}
                  tickets={tickets.filter(
                    (t) => t.requesterId === currentUser.id || t.currentAssigneeId === currentUser.id
                  )}
                  onSelectTicket={openTicketDetail}
                  onCreateTicket={() => {
                    setCreateInitialType('Incident');
                    setIsCreateOpen(true);
                  }}
                  onRefresh={fetchTickets}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'team-queue' && (
                <TicketListView
                  title={`Team Dispatch Queue: ${currentUser.team}`}
                  subtitle="Active unassigned and in-flight work orders for your operational discipline"
                  tickets={tickets.filter(
                    (t) => t.currentAssignmentGroup === currentUser.team || currentUser.role === 'Super Admin'
                  )}
                  onSelectTicket={openTicketDetail}
                  onCreateTicket={() => {
                    setCreateInitialType('Incident');
                    setIsCreateOpen(true);
                  }}
                  onRefresh={fetchTickets}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'approvals' && (
                <ApprovalsView
                  tickets={tickets}
                  onSelectTicket={openTicketDetail}
                  onRefresh={fetchTickets}
                />
              )}

              {activeTab === 'catalog' && (
                <ServiceCatalogView onSelectService={handleSelectServiceFromCatalog} />
              )}

              {activeTab === 'incidents' && (
                <TicketListView
                  title="Unscheduled Incidents & Outage Dispatches"
                  subtitle="Critical failures, degraded infrastructure services, and high-severity alarms"
                  tickets={tickets.filter((t) => t.ticketType === 'Incident')}
                  onSelectTicket={openTicketDetail}
                  onCreateTicket={() => {
                    setCreateInitialType('Incident');
                    setIsCreateOpen(true);
                  }}
                  onRefresh={fetchTickets}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'requests' && (
                <TicketListView
                  title="Service & Provisioning Requests"
                  subtitle="Standard catalog fulfillment, Multi-VM orders, and IP whitelisting"
                  tickets={tickets.filter(
                    (t) => t.ticketType === 'Service Request' || t.ticketType === 'VM Request' || t.ticketType === 'Firewall Whitelist'
                  )}
                  onSelectTicket={openTicketDetail}
                  onCreateTicket={() => {
                    setCreateInitialType('Service Request');
                    setIsCreateOpen(true);
                  }}
                  onRefresh={fetchTickets}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'changes' && (
                <TicketListView
                  title="Change Management & RFC Registry"
                  subtitle="Planned maintenance windows, CAB reviews, and rollback strategies"
                  tickets={tickets.filter((t) => t.ticketType === 'Change Request')}
                  onSelectTicket={openTicketDetail}
                  onCreateTicket={() => {
                    setCreateInitialType('Change Request');
                    setIsCreateOpen(true);
                  }}
                  onRefresh={fetchTickets}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'problems' && (
                <TicketListView
                  title="Problem Management & Known Errors (KEDB)"
                  subtitle="Root cause investigations, recurring pattern tracking, and permanent fixes"
                  tickets={tickets.filter((t) => t.ticketType === 'Problem')}
                  onSelectTicket={openTicketDetail}
                  onCreateTicket={() => {
                    setCreateInitialType('Problem');
                    setIsCreateOpen(true);
                  }}
                  onRefresh={fetchTickets}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'cmdb' && <CMDBTopologyView onSelectTicket={openTicketDetail} />}

              {activeTab === 'monitoring' && <MonitoringView />}

              {activeTab === 'backup' && <BackupView />}

              {activeTab === 'kb' && <KnowledgeBaseView />}

              {activeTab === 'sla' && <SLAMatrixView />}

              {activeTab === 'reports' && (
                <div className="space-y-6">
                  <VendorInvoiceView />
                </div>
              )}

              {activeTab === 'vendor-invoice' && <VendorInvoiceView />}

              {activeTab === 'audit' && <AuditTrailView />}

              {activeTab === 'admin' && <AdminConsoleView />}
            </>
          )}
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTicket={openTicketDetail}
      />

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTicketCreated={handleTicketCreated}
        initialType={createInitialType}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainLayout />
      </NotificationProvider>
    </AuthProvider>
  );
}
