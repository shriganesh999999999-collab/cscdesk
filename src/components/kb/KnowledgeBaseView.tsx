import React, { useState, useEffect } from 'react';
import { KnowledgeArticle } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  BookOpen,
  Search,
  Plus,
  Terminal,
  Copy,
  Check,
  Tag,
  Server,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatDateTime } from '../../lib/utils';

export const KnowledgeBaseView: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  useEffect(() => {
    api.getKnowledgeArticles().then((res) => {
      setArticles(res);
      if (res.length > 0) setExpandedId(res[0].id);
    });
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    showToast('info', 'Copied to Clipboard', 'Diagnostic command copied.');
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const filteredArticles = articles.filter((a) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = a.articleNumber.toLowerCase().includes(q);
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchProblem = a.problem.toLowerCase().includes(q);
      const matchTags = a.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchNum && !matchTitle && !matchProblem && !matchTags) return false;
    }
    if (categoryFilter !== 'ALL' && a.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <span>Standard Operating Procedures & Knowledge Base</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Peer-reviewed engineering playbooks, incident workarounds, and command syntax (Section 41)
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search KB: Problem statement, tags, Linux/BGP commands, error logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center space-x-1">
          <span className="text-slate-500 text-[11px] font-mono">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs"
          >
            <option value="ALL">All Categories</option>
            <option value="Database Administration">Database Administration</option>
            <option value="Network & Security">Network & Security</option>
            <option value="Cloud Operations">Cloud Operations</option>
            <option value="Enterprise Storage & Backup">Enterprise Storage & Backup</option>
          </select>
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-3">
        {filteredArticles.map((art) => {
          const isExpanded = expandedId === art.id;
          return (
            <div
              key={art.id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition shadow"
            >
              {/* Header Bar */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : art.id)}
                className="p-4 bg-slate-900 hover:bg-slate-850 cursor-pointer flex items-center justify-between transition"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-mono text-xs font-bold text-purple-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {art.articleNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                      v{art.version}.0
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono">
                      {art.status}
                    </span>
                    {art.createdFromTicketNumber && (
                      <span className="text-[10px] text-sky-400 font-mono">
                        From: {art.createdFromTicketNumber}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 truncate">{art.title}</h3>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{art.problem}</p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right hidden sm:block text-[11px] font-mono text-slate-500">
                    <span>Author: {art.authorName}</span>
                    <span className="block text-[10px]">{formatDateTime(art.updatedAt).split(',')[0]}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Body */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-800/80 bg-slate-950/60 space-y-4 text-xs text-slate-300">
                  {/* Problem & Cause */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="font-mono text-[11px] uppercase text-slate-400 font-semibold block mb-1">
                        Problem Statement & Symptoms
                      </span>
                      <p className="leading-relaxed">{art.problem}</p>
                      <p className="text-slate-400 mt-2 italic text-[11px]">Symptoms: {art.symptoms}</p>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="font-mono text-[11px] uppercase text-slate-400 font-semibold block mb-1">
                        Root Cause Diagnosis
                      </span>
                      <p className="leading-relaxed">{art.cause}</p>
                      {art.workaround && (
                        <div className="mt-2 text-amber-300 bg-amber-950/50 p-2 rounded border border-amber-900 text-[11px]">
                          <strong>Workaround:</strong> {art.workaround}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resolution Steps */}
                  <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="font-mono text-[11px] uppercase text-purple-300 font-semibold block mb-1.5">
                      Standard Operating Resolution Procedure
                    </span>
                    <div className="leading-relaxed whitespace-pre-wrap text-slate-200">
                      {art.resolution}
                    </div>
                  </div>

                  {/* Commands / Script Box */}
                  {art.commands && (
                    <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[11px] uppercase text-sky-400 font-semibold flex items-center">
                          <Terminal className="w-3.5 h-3.5 mr-1" />
                          Diagnostic & Remediation Commands
                        </span>
                        <button
                          onClick={() => handleCopy(art.commands!, art.id)}
                          className="flex items-center space-x-1 text-[11px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        >
                          {copiedCmd === art.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Shell Command</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-2.5 bg-slate-900 rounded border border-slate-850 font-mono text-[11px] text-sky-300 overflow-x-auto">
                        {art.commands}
                      </pre>
                    </div>
                  )}

                  {/* Tags and Applicable Systems */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px]">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-500" />
                      {art.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="text-slate-500 font-mono">
                      Applicable Systems: {art.applicableSystems.join(', ')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
