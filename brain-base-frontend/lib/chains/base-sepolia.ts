import { defineChain } from 'viem';

export const baseSepolia = defineChain({
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
    public: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
  },
  testnet: true,
});

// Contract Addresses - Update after deployment
export const BRAIN_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_BRAIN_TOKEN_ADDRESS as `0x${string}`;
export const MOCK_IDRX_ADDRESS = process.env.NEXT_PUBLIC_MOCK_IDRX_ADDRESS as `0x${string}`;
export const BRAIN_SWAP_ADDRESS = process.env.NEXT_PUBLIC_BRAIN_SWAP_ADDRESS as `0x${string}`;

// QnAWithBounty Contract - User must approve this contract to spend their BRAIN
export const QNA_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_QNA_CONTRACT_ADDRESS as `0x${string}`;

