import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, RefreshCw, KeyRound } from 'lucide-react';
import { UserAccount, AuthView } from '../types';

interface LoginFormProps {
  accounts: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
  onNavigate: (view: AuthView) => void;
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
  addLog: (action: string, status: 'success' | 'failure' | 'warning' | 'info', details: string) => void;
}

export default function LoginForm({
  accounts,
  onLoginSuccess,
  onNavigate,
  addToast,
  addLog,
}: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Validation States
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time validations
  const validateField = (field: 'username' | 'password', value: string) => {
    const currentErrors = { ...errors };

    if (field === 'username') {
      if (!value) {
        currentErrors.username = 'Username or Email is required';
      } else if (value.length < 3) {
        currentErrors.username = 'Username or Email must be at least 3 characters';
      } else {
        delete currentErrors.username;
      }
    }

    if (field === 'password') {
      if (!value) {
        currentErrors.password = 'Password is required';
      } else if (value.length < 6) {
        currentErrors.password = 'Password must be at least 6 characters';
      } else {
        delete currentErrors.password;
      }
    }

    setErrors(currentErrors);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    validateField('username', value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validateField('password', value);
  };

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setUsername('');
    setPassword('');
    setErrors({});
    addToast('info', 'Form Reset', 'The login fields have been cleared.');
    addLog('Form Reset', 'info', 'User cleared login input fields');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Initial check
    const newErrors: { username?: string; password?: string } = {};
    if (!username) newErrors.username = 'Username or Email is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      addToast('error', 'Authentication Failed', 'Please fix form validation errors.');
      addLog('Login Attempt', 'failure', 'Failed local field validation checks');
      return;
    }

    // Attempt simulated database matching
    setTimeout(() => {
      const match = accounts.find(
        (acc) =>
          acc.username.toLowerCase() === username.trim().toLowerCase() ||
          acc.email.toLowerCase() === username.trim().toLowerCase()
      );

      if (!match) {
        setErrors({ username: 'Account does not exist' });
        addToast('error', 'Account Not Found', `No user matches standard username "${username}"`);
        addLog('Login Attempt', 'failure', `No account matches identifier: ${username}`);
        setIsSubmitting(false);
        return;
      }

      if (match.passwordHash !== password) {
        setErrors({ password: 'Incorrect secret password' });
        addToast('error', 'Incorrect Password', 'The credentials supplied do not match security hashes.');
        addLog('Login Attempt', 'failure', `Failed login for "${match.username}": Invalid password`);
        setIsSubmitting(false);
        return;
      }

      // Success
      addToast('success', 'Logged In Successfully', `Welcome back, ${match.fullName || match.username}!`);
      addLog('Login Attempt', 'success', `Successfully authenticated credentials for user: ${match.username}`);
      setIsSubmitting(false);
      onLoginSuccess(match);
    }, 800);
  };

  // Pre-fill a demo account for beautiful developer playground experience
  const autofillDemoAccount = (usernameVal: string, passwordVal: string) => {
    setUsername(usernameVal);
    setPassword(passwordVal);
    setErrors({});
    addToast('info', 'Demo Autofill', `Loaded default account credentials: ${usernameVal}`);
    addLog('Demo Autofill', 'info', `Loaded credentials for "${usernameVal}"`);
  };

  return (
    <div id="login-section" className="w-full">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center mb-6 shadow-indigo-100 shadow-lg">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
          System Access
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Secure login for authorized personnel only.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 block">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="input-username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Enter username"
              className={`block w-full h-11 pl-11 pr-4 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${
                errors.username
                  ? 'border-2 border-rose-100 bg-rose-50 focus:outline-none focus:ring-0'
                  : 'border-slate-200 bg-slate-50'
              }`}
            />
          </div>
          {errors.username && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs text-rose-500 font-medium ml-1 flex items-center gap-1"
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-550" />
              {errors.username}
            </motion.p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
              Password
            </label>
            <button
              id="btn-forgot-password"
              type="button"
              onClick={() => onNavigate('forgot')}
              className="text-xs text-indigo-600 font-semibold hover:text-indigo-700"
            >
              Forgot?
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="input-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter password"
              className={`block w-full h-11 pl-11 pr-11 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${
                errors.password
                  ? 'border-2 border-rose-100 bg-rose-50 focus:outline-none focus:ring-0'
                  : 'border-slate-200 bg-slate-50'
              }`}
            />
            <button
              id="btn-toggle-password"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs text-rose-500 font-medium ml-1 flex items-center gap-1"
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-550" />
              {errors.password}
            </motion.p>
          )}
        </div>

        {/* Remember me & Options */}
        <div className="flex items-center gap-2 mb-2">
          <input
            id="input-remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="input-remember-me" className="text-xs text-slate-600 cursor-pointer select-none">
            Keep me logged in for 30 days
          </label>
        </div>

        {/* Actions layout - Sleek design theme */}
        <div className="flex gap-3 pt-2">
          {/* Submit / Login Button */}
          <button
            id="btn-submit-login"
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-indigo-600 text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-lg shadow-indigo-150 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:bg-indigo-405 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Login...</span>
              </>
            ) : (
              <span>Login to System</span>
            )}
          </button>

          {/* Reset / Cancel Button */}
          <button
            id="btn-reset-login"
            type="button"
            onClick={handleReset}
            className="px-6 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            Reset
          </button>
        </div>
      </form>

      {/* Alternative flow: Sign Up */}
      <div className="mt-6 text-center border-t border-slate-100 pt-5">
        <p className="text-xs text-slate-500 font-medium">
          New to the platform?{' '}
          <button
            id="btn-switch-register"
            onClick={() => onNavigate('register')}
            className="text-indigo-600 font-bold hover:underline focus:outline-none cursor-pointer"
          >
            Request Access
          </button>
        </p>
      </div>

      {/* Interactive Quick-Test accounts bar */}
      <div className="mt-8 bg-slate-50 border border-slate-200/50 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-1.5 mb-2.5">
          <KeyRound className="w-4 h-4 text-indigo-650" />
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Developer Playground Node Credentials
          </h4>
        </div>
        <div className="flex flex-col gap-2">
          {accounts.map((acc, idx) => (
            <div
              key={idx}
              className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white border border-slate-150 rounded-xl text-xs shadow-xs"
            >
              <div className="font-mono text-slate-600 text-[11px]">
                <span className="font-semibold text-slate-900">{acc.username}</span> | password:{' '}
                <span className="font-semibold text-slate-900">{acc.passwordHash}</span>
              </div>
              <button
                id={`btn-autofill-${acc.username}`}
                type="button"
                onClick={() => autofillDemoAccount(acc.username, acc.passwordHash)}
                className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[10px] font-bold hover:bg-indigo-100 transition-colors"
              >
                Autofill Credentials
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
