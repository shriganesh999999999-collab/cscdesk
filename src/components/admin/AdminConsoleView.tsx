import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Settings, Users, Database, ShieldAlert, RotateCcw, Server } from 'lucide-react';
import { ALL_ORGANIZATION_USERS } from '../../services/mockData';

export const AdminConsoleView: React.FC = () => {
  const { currentUser, switchUser } = useAuth();
  const { showToast } = useNotification();

  const handleReset = () => {
    if (confirm('Reset entire ITSM state back to default seed data? All tickets, tasks, and audit records will be refreshed.')) {
      api.resetDemoData();
      showToast('info', 'System Re-initialized', 'Default ITSM state restored.');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 text-xs text-slate-300">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center space-x-2">
          <Settings className="w-5 h-5 text-sky-400" />
          <span>ITSM Platform Administration & RBAC</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Role-Based Access Control directory, service dispatch queues, and persistence management
        </p>
      </div>

      {/* Persistence & Demo Reset Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Unified Repository Engine (Stateful Demo / REST Adapter)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Currently operating in browser-persisted stateful adapter mode with automatic backend REST fallback (/api/v1).
            </p>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold text-xs transition shadow"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Re-initialize All Data</span>
          </button>
        </div>
      </div>

      {/* Users & Personas Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Enterprise User Directory & Security Roles (RBAC)</h3>
            <p className="text-[11px] text-slate-400">Click "Impersonate" to instantly switch the active authenticated context</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {ALL_ORGANIZATION_USERS.length} Configured Personas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 text-[11px] font-mono uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">User & Avatar</th>
                <th className="px-4 py-3">Role & Permissions</th>
                <th className="px-4 py-3">Team & Assignment Group</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3 text-right">Impersonate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-xs">
              {ALL_ORGANIZATION_USERS.map((user) => (
                <tr
                  key={user.id}
                  className={`hover:bg-slate-850/50 transition ${
                    user.id === currentUser.id ? 'bg-sky-950/30' : ''
                  }`}
                >
                  <td className="px-4 py-3 flex items-center space-x-2.5">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <strong className="text-slate-100 font-semibold block">{user.name}</strong>
                      <span className="text-[11px] text-slate-500 font-mono">{user.email}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-750 text-sky-300 font-bold text-[11px]">
                      {user.role}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">
                      {user.designation}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">
                    {user.team}
                  </td>

                  <td className="px-4 py-3 text-slate-400">{user.department}</td>

                  <td className="px-4 py-3 text-right">
                    {user.id === currentUser.id ? (
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        Current User
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          switchUser(user.id);
                          showToast('info', `Switched to ${user.name}`, `Active Role: ${user.role}`);
                        }}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded text-xs transition"
                      >
                        Switch Role
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
