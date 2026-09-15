import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { VMRequestForm } from './VMRequestForm';
import { FirewallRequestForm } from './FirewallRequestForm';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  AlertTriangle,
  Server,
  Shield,
  Layers,
  FileText,
  AlertCircle,
  Link2,
} from 'lucide-react';
import { Ticket, ConfigurationItem, PriorityLevel, ImpactLevel, UrgencyLevel, TicketType } from '../../types';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: (ticket: Ticket) => void;
  initialType?: TicketType;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onTicketCreated,
  initialType = 'Incident',
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<TicketType>(initialType);
  const [cis, setCis] = useState<ConfigurationItem[]>([]);

  // Standard Incident / Request state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [impact, setImpact] = useState<ImpactLevel>('Department');
  const [urgency, setUrgency] = useState<UrgencyLevel>('High');
  const [category, setCategory] = useState('Network & Security');
  const [subcategory, setSubcategory] = useState('Core Routing & BGP');
  const [service, setService] = useState('Corporate WAN & Internet Backbone');
  const [selectedCiId, setSelectedCiId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Duplicate ticket suggestions (Section 44)
  const [potentialDuplicates, setPotentialDuplicates] = useState<Ticket[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.getCIs().then(setCis);
      setActiveTab(initialType);
    }
  }, [isOpen, initialType]);

  // Check duplicates debounced
  useEffect(() => {
    if (!title || title.length < 5) {
      setPotentialDuplicates([]);
      return;
    }
    const timer = setTimeout(() => {
      api.checkPossibleDuplicates(title, category, selectedCiId || undefined).then(setPotentialDuplicates);
    }, 400);
    return () => clearTimeout(timer);
  }, [title, category, selectedCiId]);

  // Calculate Suggested Priority based on Impact x Urgency (Section 18)
  const calculatePriority = (imp: ImpactLevel, urg: UrgencyLevel): PriorityLevel => {
    if (imp === 'Enterprise' || imp === 'Critical Public Service' || urg === 'Critical') {
      if (urg === 'Critical' || urg === 'High') return 'P1';
      return 'P2';
    }
    if (imp === 'Multiple Departments' || imp === 'Department') {
      if (urg === 'High') return 'P2';
      if (urg === 'Medium') return 'P3';
      return 'P4';
    }
    if (urg === 'High') return 'P3';
    return 'P4';
  };

  const calculatedPriority = calculatePriority(impact, urgency);

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('error', 'Validation Error', 'Ticket title is mandatory.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCi = cis.find((c) => c.id === selectedCiId);
      const ticket = await api.createTicket(
        {
          title,
          description,
          ticketType: activeTab,
          priority: calculatedPriority,
          impact,
          urgency,
          category,
          subcategory,
          service,
          department: currentUser.department,
          affectedCIId: selectedCi?.id,
          affectedCIName: selectedCi?.name,
          affectedIP: selectedCi?.ipAddress,
          environment: selectedCi?.environment || 'PROD',
          currentAssignmentGroup:
            category === 'Database Administration'
              ? 'Database Administration'
              : category === 'Enterprise Storage & Backup'
              ? 'Backup & Storage'
              : 'Network & Security',
        },
        currentUser
      );

      showToast('success', 'Ticket Registered', `${ticket.ticketNumber} successfully raised.`);
      onTicketCreated(ticket);
      onClose();
    } catch (err: any) {
      showToast('error', 'Submission Failed', err?.message || 'Error creating ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Service Ticket"
      subtitle="Select the operational category and provide accurate technical telemetry"
      maxWidth="4xl"
    >
      {/* Type Selector Tabs */}
      <div className="flex border-b border-slate-800 mb-5 space-x-2">
        <button
          onClick={() => setActiveTab('Incident')}
          className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium border-b-2 transition ${
            activeTab === 'Incident'
              ? 'border-rose-500 text-rose-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>Incident / Outage</span>
        </button>

        <button
          onClick={() => setActiveTab('VM Request')}
          className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium border-b-2 transition ${
            activeTab === 'VM Request'
              ? 'border-sky-500 text-sky-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-3.5 h-3.5 text-sky-400" />
          <span>VM Provisioning Request</span>
        </button>

        <button
          onClick={() => setActiveTab('Firewall Whitelist')}
          className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium border-b-2 transition ${
            activeTab === 'Firewall Whitelist'
              ? 'border-amber-500 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Firewall / Whitelist</span>
        </button>

        <button
          onClick={() => setActiveTab('Service Request')}
          className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium border-b-2 transition ${
            activeTab === 'Service Request'
              ? 'border-cyan-500 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>General Service Request</span>
        </button>
      </div>

      {/* Conditional Rendering by Active Tab */}
      {activeTab === 'VM Request' && (
        <VMRequestForm
          onSuccess={(ticket) => {
            onTicketCreated(ticket);
            onClose();
          }}
          onCancel={onClose}
        />
      )}

      {activeTab === 'Firewall Whitelist' && (
        <FirewallRequestForm
          onSuccess={(ticket) => {
            onTicketCreated(ticket);
            onClose();
          }}
          onCancel={onClose}
        />
      )}

      {(activeTab === 'Incident' || activeTab === 'Service Request' || activeTab === 'Problem' || activeTab === 'Change Request') && (
        <form onSubmit={handleStandardSubmit} className="space-y-4 text-xs text-slate-300">
          {/* Duplicate ticket prevention banner (Section 44) */}
          {potentialDuplicates.length > 0 && (
            <div className="p-3 bg-amber-950/80 border border-amber-700/80 rounded-lg text-amber-200 animate-in fade-in">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold text-xs">Duplicate Ticket Prevention Warning:</span>
                  <p className="text-[11px] text-amber-300/90 mt-0.5">
                    Found {potentialDuplicates.length} open ticket(s) with matching symptoms or affected CI:
                  </p>
                  <div className="mt-1.5 space-y-1">
                    {potentialDuplicates.map((dup) => (
                      <div
                        key={dup.id}
                        className="flex items-center justify-between text-[11px] bg-amber-900/60 px-2 py-1 rounded"
                      >
                        <span className="font-mono font-bold text-amber-100">{dup.ticketNumber}: {dup.title}</span>
                        <span className="text-[10px] text-amber-300">Status: {dup.status}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-amber-400/80 mt-1">
                    You may continue creating this as a separate ticket, or coordinate with the assigned engineer.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Issue Summary / Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Core Border Router BGP Session Flapping on transit circuit"
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 text-xs focus:border-sky-500 focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Detailed Description & Symptoms *</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what occurred, error logs, affected users, and recent actions..."
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 text-xs focus:border-sky-500 focus:outline-none"
              required
            />
          </div>

          {/* Classification & CI Association */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-100"
              >
                <option value="Network & Security">Network & Security</option>
                <option value="Database Administration">Database Administration</option>
                <option value="Cloud Operations">Cloud Operations</option>
                <option value="Enterprise Storage & Backup">Enterprise Storage & Backup</option>
                <option value="IT Service Desk">IT Service Desk</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Impact Level</label>
              <select
                value={impact}
                onChange={(e) => setImpact(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-100"
              >
                <option value="Individual">Individual User</option>
                <option value="Small Team">Small Team</option>
                <option value="Department">Department</option>
                <option value="Multiple Departments">Multiple Departments</option>
                <option value="Enterprise">Enterprise Wide</option>
                <option value="Critical Public Service">Critical Public Service</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Urgency Level</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-100"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Affected CI association from CMDB */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Affected CMDB Asset / CI</label>
              <select
                value={selectedCiId}
                onChange={(e) => setSelectedCiId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-100 font-mono text-xs"
              >
                <option value="">-- No specific CI linked --</option>
                {cis.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.ipAddress}) - {c.ciClass}
                  </option>
                ))}
              </select>
            </div>

            {/* Calculated Priority Matrix Card */}
            <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-md flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Calculated Priority:</span>
                <p className="text-xs text-slate-300 font-medium">Impact ({impact}) × Urgency ({urgency})</p>
              </div>
              <span
                className={`px-2.5 py-1 rounded font-mono font-bold text-xs border ${
                  calculatedPriority === 'P1'
                    ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                    : calculatedPriority === 'P2'
                    ? 'bg-amber-950 text-amber-300 border-amber-700'
                    : calculatedPriority === 'P3'
                    ? 'bg-sky-950 text-sky-300 border-sky-700'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {calculatedPriority} Suggested
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : `Submit ${activeTab}`}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
