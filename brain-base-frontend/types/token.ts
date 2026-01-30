// Types for Token/Faucet/Swap features

// ==================== API Response Types ====================

export interface TFaucetInfoResponse {
  faucetAmount: string;
  swapRate: number;
  totalAccountClaims: number;
  availableBrain: string;
  backendWallet: string;
}

export interface TBalanceResponse {
  address: string;
  balance: string;
  balanceFormatted: string;
}

export interface TClaimStatusResponse {
  hasClaimed: boolean;
  claimedAt: string | null;
  txHash: string | null;
  faucetAmount: string;
  canClaim: boolean;
}

export interface TClaimFaucetResponse {
  success: boolean;
  message: string;
  txHash: string;
  amount: string;
  walletAddress: string;
}

export interface TSwapQuoteResponse {
  qieAmount: string;
  brainAmount: string;
  rate: number;
}

export interface TDepositAddressResponse {
  depositAddress: string;
}

export interface TSwapResponse {
  success: boolean;
  message: string;
  qieAmount: string;
  brainAmount: string;
  swapRate: number;
  depositTxHash: string;
  transferTxHash: string;
  walletAddress: string;
}

export interface TSwapHistoryItem {
  id: number;
  brainAmount: string;
  qieAmount: string;
  txHash: string;
  createdAt: string;
}

// ==================== Request Types ====================

export interface TClaimFaucetRequest {
  walletAddress: string;
}

export interface TSwapRequest {
  txHash: string;
  walletAddress: string;
}
