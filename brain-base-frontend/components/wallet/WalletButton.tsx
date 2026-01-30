'use client';

import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
  WalletDropdownLink,
} from '@coinbase/onchainkit/wallet';
import { Address, Avatar, Name, Identity } from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';

/**
 * WalletButton component using OnchainKit
 * Provides a modern, Base-native wallet connection experience
 */
export function WalletButton() {
  const { address, isConnected } = useAccount();

  return (
    <Wallet>
      <ConnectWallet className="bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-2 font-medium transition-colors">
        <Avatar className="h-5 w-5" />
        <Name className="ml-2" />
      </ConnectWallet>
      <WalletDropdown>
        <Identity
          className="px-4 pt-3 pb-2"
          hasCopyAddressOnClick
        >
          <Avatar />
          <Name />
          <Address />
        </Identity>
        {isConnected && address && (
          <WalletDropdownLink
            icon="wallet"
            href={`https://sepolia.basescan.org/address/${address}`}
            target="_blank"
          >
            View on BaseScan
          </WalletDropdownLink>
        )}
        <WalletDropdownDisconnect />
      </WalletDropdown>
    </Wallet>
  );
}

export default WalletButton;
