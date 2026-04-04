import axios from 'axios';

// API base URL - change this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('token_expiry');
  localStorage.removeItem('refresh_token');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('refresh_token');
};

const getStoredToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');
const getStoredRefreshToken = () => localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');

const persistAuthByCurrentScope = ({ token, refreshToken, user }) => {
  const useLocalStorage = Boolean(localStorage.getItem('token') || localStorage.getItem('refresh_token'));
  const target = useLocalStorage ? localStorage : sessionStorage;
  const other = useLocalStorage ? sessionStorage : localStorage;

  target.setItem('token', token);
  target.setItem('refresh_token', refreshToken);
  if (user) {
    target.setItem('user', JSON.stringify(user));
  }

  other.removeItem('token');
  other.removeItem('refresh_token');
  other.removeItem('user');
};

const shouldSkipRefresh = (url = '') => {
  return url.includes('/users/login') || url.includes('/users/register') || url.includes('/users/refresh');
};

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Support token persisted in either localStorage (remember) or sessionStorage (no-remember)
    const token = getStoredToken();
    if (token) {
      // eslint-disable-next-line no-console
      console.debug('apiClient: attaching token from', localStorage.getItem('token') ? 'localStorage' : 'sessionStorage', 'tokenLen=', token?.length);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // eslint-disable-next-line no-console
      console.debug('apiClient: no token found in storage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config || {};

    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.statusText;

      if (
        error.response.status === 401 &&
        !originalRequest._retry &&
        !shouldSkipRefresh(originalRequest.url)
      ) {
        const refreshToken = getStoredRefreshToken();

        if (!refreshToken) {
          clearAuthStorage();
        } else {
          try {
            originalRequest._retry = true;

            const refreshResponse = await refreshClient.post('/users/refresh', { refreshToken });
            const refreshedSession = refreshResponse.data?.data;

            if (!refreshedSession?.token || !refreshedSession?.refreshToken) {
              throw new Error('Invalid refresh response');
            }

            persistAuthByCurrentScope({
              token: refreshedSession.token,
              refreshToken: refreshedSession.refreshToken,
              user: refreshedSession.user,
            });

            originalRequest.headers = {
              ...(originalRequest.headers || {}),
              Authorization: `Bearer ${refreshedSession.token}`,
            };

            return apiClient(originalRequest);
          } catch (refreshError) {
            clearAuthStorage();
            return Promise.reject({
              status: 401,
              message: refreshError?.response?.data?.message || 'Session expired. Please login again.',
              data: refreshError?.response?.data,
            });
          }
        }
      }
      
      return Promise.reject({
        status: error.response.status,
        message: message,
        data: error.response.data,
      });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
      });
    } else {
      // Something else happened
      return Promise.reject({
        status: 0,
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
);

export default apiClient;
