import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/apiService';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage or sessionStorage and verify token
    const loadUser = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      const tokenExpiry = localStorage.getItem('token_expiry');
      // Optimistic restore: if we have a saved user, set it immediately so UI doesn't flash logged out
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.warn('Failed parsing saved user:', e);
        }
      }

      // If there's an expiry for remembered tokens and it's already passed, clear storage and stop
      if (tokenExpiry && Number(tokenExpiry) > 0 && Date.now() > Number(tokenExpiry)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('token_expiry');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setUser(null);
        setLoading(false);
        return;
      }

      if (token) {
        try {
          // Verify token is still valid by fetching profile
          // Log token presence to help debug reload/auth issues
          // eslint-disable-next-line no-console
          console.debug('AuthContext: validating token on load');
          const response = await authAPI.getProfile();
          if (response && response.success) {
            setUser(response.data);
            // keep latest user in the same storage as token
            if (localStorage.getItem('token')) {
              localStorage.setItem('user', JSON.stringify(response.data));
            } else {
              sessionStorage.setItem('user', JSON.stringify(response.data));
            }

            // If an expiry exists, schedule automatic cleanup when it elapses
            const expiry = localStorage.getItem('token_expiry');
            if (expiry) {
              const msLeft = Number(expiry) - Date.now();
              if (msLeft > 0) {
                setTimeout(() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  localStorage.removeItem('token_expiry');
                  setUser(null);
                }, msLeft);
              }
            }
          }
        } catch (error) {
          // Token invalid, clear both storages
          // eslint-disable-next-line no-console
          console.warn('Token validation failed on load:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password, remember = false) => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.success) {
        const { user, token } = response.data;

        // Debug: log token and storage choice
        // eslint-disable-next-line no-console
        console.debug('AuthContext.login: received token length=', token?.length, 'remember=', remember);

        // Save token/user to chosen storage
        if (remember) {
          const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
          const expiry = Date.now() + threeDaysMs;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('token_expiry', String(expiry));
          // schedule automatic cleanup when expiry elapses
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('token_expiry');
            setUser(null);
          }, threeDaysMs);
          // eslint-disable-next-line no-console
          console.debug('AuthContext.login: token stored in localStorage with 3-day expiry');
        } else {
          sessionStorage.setItem('token', token);
          sessionStorage.setItem('user', JSON.stringify(user));
          // eslint-disable-next-line no-console
          console.debug('AuthContext.login: token stored in sessionStorage');
        }

        setUser(user);
        return { success: true, user };
      }
      
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.message || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const register = async (userData, remember = false) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const { user, token } = response.data;

        // Debug: log token and storage choice
        // eslint-disable-next-line no-console
        console.debug('AuthContext.register: received token length=', token?.length, 'remember=', remember);

        // Save to chosen storage (default: remember)
        if (remember) {
          const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
          const expiry = Date.now() + threeDaysMs;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('token_expiry', String(expiry));
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('token_expiry');
            setUser(null);
          }, threeDaysMs);
          // eslint-disable-next-line no-console
          console.debug('AuthContext.register: token stored in localStorage with 3-day expiry');
        } else {
          sessionStorage.setItem('token', token);
          sessionStorage.setItem('user', JSON.stringify(user));
          // eslint-disable-next-line no-console
          console.debug('AuthContext.register: token stored in sessionStorage');
        }

        setUser(user);
        return { success: true, user };
      }
      
      return { success: false, message: response.message || 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    // Clear both storages to fully log out
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_expiry');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  };

  const updateProfile = async (updates) => {
    if (user) {
      const response = await authAPI.updateProfile(updates);

      if (response.success) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        return { success: true, user: response.data };
      }

      return { success: false, message: response.message || 'Profile update failed' };
    }

    return { success: false, message: 'No authenticated user' };
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
