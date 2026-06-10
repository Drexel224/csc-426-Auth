import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Lock, ShieldCheck, AlertCircle, RefreshCw, Check, X, ShieldAlert } from 'lucide-react';
import { UserAccount, AuthView } from '../types';

interface RegisterFormProps {
  accounts: UserAccount[];
  onRegisterSuccess: (newUser: UserAccount) => void;
  onNavigate: (view: AuthView) => void;
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
  addLog: (action: string, status: 'success' | 'failure' | 'warning' | 'info', details: string) => void;
}

export default function RegisterForm({
  accounts,
  onRegisterSuccess,
  onNavigate,
  addToast,
  addLog,
}: RegisterFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('favorite-color');
  const [securityAnswer, setSecurityAnswer] = useState('');

  // Password requirements
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[@$!%*?&._-]/.test(password);
  const isPasswordStrong = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  // Validation States
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    securityAnswer?: string;
  }>({});

  const validateField = (name: string, value: string) => {
    const currentErrors = { ...errors };

    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          currentErrors.fullName = 'Full Name is required';
        } else {
          delete currentErrors.fullName;
        }
        break;
      case 'email':
        if (!value.trim()) {
          currentErrors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          currentErrors.email = 'Please provide a valid email format';
        } else {
          delete currentErrors.email;
        }
        break;
      case 'username':
        if (!value.trim()) {
          currentErrors.username = 'Security handle (username) is required';
        } else if (value.trim().length < 4) {
          currentErrors.username = 'Username must be at least 4 characters';
        } else if (!/^[A-Za-z0-9_-]+$/.test(value)) {
          currentErrors.username = 'Only alphanumeric, underscores, or hyphens allowed';
        } else {
          delete currentErrors.username;
        }
        break;
      case 'confirmPassword':
        if (value !== password) {
          currentErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete currentErrors.confirmPassword;
        }
        break;
      case 'securityAnswer':
        if (!value.trim()) {
          currentErrors.securityAnswer = 'Security answers are key for password recovery';
        } else {
          delete currentErrors.securityAnswer;
        }
        break;
      default:
        break;
    }

    setErrors(currentErrors);
  };

  const handleInputChange = (field: string, setter: (val: string) => void) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setter(value);
    validateField(field, value);
  };

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFullName('');
    setEmail('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setSecurityQuestion('favorite-color');
    setSecurityAnswer('');
    setErrors({});
    addToast('info', 'Registration Cleared', 'All sign up parameters have been reset.');
    addLog('Registration Reset', 'info', 'User cleared register form inputs');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Comprehensive Check
    const newErrors: typeof errors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!username.trim() || username.trim().length < 4) {
      newErrors.username = 'Username must be at least 4 characters';
    }
    if (!isPasswordStrong) {
      newErrors.password = 'Ensure password meets all security rules below';
    }
    if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!securityAnswer.trim()) {
      newErrors.securityAnswer = 'An answer is required to enable recovery protocols';
    }

    // Check duplicate account
    const usernameExists = accounts.some(acc => acc.username.toLowerCase() === username.trim().toLowerCase());
    const emailExists = accounts.some(acc => acc.email.toLowerCase() === email.trim().toLowerCase());

    if (usernameExists) {
      newErrors.username = 'Username is already registered';
    }
    if (emailExists) {
      newErrors.email = 'Email address is already registered';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast('error', 'Registration Blocked', 'Please fix all missing security requirements.');
      addLog('Registration Attempt', 'warning', 'Submitted registration failed valid state rules');
      return;
    }

    // Create account
    const newUser: UserAccount = {
      fullName: fullName.trim(),
      email: email.trim(),
      username: username.trim(),
      passwordHash: password, // Plain text password stored for mock sandbox credentials
      createdAt: new Date().toISOString(),
      securityQuestion,
      securityAnswer: securityAnswer.trim().toLowerCase(),
    };

    onRegisterSuccess(newUser);
    addToast('success', 'Sandbox Account Created!', `User "${username}" registered. You can now login.`);
    addLog('Registration Attempt', 'success', `New credentials database created for "${username}"`);
    onNavigate('login');
  };

  return (
    <div id="register-section" className="w-full">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center mb-6 shadow-indigo-100 shadow-lg animate-pulse">
          <ShieldAlert className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
          Request System Access
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Register credentials to log in interactively
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 block">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="reg-fullname"
              type="text"
              required
              value={fullName}
              onChange={handleInputChange('fullName', setFullName)}
              placeholder="e.g. Satoshi Nakamoto"
              className={`block w-full h-11 pl-11 pr-4 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${
                errors.fullName
                  ? 'border-2 border-rose-100 bg-rose-50 focus:outline-none focus:ring-0'
                  : 'border-slate-200 bg-slate-50'
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-xs text-rose-550 font-medium ml-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Dual Column: Username & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 block">
              Secure Handle
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className="text-sm font-semibold text-slate-405">@</span>
              </div>
              <input
                id="reg-username"
                type="text"
                required
                value={username}
                onChange={handleInputChange('username', setUsername)}
                placeholder="username"
                className={`block w-full h-11 pl-11 pr-4 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${
                  errors.username
                    ? 'border-2 border-rose-100 bg-rose-50 focus:outline-none focus:ring-0'
                    : 'border-slate-200 bg-slate-50'
                }`}
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-xs text-rose-555 font-medium ml-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.username}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 block">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={handleInputChange('email', setEmail)}
                placeholder="satoshi@bitcoin.org"
                className={`block w-full h-11 pl-11 pr-4 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${
                  errors.email
                    ? 'border-2 border-rose-100 bg-rose-50 focus:outline-none focus:ring-0'
                    : 'border-slate-200 bg-slate-50'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-555 font-medium ml-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Security Question & Answer (For Simulated Recovery) */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 shadow-xs">
          <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Required Password Recovery Shield
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase">
                Choose Security Question
              </label>
              <select
                id="reg-security-question"
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
                className="block w-full h-10 px-3 mt-1 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="favorite-color">What is your favorite color?</option>
                <option value="pet-name">What was the name of your first pet?</option>
                <option value="birth-city">In what city were you born?</option>
                <option value="mother-maiden">What is your mother's maiden name?</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase">
                Security Answer Hint
              </label>
              <input
                id="reg-security-answer"
                type="text"
                required
                value={securityAnswer}
                onChange={handleInputChange('securityAnswer', setSecurityAnswer)}
                placeholder="e.g. Golden Retriever"
                className={`block w-full h-10 px-3 mt-1 rounded-lg border text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 ${
                  errors.securityAnswer
                    ? 'border-2 border-rose-100 bg-rose-50'
                    : 'border-slate-200 bg-white'
                }`}
              />
              {errors.securityAnswer && (
                <p className="mt-1 text-[10px] text-rose-500 font-medium">
                  {errors.securityAnswer}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Dual Password Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 block">
              Secret Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="reg-password"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (confirmPassword) validateField('confirmPassword', confirmPassword);
                }}
                placeholder="Enter password"
                className="block w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 block">
              Verify Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="reg-confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={handleInputChange('confirmPassword', setConfirmPassword)}
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
        </div>

        {/* Real-time checklist layout */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-xs space-y-2">
          <span className="block font-bold text-slate-500 uppercase tracking-wider text-[10px]">
            Real-Time Integrity Metrics
          </span>
          <div className="grid grid-cols-2 gap-2 text-slate-600">
            <div className="flex items-center gap-1.5">
              {hasMinLength ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <X className="w-4 h-4 text-slate-400" />
              )}
              <span className={hasMinLength ? 'text-emerald-700 font-semibold' : ''}>
                Min 8 Characters
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {hasUpper ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <X className="w-4 h-4 text-slate-400" />
              )}
              <span className={hasUpper ? 'text-emerald-700 font-semibold' : ''}>
                Uppercase Letter [A-Z]
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {hasLower ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <X className="w-4 h-4 text-slate-400" />
              )}
              <span className={hasLower ? 'text-emerald-700 font-semibold' : ''}>
                Lowercase Letter [a-z]
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {hasNumber ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <X className="w-4 h-4 text-slate-400" />
              )}
              <span className={hasNumber ? 'text-emerald-700 font-semibold' : ''}>
                Digit Value [0-9]
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {hasSpecial ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <X className="w-4 h-4 text-slate-400" />
              )}
              <span className={hasSpecial ? 'text-emerald-700 font-semibold' : ''}>
                Special Symbol
              </span>
            </div>
          </div>
        </div>

        {/* Buttons Action Group */}
        <div className="flex gap-3 pt-2">
          {/* Submit Button */}
          <button
            id="btn-submit-register"
            type="submit"
            className="flex-1 bg-indigo-600 text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            Request Account
          </button>

          {/* Reset / Cancel Button */}
          <button
            id="btn-reset-register"
            type="button"
            onClick={handleReset}
            className="px-6 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            Reset
          </button>
        </div>
      </form>

      {/* Alternative flow: Go back */}
      <div className="mt-5 text-center border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500 font-medium">
          Already have a credential set?{' '}
          <button
            id="btn-switch-login"
            onClick={() => onNavigate('login')}
            className="text-indigo-600 font-bold hover:underline focus:outline-none cursor-pointer"
          >
            Return to Log In
          </button>
        </p>
      </div>
    </div>
  );
}
