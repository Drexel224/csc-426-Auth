import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, AlertCircle, RefreshCw, ArrowLeft, KeyRound, Check, ShieldQuestion } from 'lucide-react';
import { UserAccount, AuthView } from '../types';

interface ResetPasswordFormProps {
  accounts: UserAccount[];
  onPasswordReset: (username: string, newPasswordHash: string) => void;
  onNavigate: (view: AuthView) => void;
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
  addLog: (action: string, status: 'success' | 'failure' | 'warning' | 'info', details: string) => void;
}

export default function ResetPasswordForm({
  accounts,
  onPasswordReset,
  onNavigate,
  addToast,
  addLog,
}: ResetPasswordFormProps) {
  const [username, setUsername] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Flow State
  // 'lookup' -> find user
  // 'question' -> answer security question
  // 'reset' -> set new password
  const [step, setStep] = useState<'lookup' | 'question' | 'reset'>('lookup');
  const [matchedUser, setMatchedUser] = useState<UserAccount | null>(null);
  const [errors, setErrors] = useState<{
    username?: string;
    securityAnswer?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Real-time metrics
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[@$!%*?&._-]/.test(newPassword);
  const isPasswordStrong = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  // Lookup user
  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrors({ username: 'Enter username or email address' });
      return;
    }

    const found = accounts.find(
      (acc) =>
        acc.username.toLowerCase() === username.trim().toLowerCase() ||
        acc.email.toLowerCase() === username.trim().toLowerCase()
    );

    if (!found) {
      setErrors({ username: 'No Sandbox user registered under that handle' });
      addToast('error', 'User Not Found', `We could not trigger recovery for "${username}"`);
      addLog('Recovery Lookup', 'failure', `No account matches lookup identifier: ${username}`);
      return;
    }

    setMatchedUser(found);
    setErrors({});
    setStep('question');
    addToast('info', 'Identity Verified', 'Next, please solve the security node question.');
    addLog('Recovery Lookup', 'success', `Located security profile for user: ${found.username}`);
  };

  // Verify answer
  const handleVerifyAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedUser) return;

    if (!securityAnswer.trim()) {
      setErrors({ securityAnswer: 'Answer cannot be empty' });
      return;
    }

    if (securityAnswer.trim().toLowerCase() !== matchedUser.securityAnswer.toLowerCase()) {
      setErrors({ securityAnswer: 'Incorrect answer. Try again.' });
      addToast('error', 'Authentication Blocked', 'Security answer does not match the recovery profile.');
      addLog('Recovery Verification', 'failure', `Failed security question check for "${matchedUser.username}"`);
      return;
    }

    setErrors({});
    setStep('reset');
    addToast('success', 'Security Core Unlocked', 'You can now assign a new password hash.');
    addLog('Recovery Verification', 'success', `Passed security question challenge for: ${matchedUser.username}`);
  };

  // Submit new password
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedUser) return;

    const currentErrors: typeof errors = {};
    if (!isPasswordStrong) {
      currentErrors.newPassword = 'Password does not meet high level integrity criteria';
    }
    if (confirmPassword !== newPassword) {
      currentErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      addToast('error', 'Integrity Refused', 'Please check rule requirements below.');
      return;
    }

    onPasswordReset(matchedUser.username, newPassword);
    addToast('success', 'Password Altered', 'New safety credentials written successfully.');
    addLog('Account Restoration', 'success', `Changed security credentials on demand for: ${matchedUser.username}`);
    onNavigate('login');
  };

  const handleResetForm = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setUsername('');
    setSecurityAnswer('');
    setNewPassword('');
    setConfirmPassword('');
    setStep('lookup');
    setMatchedUser(null);
    setErrors({});
    addToast('info', 'Recovery Reset', 'The recovery inputs have been reset.');
  };

  const getQuestionLabel = (key: string) => {
    switch (key) {
      case 'favorite-color':
        return 'What is your favorite color?';
      case 'pet-name':
        return 'What was the name of your first pet?';
      case 'birth-city':
        return 'In what city were you born?';
      case 'mother-maiden':
        return "What is your mother's maiden name?";
      default:
        return 'Enter answer:';
    }
  };

  return (
    <div id="forgot-password-section" className="w-full">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center mb-6 shadow-indigo-100 shadow-lg animate-bounce">
          <KeyRound className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
          Restore Access
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Simulated self-service credential override workflow
        </p>
      </div>

      {step === 'lookup' && (
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 text-xs text-slate-600 mb-2 leading-relaxed shadow-xs">
            Verify either your standard <b>Username</b> (e.g. <code className="bg-slate-200/60 px-1 rounded text-[11px] font-mono">admin</code>) or registered <b>Email</b> (e.g. <code className="bg-slate-200/60 px-1 rounded text-[11px] font-mono">admin@sandbox.com</code>) to unlock recovery questions.
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 block">
              Username or Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="lookup-username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) setErrors({});
                }}
                placeholder="Enter handle or email"
                className={`block w-full h-11 pl-11 pr-4 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${
                  errors.username
                    ? 'border-2 border-rose-100 bg-rose-50 focus:outline-none focus:ring-0'
                    : 'border-slate-200 bg-slate-50'
                }`}
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-xs text-rose-500 font-medium ml-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.username}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              id="btn-back-to-login"
              type="button"
              onClick={() => onNavigate('login')}
              className="flex-1 h-11 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </button>
            <button
              id="btn-lookup-user"
              type="submit"
              className="flex-1 h-11 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Check Identity
            </button>
          </div>
        </form>
      )}

      {step === 'question' && matchedUser && (
        <form onSubmit={handleVerifyAnswer} className="space-y-4">
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2">
            <div className="flex items-center gap-1.5 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <ShieldQuestion className="w-4 h-4 text-indigo-650" />
              Security Challenge
            </div>
            <p className="text-sm font-semibold text-slate-900 leading-normal">
              {getQuestionLabel(matchedUser.securityQuestion)}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 block">
              Your Secret Security Answer
            </label>
            <input
              id="recovery-security-answer"
              type="text"
              autoFocus
              value={securityAnswer}
              onChange={(e) => {
                setSecurityAnswer(e.target.value);
                if (errors.securityAnswer) setErrors({});
              }}
              placeholder="Case insensitive response"
              className={`block w-full h-11 px-4 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${
                errors.securityAnswer
                  ? 'border-2 border-rose-100 bg-rose-50 focus:outline-none focus:ring-0'
                  : 'border-slate-200 bg-slate-50'
              }`}
            />
            {errors.securityAnswer && (
              <p className="mt-1 text-xs text-rose-500 font-medium ml-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.securityAnswer}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              id="btn-recovery-back"
              type="button"
              onClick={handleResetForm}
              className="flex-1 h-11 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              Reset Flow
            </button>
            <button
              id="btn-verify-answer"
              type="submit"
              className="flex-1 h-11 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Verify Response
            </button>
          </div>
        </form>
      )}

      {step === 'reset' && matchedUser && (
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 text-xs text-slate-655 mb-1 shadow-xs">
            Re-coding credentials for account:{' '}
            <span className="font-bold text-slate-900 font-mono">@{matchedUser.username}</span>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 block">
              New Password Hash
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="recovery-new-password"
                type="password"
                autoFocus
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors({});
                }}
                placeholder="New secure password"
                className={`block w-full h-11 pl-11 pr-4 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${
                  errors.newPassword
                    ? 'border-2 border-rose-100 bg-rose-50 focus:outline-none focus:ring-0'
                    : 'border-slate-200 bg-slate-50'
                }`}
              />
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-xs text-rose-500 font-medium ml-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 block">
              Verify Password Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="recovery-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({});
                }}
                placeholder="Verify password"
                className={`block w-full h-11 pl-11 pr-4 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${
                  errors.confirmPassword
                    ? 'border-2 border-rose-100 bg-rose-50 focus:outline-none focus:ring-0'
                    : 'border-slate-200 bg-slate-50'
                }`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-500 font-medium ml-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Real-time checklist layout */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-xs space-y-2">
            <span className="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
              Real-Time Integrity Metrics
            </span>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div className="flex items-center gap-1.5">
                {hasMinLength ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <span className="w-4 h-4 border rounded-full border-slate-300" />
                )}
                <span className={hasMinLength ? 'text-emerald-700 font-semibold' : ''}>Min 8 chars</span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasUpper ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <span className="w-4 h-4 border rounded-full border-slate-300" />
                )}
                <span className={hasUpper ? 'text-emerald-700 font-semibold' : ''}>Uppercase [A-Z]</span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasLower ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <span className="w-4 h-4 border rounded-full border-slate-300" />
                )}
                <span className={hasLower ? 'text-emerald-700 font-semibold' : ''}>Lowercase [a-z]</span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasNumber ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <span className="w-4 h-4 border rounded-full border-slate-300" />
                )}
                <span className={hasNumber ? 'text-emerald-700 font-semibold' : ''}>Digit [0-9]</span>
              </div>
              <div className="flex items-center gap-1.5 flex-1 col-span-2">
                {hasSpecial ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <span className="w-4 h-4 border rounded-full border-slate-300" />
                )}
                <span className={hasSpecial ? 'text-emerald-700 font-semibold' : ''}>Symbol e.g. @$!%*?&</span>
              </div>
            </div>
          </div>

          <button
            id="btn-override-password"
            type="submit"
            className="w-full h-11 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Rewrite Safety Password
          </button>
        </form>
      )}
    </div>
  );
}
