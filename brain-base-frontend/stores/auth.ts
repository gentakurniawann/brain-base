import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { getMe, integrateWallet } from '@/services/auth';
import { getCookies, setCookies, deleteCookie } from '@/utils/cookie';
import { IAuthStore, IAuthPersistStore, TResponseMe } from '@/types/auth';

const useAuth = create<IAuthStore>((set, get) => ({
  // state
  token: '',
  wsToken: '',
  user: null,

  // actions
  getToken: async () => {
    if (get().token) {
      return get().token;
    }

    try {
      const tokenCookie = await getCookies('token');
      if (tokenCookie?.value) {
        setCookies('token', tokenCookie.value);
        set({ token: tokenCookie.value });
        return tokenCookie.value;
      }
    } catch (error) {
      console.error('Error store getToken:', error);
      throw error;
    }

    return null;
  },
  setToken: async (data) => {
    try {
      if (data) {
        setCookies('token', data);
      }
    } catch (error) {
      console.error('Error store setToken:', error);
      throw error;
    }
  },
  getUserCredential: async () => {
    try {
      const userCookie = await getCookies('user');
      if (userCookie?.value) {
        set({ user: JSON.parse(userCookie.value) });
      }
    } catch (error) {
      console.error('Error store getUserCredential:', error);
      throw error;
    }
    return null;
  },

  setUserCredential: async (data) => {
    try {
      if (data) {
        const userData = JSON.stringify(data);
        setCookies('user', userData);
      }
    } catch (error) {
      console.error('Error storing user credential:', error);
      throw error;
    }
  },
  logout: async () => {
    try {
      await deleteCookie('token');
      await deleteCookie('user');
      // Clear zustand state
      set({ token: '', user: null });
    } catch (error) {
      console.error('Error store logout:', error);
      throw error;
    }
  },

  integrateWallet: async (address: string) => {
    try {
      const response = await integrateWallet(address);
      return response;
    } catch (error) {
      console.error('Error store integrateWallet:', error);
      throw error;
    }
  },
}));

export const useAuthPersist = create<IAuthPersistStore>()(
  persist(
    (setState) => ({
      // state
      me: {} as TResponseMe,
      permission: [],
      menu: [],

      // actions
      checkMe: async () => {
        try {
          const me = await getMe();
          const { setUserCredential } = useAuth.getState();
          setUserCredential(me);
          setState((state) => ({
            ...state,
            me: me || {},
          }));
          return me;
        } catch (error) {
          console.error('Error store checkMe:', error);
          throw error;
        }
      },
    }),
    {
      name: 'auth',
    },
  ),
);

export default useAuth;
