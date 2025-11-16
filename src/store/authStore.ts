import { create } from 'zustand';

interface AuthStore {
  isAuthenticated: boolean;
  accessToken: string | null;
  userEmail: string | null;
  setAuth: (token: string, email: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  accessToken: null,
  userEmail: null,
  setAuth: (token, email) => {
    set({
      isAuthenticated: true,
      accessToken: token,
      userEmail: email,
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('google_access_token', token);
      localStorage.setItem('google_user_email', email);
    }
  },
  clearAuth: () => {
    set({
      isAuthenticated: false,
      accessToken: null,
      userEmail: null,
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('google_user_email');
    }
  },
}));

// Load auth state on init
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('google_access_token');
  const email = localStorage.getItem('google_user_email');
  if (token && email) {
    useAuthStore.getState().setAuth(token, email);
  }
}

