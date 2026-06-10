export interface UserAccount {
  username: string;
  email: string;
  passwordHash: string; // Stored in plain text for simulated purposes
  fullName: string;
  createdAt: string;
  securityQuestion: string;
  securityAnswer: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  action: string;
  status: 'success' | 'failure' | 'warning' | 'info';
  details: string;
  ip: string;
}

export interface ActiveSession {
  username: string;
  fullName: string;
  email: string;
  token: string;
  loginTime: string;
  ipAddress: string;
  userAgent: string;
}

export type AuthView = 'login' | 'register' | 'forgot' | 'dashboard';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}
