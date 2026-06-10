import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Server, KeyRound, MonitorCheck, HelpCircle, LockKeyhole } from 'lucide-react';
import { UserAccount, SecurityLog, ActiveSession, AuthView, ToastMessage } from './types';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import Dashboard from './components/Dashboard';
import { ToastContainer } from './components/Toast';

// Ground-state account data seeded for seamless initial interaction
const INITIAL_DEMO_ACCOUNTS: UserAccount[] = [
  {
    username: 'admin',
    email: 'admin@sandbox.com',
    passwordHash: 'Admin@123!',
    fullName: 'System Administrator',
    createdAt: new Date().toISOString(),
    securityQuestion: 'birth-city',
    securityAnswer: 'london',
  },
  {
    username: 'satoshi',
    email: 'satoshi@bitcoin.org',
    passwordHash: 'Genesis@1',
    fullName: 'Satoshi Nakamoto',
    createdAt: new Date().toISOString(),
    securityQuestion: 'favorite-color',
    securityAnswer: 'orange',
  },
];

export default function App() {
  // Initialize Accounts
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('auth_sandbox_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DEMO_ACCOUNTS;
      }
    }
    return INITIAL_DEMO_ACCOUNTS;
  });

  // Save Accounts
  useEffect(() => {
    localStorage.setItem('auth_sandbox_users', JSON.stringify(accounts));
  }, [accounts]);

  // Current session states
  const [session, setSession] = useState<ActiveSession | null>(() => {
    const stored = localStorage.getItem('auth_sandbox_session');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Current screen/view state
  const [view, setView] = useState<AuthView>(() => {
    return localStorage.getItem('auth_sandbox_session') ? 'dashboard' : 'login';
  });

  // Security Logs Database
  const [logs, setLogs] = useState<SecurityLog[]>(() => {
    const defaultLogs: SecurityLog[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 360000).toISOString(),
        action: 'System Init',
        status: 'success',
        details: 'Simulated Security Sandbox launched and operational.',
        ip: '127.0.0.1',
      },
    ];
    const savedLogs = localStorage.getItem('auth_sandbox_logs');
    if (savedLogs) {
      try {
        return JSON.parse(savedLogs);
      } catch (e) {
        return defaultLogs;
      }
    }
    return defaultLogs;
  });

  // Save Logs
  useEffect(() => {
    localStorage.setItem('auth_sandbox_logs', JSON.stringify(logs));
  }, [logs]);

  // Notification Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Logs append helper
  const addLog = (
    action: string,
    status: 'success' | 'failure' | 'warning' | 'info',
    details: string
  ) => {
    const newLog: SecurityLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      action,
      status,
      details,
      ip: '127.0.0.1', // Local simulated client IP address
    };
    setLogs((prev) => [...prev, newLog]);
  };

  // Toast append helper
  const addToast = (
    type: 'success' | 'error' | 'info' | 'warning',
    title: string,
    description?: string
  ) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      description,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const handleRemoveToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Navigation controller
  const navigateTo = (nextView: AuthView) => {
    setView(nextView);
  };

  // Authentication controllers
  const handleLoginSuccess = (user: UserAccount) => {
    // Generate a secure simulated token hash
    const array = new Uint8Array(24);
    window.crypto.getRandomValues(array);
    const hexToken = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    const randomToken = `sandbox_jwt_${hexToken}`;

    const newSession: ActiveSession = {
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      token: randomToken,
      loginTime: new Date().toISOString(),
      ipAddress: '102.132.84.195', // Randomized simulation IP for realistic output
      userAgent: window.navigator.userAgent,
    };

    setSession(newSession);
    localStorage.setItem('auth_sandbox_session', JSON.stringify(newSession));
    setView('dashboard');
  };

  const handleLogout = () => {
    if (session) {
      addToast('info', 'Logged Out', 'The active user session has been safe-terminated.');
      addLog('Session Wiped', 'info', `Terminated secure session token for: @${session.username}`);
    }
    setSession(null);
    localStorage.removeItem('auth_sandbox_session');
    setView('login');
  };

  const handleRegisterSuccess = (newUser: UserAccount) => {
    setAccounts((prev) => [...prev, newUser]);
  };

  const handlePasswordReset = (username: string, newPasswordHash: string) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.username.toLowerCase() === username.toLowerCase()
          ? { ...acc, passwordHash: newPasswordHash }
          : acc
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col justify-between">
      {/* Toast notifications portal */}
      <ToastContainer toasts={toasts} onRemove={handleRemoveToast} />

      {/* Navigation Top Header */}
      <header className="border-b border-slate-150 bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100">
              <LockKeyhole className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 uppercase font-display">
                Auth Sandbox
              </h1>
              <p className="text-[10px] text-indigo-600 font-mono font-bold leading-none mt-0.5">
                SEC_NODE // ONLINE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-150 rounded-full">
              <Server className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600">
                Playground Memory DB
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container - Centered and Fluid */}
      <main className="flex-1 flex flex-col items-center justify-center py-10 px-4">
        <div className={`w-full transition-all duration-300 ${view === 'dashboard' ? 'max-w-6xl' : 'max-w-[460px]'}`}>
          {/* Card Frame holding screens with interactive motion */}
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-6 sm:p-9 relative overflow-hidden">
            {/* Soft decorative ambient glow in top-left */}
            <div className="absolute top-0 left-0 w-36 h-36 bg-gradient-to-br from-indigo-50/50 to-transparent blur-2xl pointer-events-none rounded-full" />

            <AnimatePresence mode="wait">
              {view === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                >
                  <LoginForm
                    accounts={accounts}
                    onLoginSuccess={handleLoginSuccess}
                    onNavigate={navigateTo}
                    addToast={addToast}
                    addLog={addLog}
                  />
                </motion.div>
              )}

              {view === 'register' && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                >
                  <RegisterForm
                    accounts={accounts}
                    onRegisterSuccess={handleRegisterSuccess}
                    onNavigate={navigateTo}
                    addToast={addToast}
                    addLog={addLog}
                  />
                </motion.div>
              )}

              {view === 'forgot' && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                >
                  <ResetPasswordForm
                    accounts={accounts}
                    onPasswordReset={handlePasswordReset}
                    onNavigate={navigateTo}
                    addToast={addToast}
                    addLog={addLog}
                  />
                </motion.div>
              )}

              {view === 'dashboard' && session && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  <Dashboard
                    session={session}
                    logs={logs}
                    onLogout={handleLogout}
                    addToast={addToast}
                    addLog={addLog}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Styled Informative Footer */}
      <footer className="border-t border-slate-150 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <MonitorCheck className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-600">Sleek Responsive Client Validation Suite</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-800 transition-colors cursor-help flex items-center gap-1 font-medium">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" /> System Sandbox Environment
            </span>
          </div>
          <div>
            <span className="font-medium text-slate-400">© 2026 Verification Lab Nodes</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
