'use client';

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';

interface MiniAppContextType {
  isReady: boolean;
  isInMiniApp: boolean;
  user: unknown | null;
}

const MiniAppContext = createContext<MiniAppContextType>({
  isReady: false,
  isInMiniApp: false,
  user: null,
});

export function useMiniApp() {
  return useContext(MiniAppContext);
}

interface MiniAppProviderProps {
  children: ReactNode;
}

export function MiniAppProvider({ children }: MiniAppProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [user, setUser] = useState<unknown | null>(null);

  useEffect(() => {
    const initMiniApp = async () => {
      try {
        if (typeof window !== 'undefined' && window.parent !== window) {
          const { sdk } = await import('@farcaster/miniapp-sdk');

          setIsInMiniApp(true);

          await sdk.actions.ready();

          const context = await sdk.context;
          if (context?.user) {
            setUser(context.user);
          }
        }

        setIsReady(true);
      } catch (error) {
        console.log('MiniApp SDK not available - running in standalone mode');
        setIsReady(true);
      }
    };

    initMiniApp();
  }, []);

  return (
    <MiniAppContext.Provider value={{ isReady, isInMiniApp, user }}>
      {children}
    </MiniAppContext.Provider>
  );
}
