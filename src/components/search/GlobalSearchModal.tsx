import React, { useState, useEffect } from 'react';
import { Search, X, Server, Ticket as TicketIcon, BookOpen, ShieldAlert, Laptop, ArrowRight } from 'lucide-react';
import { ConfigurationItem, KnowledgeArticle, Ticket } from '../../types';
import { api } from '../../services/api';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTicket: (ticketId: string) => void;
  onSelectCI?: (ciId: string) => void;
  onSelectKB?: (kbId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTicket,
  onSelectCI,
  onSelectKB,
}) => {
  const [query, setQuery] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [cis, setCis] = useState<ConfigurationItem[]>([]);
  const [kbArticles, setKbArticles] = useState<KnowledgeArticle[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.getTickets().then(setTickets);
      api.getCIs().then(setCis);
      api.getKnowledgeArticles().then(setKbArticles);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredTickets = q
    ? tickets.filter(
        (t) =>
          t.ticketNumber.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.requesterName.toLowerCase().includes(q) ||
          (t.affectedIP && t.affectedIP.includes(q)) ||
          (t.affectedCIName && t.affectedCIName.toLowerCase().includes(q))
      )
    : [];

  const filteredCis = q
    ? cis.filter(
        (c) =>
          c.ciNumber.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.ipAddress.includes(q) ||
          c.owner.toLowerCase().includes(q)
      )
    : [];

  const filteredKb = q
    ? kbArticles.filter(
        (k) =>
          k.articleNumber.toLowerCase().includes(q) ||
          k.title.toLowerCase().includes(q) ||
          k.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          k.problem.toLowerCase().includes(q)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/40">
          <Search className="w-5 h-5 text-sky-400 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Global Search: Ticket #, IP, Hostname, CI, User, KB, RFC, Port..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-sm"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-white mr-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="py-8 text-center text-slate-500 text-xs">
              <p>Type an IP address (e.g. <span className="font-mono text-slate-400">10.240.12.45</span>), ticket number (<span className="font-mono text-slate-400">VMR-2026-000001</span>), or CI name...</p>
            </div>
          )}

          {query && filteredTickets.length === 0 && filteredCis.length === 0 && filteredKb.length === 0 && (
            <div className="py-8 text-center text-slate-500 text-xs">
              <p>No matches found for "{query}" across Tickets, CMDB, or Knowledge Base.</p>
            </div>
          )}

          {/* Tickets Section */}
          {filteredTickets.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase text-sky-400 font-semibold mb-2 flex items-center">
                <TicketIcon className="w-3.5 h-3.5 mr-1" />
                Matching Tickets ({filteredTickets.length})
              </div>
              <div className="space-y-1.5">
                {filteredTickets.slice(0, 5).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTicket(t.id);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 flex items-center justify-between group transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-sky-300">{t.ticketNumber}</span>
                        <span className="text-xs px-1.5 py-0.2 bg-slate-900 border border-slate-700 text-slate-300 rounded">
                          {t.status}
                        </span>
                        <span className="text-xs text-slate-400">{t.requesterName}</span>
                      </div>
                      <p className="text-xs text-slate-200 truncate mt-0.5 font-medium">{t.title}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition ml-2 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CMDB Configuration Items Section */}
          {filteredCis.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase text-emerald-400 font-semibold mb-2 flex items-center">
                <Server className="w-3.5 h-3.5 mr-1" />
                CMDB Configuration Items ({filteredCis.length})
              </div>
              <div className="space-y-1.5">
                {filteredCis.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-emerald-300">{c.name}</span>
                        <span className="font-mono text-xs text-amber-300 bg-slate-900/80 px-1.5 rounded">
                          {c.ipAddress}
                        </span>
                        <span className="text-xs text-slate-400">({c.ciClass})</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Owner: {c.owner} • {c.dataCenter} • {c.environment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KB Articles Section */}
          {filteredKb.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase text-purple-400 font-semibold mb-2 flex items-center">
                <BookOpen className="w-3.5 h-3.5 mr-1" />
                Knowledge Base Articles ({filteredKb.length})
              </div>
              <div className="space-y-1.5">
                {filteredKb.slice(0, 3).map((k) => (
                  <div
                    key={k.id}
                    className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-purple-300">{k.articleNumber}</span>
                      <span className="text-xs text-slate-200 font-medium">{k.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{k.problem}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
