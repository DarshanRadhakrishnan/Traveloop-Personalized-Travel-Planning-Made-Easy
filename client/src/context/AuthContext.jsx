import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('traveloop_token');
    const savedUser = localStorage.getItem('traveloop_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Verify token is still valid
      api.get('/auth/me').then(res => {
        const u = { id: res.data.id, name: res.data.name, email: res.data.email, role: res.data.role, profilePhoto: res.data.profilePhoto };
        setUser(u);
        localStorage.setItem('traveloop_user', JSON.stringify(u));
      }).catch(() => {
        localStorage.removeItem('traveloop_token');
        localStorage.removeItem('traveloop_user');
        setUser(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('traveloop_token', res.data.token);
    localStorage.setItem('traveloop_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('traveloop_token', res.data.token);
    localStorage.setItem('traveloop_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('traveloop_token');
    localStorage.removeItem('traveloop_user');
    setUser(null);
  };

  const updateUser = (data) => {
    setUser(prev => ({ ...prev, ...data }));
    localStorage.setItem('traveloop_user', JSON.stringify({ ...user, ...data }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
