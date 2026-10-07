import { Employee } from '../types';

// Demo-grade password hashing. Production implementation must use bcrypt/Argon2 on the backend.


export const generateSalt = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const hashPassword = async (password: string, salt: string): Promise<string> => {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const verifyPassword = async (account: Employee, inputPassword: string): Promise<boolean> => {
  // If account has salted hash stored
  if (account.passwordHash && account.passwordSalt) {
    const computed = await hashPassword(inputPassword, account.passwordSalt);
    return computed === account.passwordHash;
  }

  // Fallback to seeded demo plain password for Emp001 / Admin01
  if (account.password) {
    return account.password === inputPassword;
  }

  return false;
};

export interface StoredAccountCredential {
  passwordHash: string;
  passwordSalt: string;
  activated: boolean;
  loginId?: string;
}

const STORAGE_KEY = 'flowsphere-activated-accounts';

export const loadActivatedAccounts = (): Record<string, StoredAccountCredential> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to parse activated accounts from localStorage', e);
    return {};
  }
};

export const saveActivatedAccount = (
  employeeId: string,
  credential: StoredAccountCredential
): void => {
  try {
    const current = loadActivatedAccounts();
    current[employeeId.toLowerCase()] = credential;
    if (credential.loginId) {
      current[credential.loginId.toLowerCase()] = credential;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to persist activated account to localStorage', e);
  }
};
