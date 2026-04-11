import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'platform_admin' | 'enterprise' | 'employee'
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('userRole');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
    }
    setLoading(false);
  }, []);

  const login = (userData, userToken, userRole) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userRole', userRole);
    setToken(userToken);
    setUser(userData);
    setRole(userRole);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);