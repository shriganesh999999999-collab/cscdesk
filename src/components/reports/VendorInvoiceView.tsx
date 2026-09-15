import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Download,
  ShieldCheck,
  Building,
  DollarSign,
  TrendingDown,
} from 'lucide-react';

interface VendorInvoice {
  id: string;
  vendorName: string;
  serviceCategory: string;
  invoiceNumber: string;
  billingPeriod: string;
  contractedSLA: string;
  achievedSLA: string;
  outageHours: number;
  linkedTicket: string;
  billedAmount: number;
  penaltyPercentage: number;
  penaltyAmount: number;
  netPayable: number;
  status: 'PENDING_REVIEW' | 'DEDUCTION_APPROVED' | 'DISPUTED';
  approvedBy?: string;
}

export const VendorInvoiceView: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  const [invoices, setInvoices] = useState<VendorInvoice[]>([
    {
      id: 'inv-01',
      vendorName: 'Lumen Global Transit Backbone',
      serviceCategory: 'Tier-1 Internet & WAN Circuits',
      invoiceNumber: 'INV-2026-LUMEN-09',
      billingPeriod: 'August 2026',
      contractedSLA: '99.95%',
      achievedSLA: '98.20%',
      outageHours: 13.2,
      linkedTicket: 'INC-2026-000002',
      billedAmount: 48500,
      penaltyPercentage: 10,
      penaltyAmount: 4850,
      netPayable: 43650,
      status: 'PENDING_REVIEW',
    },
    {
      id: 'inv-02',
      vendorName: 'Equinix Datacenter Colocation',
      serviceCategory: 'Power & Cooling Facilities',
      invoiceNumber: 'EQX-US-202608',
      billingPeriod: 'August 2026',
      contractedSLA: '99.999%',
      achievedSLA: '100.00%',
      outageHours: 0,
      linkedTicket: 'N/A',
      billedAmount: 112000,
      penaltyPercentage: 0,
      penaltyAmount: 0,
      netPayable: 112000,
      status: 'DEDUCTION_APPROVED',
      approvedBy: 'Marcus Vance (Infra Head)',
    },
    {
      id: 'inv-03',
      vendorName: 'AWS Direct Connect 10G Dedicated',
      serviceCategory: 'Hybrid Cloud Interconnect',
      invoiceNumber: 'AWS-DIR-99120',
      billingPeriod: 'August 2026',
      contractedSLA: '99.90%',
      achievedSLA: '99.98%',
      outageHours: 0.1,
      linkedTicket: 'INC-2026-000004',
      billedAmount: 16800,
      penaltyPercentage: 0,
      penaltyAmount: 0,
      netPayable: 16800,
      status: 'DEDUCTION_APPROVED',
      approvedBy: 'David Zhao (Ops Manager)',
    },
  ]);

  const handleApproveWithDeduction = (id: string) => {
    setInvoices(
      invoices.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              status: 'DEDUCTION_APPROVED',
              approvedBy: `${currentUser.name} (${currentUser.role})`,
            }
          : inv
      )
    );
    showToast(
      'success',
      'Invoice Approved with SLA Deduction',
      'Penalty calculation validated against incident telemetry and applied.'
    );
  };

  const totalBilled = invoices.reduce((acc, i) => acc + i.billedAmount, 0);
  const totalPenalties = invoices.reduce((acc, i) => acc + i.penaltyAmount, 0);
  const totalNet = invoices.reduce((acc, i) => acc + i.netPayable, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center space-x-2">
          <Receipt className="w-5 h-5 text-sky-400" />
          <span>Vendor Invoice & SLA Penalty Deduction Review</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Audit carrier, facility, and OEM service invoices against actual incident telemetry and SLA breach penalties (Section 71)
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Gross Billed Invoices</span>
          <p className="text-2xl font-bold font-mono text-slate-100 mt-1">
            ${totalBilled.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">3 Service Provider Statements</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-rose-400 uppercase">SLA Breach Penalties Enforced</span>
          <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
            -${totalPenalties.toLocaleString()}
          </p>
          <span className="text-[10px] text-rose-300/80 font-mono">Auto-calculated from Outage Tickets</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-emerald-400 uppercase">Net Authorized Disbursement</span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            ${totalNet.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">After contractual deductions</span>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-[11px] font-mono uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Vendor & Invoice</th>
                <th className="px-4 py-3">Service Scope</th>
                <th className="px-4 py-3">SLA (Target / Actual)</th>
                <th className="px-4 py-3">Gross Billed</th>
                <th className="px-4 py-3">Penalty Deduction</th>
                <th className="px-4 py-3">Net Payable</th>
                <th className="px-4 py-3">Audit Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-850/50 transition">
                  <td className="px-4 py-3.5">
                    <strong className="text-slate-100 font-semibold block">{inv.vendorName}</strong>
                    <span className="font-mono text-[11px] text-sky-400">{inv.invoiceNumber}</span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="text-slate-200">{inv.serviceCategory}</span>
                    <span className="text-[10px] text-slate-500 block font-mono">Period: {inv.billingPeriod}</span>
                  </td>

                  <td className="px-4 py-3.5 font-mono">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-400">{inv.contractedSLA}</span>
                      <span>/</span>
                      <span
                        className={`font-bold ${
                          parseFloat(inv.achievedSLA) < parseFloat(inv.contractedSLA)
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {inv.achievedSLA}
                      </span>
                    </div>
                    {inv.outageHours > 0 && (
                      <span className="text-[10px] text-rose-300 block">
                        {inv.outageHours}h Outage ({inv.linkedTicket})
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 font-mono font-bold text-slate-200">
                    ${inv.billedAmount.toLocaleString()}
                  </td>

                  <td className="px-4 py-3.5 font-mono">
                    {inv.penaltyAmount > 0 ? (
                      <span className="text-rose-400 font-bold bg-rose-950/70 px-2 py-0.5 rounded border border-rose-800">
                        -${inv.penaltyAmount.toLocaleString()} ({inv.penaltyPercentage}%)
                      </span>
                    ) : (
                      <span className="text-slate-500">$0 (Compliant)</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 font-mono font-bold text-emerald-400 text-sm">
                    ${inv.netPayable.toLocaleString()}
                  </td>

                  <td className="px-4 py-3.5">
                    {inv.status === 'DEDUCTION_APPROVED' ? (
                      <div>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] border border-emerald-800 font-bold flex items-center w-fit">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Approved
                        </span>
                        {inv.approvedBy && (
                          <span className="text-[10px] text-slate-500 block font-mono mt-0.5 truncate max-w-[140px]">
                            {inv.approvedBy}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono text-[10px] border border-amber-800 font-bold">
                        Pending Sign-off
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    {inv.status === 'PENDING_REVIEW' ? (
                      <button
                        onClick={() => handleApproveWithDeduction(inv.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow transition"
                      >
                        Authorize Payment
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          showToast('info', 'Audit Certificate', `Sealed remittance certificate generated for ${inv.invoiceNumber}`)
                        }
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                        title="Download remittance statement"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
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
