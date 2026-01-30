import axios from 'axios';
import useAuth from '@/stores/auth';
import useTheme from '@/stores/theme';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { sanitizeData, sanitizeUrl } from '@/utils/sanitizeData';

const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  instance.interceptors.request.use(
    async (config) => {
      useTheme.getState().setLoading(true);
      const token = await useAuth.getState().getToken();
      // await useAuth.getState().getWsToken();

      // Sanitize URL if present (both path and query parameters)
      if (config.url) {
        config.url = sanitizeUrl(config.url);
      }

      // Sanitize request params if present
      if (config.params) {
        config.params = sanitizeData(config.params);
      }

      // Sanitize request data if present
      if (config.data && config.headers['Content-Type'] === 'application/json') {
        config.data = sanitizeData(config.data);
      }

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      console.error('Request error:', error);
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response) => {
      useTheme.getState().setLoading(false);
      return response;
    },
    (error) => {
      useTheme.getState().setLoading(false);
      handleAxiosError(error);
      return Promise.reject(error);
    },
  );
  return instance;
};

const api = createAxiosInstance();

export default api;
