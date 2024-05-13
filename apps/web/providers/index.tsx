'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import {
  WagmiProvider,
  useEmbeddedSmartAccountConnector,
} from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { privyConfig, wagmiConfig } from '../utils';
import { ToastContainer } from 'react-toastify';
import { signerToZeroDevSmartAccount } from '../utils/smartAccount';
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient();

function SmartAccountProvider({ children }: { children: React.ReactNode }) {
  useEmbeddedSmartAccountConnector({
    getSmartAccountFromSigner: signerToZeroDevSmartAccount,
  });

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={`${process.env.NEXT_PUBLIC_PRIVY_APP_ID}`}
      config={privyConfig}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <ToastContainer position="top-right" />
          <SmartAccountProvider>{children}</SmartAccountProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
