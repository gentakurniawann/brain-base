'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import TanstackQueryProvider from '@/lib/react-query';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Loader2 } from 'lucide-react';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, metaMask } from 'wagmi/connectors';
import { OnchainKitProvider } from '@coinbase/onchainkit';

const ModalSuccess = dynamic(() => import('@/components/global/modal-success'), { ssr: false });
const ModalDelete = dynamic(() => import('@/components/global/modal-delete'), { ssr: false });
const SwapToken = dynamic(() => import('@/components/global/dialog/swap-token'), { ssr: false });

import { Toaster } from '@/components/ui/sonner';
import useTheme from '@/stores/theme';
import useAuth from '@/stores/auth';

import '@coinbase/onchainkit/styles.css';

const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'BrainBase',
      preference: 'smartWalletOnly',
    }),
    metaMask({
      dappMetadata: {
        name: 'BrainBase',
      },
    }),
  ],
  ssr: true,
  transports: {
    [baseSepolia.id]: http(),
  },
});

export default function RootProviders({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoading } = useTheme();
  const { getToken } = useAuth();

  useEffect(() => {
    getToken();
  }, [getToken]);

  return (
    <WagmiProvider config={wagmiConfig}>
      <TanstackQueryProvider>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={baseSepolia}
          config={{
            appearance: { mode: 'light' },
            wallet: {
              display: 'modal',
            },
          }}
        >
          <NuqsAdapter>
            <ModalSuccess />
            <ModalDelete />
            <SwapToken />
            <div className="relative w-full h-full">
              {isLoading && (
                <div className="w-full min-h-full flex items-center justify-center bg-gray-500/60 z-50 absolute">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              )}
              {children}
            </div>
            <Toaster richColors />
          </NuqsAdapter>
        </OnchainKitProvider>
      </TanstackQueryProvider>
    </WagmiProvider>
  );
}
