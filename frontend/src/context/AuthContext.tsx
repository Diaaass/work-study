import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/types/models';
import { UserRole } from '@/types/enums';
import { authApi } from '@/api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    role: string;
    university?: string;
    major?: string;
    company?: string;
  }) => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  updateUser: (data: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('ws_token'),
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    if (state.token) {
      authApi
        .getMe()
        .then((user) =>
          setState((s) => ({ ...s, user, isAuthenticated: true, isLoading: false })),
        )
        .catch(() => {
          localStorage.removeItem('ws_token');
          setState((s) => ({ ...s, token: null, isLoading: false }));
        });
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await authApi.login(email, password);
    localStorage.setItem('ws_token', token);
    setState({ user, token, isAuthenticated: true, isLoading: false });
  }, []);

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      name: string;
      role: string;
      university?: string;
      major?: string;
      company?: string;
    }) => {
      const { token, user } = await authApi.register(data);
      localStorage.setItem('ws_token', token);
      setState({ user, token, isAuthenticated: true, isLoading: false });
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('ws_token');
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  const hasRole = useCallback(
    (role: UserRole) => state.user?.role === role,
    [state.user],
  );

  const updateUser = useCallback((data: Partial<User>) => {
    setState((s) => ({
      ...s,
      user: s.user ? { ...s.user, ...data } : null,
    }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, hasRole, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
