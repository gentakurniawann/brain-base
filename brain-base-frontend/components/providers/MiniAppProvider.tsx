'use client';

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';

interface MiniAppContextType {
  isReady: boolean;
  isInMiniApp: boolean;
  user: any | null;
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

/**
 * MiniAppProvider wraps the app to provide Base Mini App SDK context
 * Detects if running inside Base App/Farcaster and initializes SDK
 */
export function MiniAppProvider({ children }: MiniAppProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const initMiniApp = async () => {
      try {
        // Check if running inside Farcaster/Base App frame
        if (typeof window !== 'undefined' && window.parent !== window) {
          // Dynamic import to avoid SSR issues
          const { sdk } = await import('@farcaster/miniapp-sdk');

          setIsInMiniApp(true);

          // Signal that app is ready to be displayed
          await sdk.actions.ready();

          // Get user context if available
          const context = await sdk.context;
          if (context?.user) {
            setUser(context.user);
          }
        }

        setIsReady(true);
      } catch (error) {
        // Not running in MiniApp context - this is fine
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
