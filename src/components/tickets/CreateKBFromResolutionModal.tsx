import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Ticket, KnowledgeArticle } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

interface CreateKBFromResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onArticleCreated: (article: KnowledgeArticle) => void;
}

export const CreateKBFromResolutionModal: React.FC<CreateKBFromResolutionModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onArticleCreated,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  const [title, setTitle] = useState(`SOP: ${ticket.title}`);
  const [problem, setProblem] = useState(ticket.description || '');
  const [symptoms, setSymptoms] = useState(
    ticket.affectedCIName ? `Observed on asset ${ticket.affectedCIName} (${ticket.affectedIP || 'N/A'})` : 'Operational disruption'
  );
  const [cause, setCause] = useState(ticket.resolutionCode || 'Configuration / Resource Exhaustion');
  const [resolution, setResolution] = useState(ticket.resolutionSummary || '');
  const [workaround, setWorkaround] = useState(ticket.resolutionWorkaround || '');
  const [commands, setCommands] = useState('# Diagnostic commands\n');
  const [tags, setTags] = useState(ticket.category.toLowerCase().replace(/\s+/g, '-'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !resolution.trim()) {
      showToast('error', 'Validation Error', 'Article Title and Resolution steps are mandatory.');
      return;
    }

    setIsSubmitting(true);
    try {
      const article = await api.createKnowledgeArticle(
        {
          title,
          problem,
          symptoms,
          cause,
          resolution,
          workaround,
          commands,
          category: ticket.category,
          applicableSystems: ticket.affectedCIName ? [ticket.affectedCIName] : ['Enterprise Core'],
          tags: tags.split(',').map((t) => t.trim()),
          createdFromTicketNumber: ticket.ticketNumber,
        },
        currentUser
      );

      showToast(
        'success',
        'Knowledge Article Published',
        `${article.articleNumber} authored from resolution of ${ticket.ticketNumber}.`
      );
      onArticleCreated(article);
      onClose();
    } catch (err: any) {
      showToast('error', 'KB Creation Failed', err?.message || 'Failed to create article');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Knowledge Base Article from Resolution"
      subtitle={`Auto-drafted from verified technical resolution on ${ticket.ticketNumber}`}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-300">
        <div className="p-3 bg-purple-950/60 border border-purple-800/80 rounded-lg flex items-center space-x-2 text-purple-200">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <p className="text-[11px]">
            Technical steps, workarounds, and command syntax captured in this ticket are pre-populated into this Standard Operating Procedure (SOP).
          </p>
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">Article Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 font-semibold focus:border-purple-500 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Problem Statement</label>
            <textarea
              rows={2}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Root Cause</label>
            <textarea
              rows={2}
              value={cause}
              onChange={(e) => setCause(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">Resolution Procedures & Permanent Fix *</label>
          <textarea
            rows={3}
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 focus:border-purple-500 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Temporary Workaround</label>
            <input
              type="text"
              value={workaround}
              onChange={(e) => setWorkaround(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium font-mono">Shell / Diagnostic Commands</label>
          <textarea
            rows={2}
            value={commands}
            onChange={(e) => setCommands(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 font-mono text-xs"
          />
        </div>

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
            className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-md transition disabled:opacity-50 flex items-center space-x-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Publishing...' : 'Publish Knowledge Article'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
