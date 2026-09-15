import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  RotateCcw,
  Shield,
  UserCheck,
  ChevronDown,
  Bell,
  Cpu,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

interface HeaderProps {
  onOpenSearch: () => void;
  pendingApprovalsCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, pendingApprovalsCount }) => {
  const { currentUser, switchUser, demoUsers } = useAuth();
  const { showToast } = useNotification();
  const [showPersonaDropdown, setShowPersonaDropdown] = useState(false);

  const handleResetData = () => {
    if (confirm('Reset demo state back to default seed data? All temporary changes will be re-initialized.')) {
      api.resetDemoData();
      showToast('info', 'Demo Data Reset', 'Initial enterprise tickets, tasks, and audit logs restored.');
      window.location.reload();
    }
  };

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 lg:px-6">
      {/* Left: Branding & Environment Indicator */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold shadow-lg shadow-sky-900/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-sm text-slate-100 tracking-tight">Enterprise ITSM</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-sky-950 text-sky-400 border border-sky-800/80">
                PROD-NOC
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono leading-none">Global Infrastructure Operations</p>
          </div>
        </div>
      </div>

      {/* Center: Global Search Trigger Bar */}
      <div className="flex-1 max-w-lg mx-4 hidden md:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-400 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 rounded-lg hover:border-slate-700 transition"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Search Tickets, Hostnames, IPs, CIs, Knowledge Articles...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-850 border border-slate-700 rounded text-slate-400">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Persona Switcher & Operations Tools */}
      <div className="flex items-center space-x-3">
        {/* Reset Demo State */}
        <button
          onClick={handleResetData}
          title="Reset Demo Data"
          className="flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden xl:inline text-[11px]">Reset Demo</span>
        </button>

        {/* Pending Approvals Bell Alert */}
        <div className="relative">
          <div className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition cursor-pointer">
            <Bell className="w-4 h-4" />
            {pendingApprovalsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-slate-950 animate-pulse" />
            )}
          </div>
        </div>

        {/* Persona Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaDropdown(!showPersonaDropdown)}
            className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-750 transition"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-6 h-6 rounded-full object-cover border border-slate-700"
            />
            <div className="text-left hidden sm:block">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-semibold text-slate-200">{currentUser.name}</span>
                <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-sky-400 border border-slate-700">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-[140px] leading-tight">{currentUser.team}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Persona Menu */}
          {showPersonaDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-[11px] font-bold uppercase tracking-wider text-sky-400 font-mono flex items-center">
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                  Quick Role Switcher
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Select persona to test role-based RBAC, approvals, and queue handling:
                </p>
              </div>

              <div className="max-h-72 overflow-y-auto py-1">
                {demoUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      switchUser(user.id);
                      setShowPersonaDropdown(false);
                      showToast('info', `Switched Persona to ${user.name}`, `Active Role: ${user.role}`);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-start space-x-2.5 hover:bg-slate-800 transition ${
                      user.id === currentUser.id ? 'bg-sky-950/60 border-l-2 border-sky-400' : ''
                    }`}
                  >
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-700 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-200 truncate">{user.name}</span>
                        <span className="text-[10px] font-mono text-sky-400 bg-slate-800 px-1.5 py-0.2 rounded">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{user.designation}</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{user.department}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
