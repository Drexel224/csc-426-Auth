import { useState } from 'react';
import { motion } from 'motion/react';
import { LogOut, ShieldCheck, Terminal, Disc, Cpu, Clock, RefreshCcw, Wifi, Key, FileText, UserCheck } from 'lucide-react';
import { ActiveSession, SecurityLog } from '../types';

interface DashboardProps {
  session: ActiveSession;
  logs: SecurityLog[];
  onLogout: () => void;
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
  addLog: (action: string, status: 'success' | 'failure' | 'warning' | 'info', details: string) => void;
}

export default function Dashboard({
  session,
  logs,
  onLogout,
  addToast,
  addLog,
}: DashboardProps) {
  const [sessionToken, setSessionToken] = useState(session.token);
  const [latencySim, setLatencySim] = useState('11ms');
  const [isRotating, setIsRotating] = useState(false);

  const rotateToken = () => {
    setIsRotating(true);
    addLog('Token Rotation', 'info', 'Triggering Cryptographic Token Rotation');

    setTimeout(() => {
      const array = new Uint8Array(24);
      window.crypto.getRandomValues(array);
      const hexToken = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
      const newToken = `sandbox_jwt_${hexToken}`;
      setSessionToken(newToken);
      setLatencySim(`${Math.floor(Math.random() * 25) + 5}ms`);
      setIsRotating(false);
      addToast('success', 'Token Rotated Successfully', 'Assigned a new cryptographically randomized hash.');
      addLog('Token Rotation', 'success', `Generated secret: ${newToken.slice(0, 16)}...`);
    }, 1000);
  };

  const clearSandboxHistory = () => {
    addToast('info', 'Sandbox Reset', 'Interactive node logs cleaned.');
    addLog('System Logs Cleared', 'info', 'User wiped local session activity history');
  };

  return (
    <div id="dashboard-section" className="space-y-6">
      {/* Header Profile Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-indigo-950 text-white rounded-2xl shadow-lg border border-indigo-900/40">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-900 text-indigo-300 border border-indigo-500/30">
              <UserCheck className="h-6 w-6" />
            </div>
            <span className="absolute bottom-[-2px] right-[-2px] block h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-indigo-950 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display leading-tight">{session.fullName}</h3>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-indigo-300">@{session.username}</span>
              <span className="text-indigo-800">•</span>
              <span>{session.email}</span>
            </p>
          </div>
        </div>

        {/* Logout Button (Target high for mobile) */}
        <button
          id="btn-logout"
          onClick={onLogout}
          className="h-11 sm:h-10 px-4 bg-rose-500/15 hover:bg-rose-600 text-rose-350 hover:text-white border border-rose-500/20 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all self-stretch sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          Terminate Session
        </button>
      </div>

      {/* Overview Analytics row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Node Clearance State
            </span>
            <span className="text-sm font-semibold text-slate-800">ACTIVE HANDSHAKE</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Server Ping latency
            </span>
            <span className="text-sm font-semibold text-slate-800">{latencySim} (Verified)</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Simulation Session Time
            </span>
            <span className="text-xs font-mono font-semibold text-slate-800 truncate block max-w-[150px]">
              {new Date(session.loginTime).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Cryptographic Token Token / Telemetry State */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Token Area */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-slate-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Cryptographic Session Handshake
                </h4>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-bold">
                JWT verified
              </span>
            </div>

            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Assigned Token Hash (Simulated JSON Web Token)
            </label>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-700 break-all select-all leading-normal select-text">
              {sessionToken}
            </div>

            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              Upon successful validation of the credentials, our system generates a cryptographically random session token to bypass subsequent password inputs.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              id="btn-rotate-token"
              disabled={isRotating}
              onClick={rotateToken}
              className="w-full h-11 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-100"
            >
              <RefreshCcw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
              {isRotating ? 'Regenerating Signature...' : 'Rotate Security Token'}
            </button>
          </div>
        </div>

        {/* System & Telemetry specifications */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-slate-700" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Session Client Telemetry
            </h4>
          </div>

          <div className="table w-full text-xs">
            <div className="table-row border-b border-slate-100 bg-slate-50/50">
              <div className="table-cell py-2.5 px-3 font-semibold text-slate-500 w-1/3">Client IP Address</div>
              <div className="table-cell py-2.5 px-3 font-mono font-medium text-slate-800">{session.ipAddress}</div>
            </div>
            <div className="table-row border-b border-slate-100">
              <div className="table-cell py-2.5 px-3 font-semibold text-slate-500">Sign-In Protocol</div>
              <div className="table-cell py-2.5 px-3 font-medium text-slate-800">Secure SHA-256 Digest</div>
            </div>
            <div className="table-row border-b border-slate-100 bg-slate-50/50">
              <div className="table-cell py-2.5 px-3 font-semibold text-slate-500">Node Cluster</div>
              <div className="table-cell py-2.5 px-3 font-mono font-medium text-slate-800">sandbox-main-01</div>
            </div>
            <div className="table-row">
              <div className="table-cell py-2.5 px-3 font-semibold text-slate-500">Browser User Agent</div>
              <div className="table-cell py-2.5 px-3 text-slate-700 line-clamp-1 truncate max-w-[200px]" title={session.userAgent}>
                {session.userAgent}
              </div>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl">
            <p className="text-xs text-indigo-950 font-medium leading-relaxed">
              <b>Authentication Success Alert</b>: The active browser environment was verified against standard validation limits, and local session caches have been updated.
            </p>
          </div>
        </div>
      </div>

      {/* Security Audit Log */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-slate-700" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Sandbox Activity Security Audit
            </h4>
          </div>
          <button
            id="btn-clear-logs"
            onClick={clearSandboxHistory}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            Clear Log Matrix
          </button>
        </div>

        <div className="bg-slate-950 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-slate-300 max-h-48 overflow-y-auto scrollbar-thin">
          <div className="flex items-center gap-2 text-slate-500 border-b border-slate-800/80 pb-2 mb-2">
            <Disc className="w-3.5 h-3.5 text-teal-500 animate-pulse" />
            <span>LOCAL MEMORY KERNEL LOG MATRIX (LATEST LOGS FIRST)</span>
          </div>
          <div className="space-y-1.5 select-text">
            {[...logs].reverse().map((log) => {
              const colorMap = {
                success: 'text-emerald-400',
                failure: 'text-rose-400',
                warning: 'text-amber-400',
                info: 'text-blue-400',
              };

              return (
                <div key={log.id} className="flex flex-col sm:flex-row sm:items-start gap-1 pb-1.5 border-b border-slate-900 last:border-0">
                  <span className="text-slate-500 shrink-0">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <div className="flex-1">
                    <span className={`font-semibold mr-1.5 uppercase ${colorMap[log.status]}`}>
                      {log.action}:
                    </span>
                    <span className="text-slate-200">{log.details}</span>
                    <span className="text-slate-500 ml-1.5">({log.ip})</span>
                  </div>
                </div>
              );
            })}
            {logs.length === 0 && (
              <div className="text-slate-500 text-center py-4">No audit trails currently in system memory.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
