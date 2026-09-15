import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Shield, ArrowRightLeft, Lock, Calendar } from 'lucide-react';
import { Ticket } from '../../types';

interface FirewallRequestFormProps {
  onSuccess: (createdTicket: Ticket) => void;
  onCancel: () => void;
}

export const FirewallRequestForm: React.FC<FirewallRequestFormProps> = ({ onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  const [title, setTitle] = useState('Production Ingress Port Opening: External Payment Webhook');
  const [sourceIp, setSourceIp] = useState('198.51.100.40/29');
  const [destinationIp, setDestinationIp] = useState('10.240.1.254');
  const [port, setPort] = useState('8443');
  const [protocol, setProtocol] = useState<'TCP' | 'UDP' | 'ICMP' | 'ANY'>('TCP');
  const [urlFqdn, setUrlFqdn] = useState('webhook.enterprise-payments.com');
  const [environment, setEnvironment] = useState<'DEV' | 'UAT' | 'PRE-PROD' | 'PROD' | 'DR'>('PROD');
  const [direction, setDirection] = useState<'Ingress (Internet to DMZ)' | 'Egress (Internal to Internet)' | 'East-West (Inter-VLAN)'>('Ingress (Internet to DMZ)');
  const [dataClassification, setDataClassification] = useState<'Public' | 'Internal' | 'Confidential' | 'Restricted / PCI-DSS'>('Restricted / PCI-DSS');
  const [isTemporary, setIsTemporary] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [justification, setJustification] = useState(
    'Required for webhook confirmation on incoming settlements from certified payment aggregator. PCI-DSS compliance scope.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceIp.trim() || !destinationIp.trim() || !port.trim()) {
      showToast('error', 'Validation Error', 'Source IP, Destination IP, and Port are mandatory.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ticket = await api.createTicket(
        {
          title: `Firewall Whitelist: ${sourceIp} -> ${destinationIp}:${port} (${direction})`,
          description: `${justification}\n\nFirewall Rule Specs:\n• Direction: ${direction}\n• Source IP/CIDR: ${sourceIp}\n• Destination IP: ${destinationIp}\n• Port: ${port}\n• Protocol: ${protocol}\n• FQDN: ${urlFqdn || 'N/A'}\n• Classification: ${dataClassification}\n• Temporary: ${isTemporary ? `Yes (Expires ${expiryDate})` : 'Permanent'}`,
          ticketType: 'Firewall Whitelist',
          priority: environment === 'PROD' ? 'P2' : 'P3',
          impact: 'Department',
          urgency: 'High',
          category: 'Network & Security',
          subcategory: 'Firewall Port & Whitelist',
          service: 'Perimeter Security',
          environment,
          currentAssignmentGroup: 'Information Security',
          customFields: {
            sourceIp,
            destinationIp,
            port,
            protocol,
            urlFqdn,
            direction,
            dataClassification,
            isTemporary,
            expiryDate,
          },
        },
        currentUser
      );

      showToast(
        'success',
        'Firewall Request Submitted',
        `${ticket.ticketNumber} registered. Routed for Supervisor & CISO Security Sign-off.`
      );
      onSuccess(ticket);
    } catch (err: any) {
      showToast('error', 'Submission Failed', err?.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-xs text-slate-300">
      {/* Scope Header */}
      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
        <div className="flex items-center space-x-2 text-sky-400 font-semibold mb-1 text-sm">
          <Shield className="w-4 h-4" />
          <span>Firewall Port Opening & IP Whitelisting Workflow</span>
        </div>
        <p className="text-slate-400">
          Enforces the zero-trust security clearance chain: Requester → Supervisor → CISO Security Review → Infra Head → Ops Manager → NOC/Network Engineering.
        </p>
      </div>

      {/* Network Connectivity Vector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Direction</label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100"
          >
            <option value="Ingress (Internet to DMZ)">Ingress (Internet to DMZ)</option>
            <option value="Egress (Internal to Internet)">Egress (Internal to Internet)</option>
            <option value="East-West (Inter-VLAN)">East-West (Inter-VLAN)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">Protocol</label>
          <select
            value={protocol}
            onChange={(e) => setProtocol(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 font-mono"
          >
            <option value="TCP">TCP</option>
            <option value="UDP">UDP</option>
            <option value="ICMP">ICMP</option>
            <option value="ANY">ANY</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">Destination Port(s) *</label>
          <input
            type="text"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="e.g. 443, 8443 or 5000-5010"
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 font-mono"
            required
          />
        </div>
      </div>

      {/* IP addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Source IP / CIDR Block *</label>
          <input
            type="text"
            value={sourceIp}
            onChange={(e) => setSourceIp(e.target.value)}
            placeholder="e.g. 198.51.100.40/29 or 10.240.12.0/24"
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 font-mono"
            required
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">Destination IP / VIP *</label>
          <input
            type="text"
            value={destinationIp}
            onChange={(e) => setDestinationIp(e.target.value)}
            placeholder="e.g. 10.240.1.254 (DMZ Load Balancer)"
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 font-mono"
            required
          />
        </div>
      </div>

      {/* Domain / Classification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Destination FQDN / URL (Optional)</label>
          <input
            type="text"
            value={urlFqdn}
            onChange={(e) => setUrlFqdn(e.target.value)}
            placeholder="e.g. webhook.partner-portal.com"
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 font-mono"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium flex items-center">
            <Lock className="w-3.5 h-3.5 mr-1 text-amber-400" />
            Data Classification & Risk Level
          </label>
          <select
            value={dataClassification}
            onChange={(e) => setDataClassification(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100"
          >
            <option value="Restricted / PCI-DSS">Restricted / PCI-DSS (Requires CISO Sign-off)</option>
            <option value="Confidential">Confidential (Internal Sensitive)</option>
            <option value="Internal">Internal Corporate Traffic</option>
            <option value="Public">Public Access</option>
          </select>
        </div>
      </div>

      {/* Justification */}
      <div>
        <label className="block text-slate-400 mb-1 font-medium">Business & Technical Justification *</label>
        <textarea
          rows={3}
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 focus:border-sky-500 focus:outline-none"
          required
        />
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
          {isSubmitting ? 'Submitting...' : 'Submit Whitelist Request'}
        </button>
      </div>
    </form>
  );
};
