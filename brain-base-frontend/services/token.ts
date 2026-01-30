import axios from '@/lib/axios';
import type {
  TFaucetInfoResponse,
  TBalanceResponse,
  TClaimStatusResponse,
  TClaimFaucetResponse,
  TClaimFaucetRequest,
  TSwapQuoteResponse,
  TDepositAddressResponse,
  TSwapResponse,
  TSwapRequest,
  TSwapHistoryItem,
} from '@/types/token';

export async function getFaucetInfo(): Promise<TFaucetInfoResponse> {
  try {
    const response = await axios.get('/faucet-swap/info');
    return response.data;
  } catch (error) {
    console.error('Error from getFaucetInfo:', error);
    throw error;
  }
}

/**
 * Get BRAIN balance for a wallet address
 */
export async function getBrainBalance(address: string): Promise<TBalanceResponse> {
  try {
    const response = await axios.get('/faucet-swap/balance', {
      params: { address },
    });
    return response.data;
  } catch (error) {
    console.error('Error from getBrainBalance:', error);
    throw error;
  }
}

/**
 * Get swap quote (how much BRAIN for given QIE amount)
 * @param qieAmountWei - QIE amount in wei (e.g., "1000000000000000000" for 1 QIE)
 */
export async function getSwapQuote(qieAmountWei: string): Promise<TSwapQuoteResponse> {
  try {
    const response = await axios.get('/faucet-swap/quote', {
      params: { qieAmount: qieAmountWei },
    });
    return response.data;
  } catch (error) {
    console.error('Error from getSwapQuote:', error);
    throw error;
  }
}

/**
 * Get deposit address for QIE swaps
 */
export async function getDepositAddress(): Promise<TDepositAddressResponse> {
  try {
    const response = await axios.get('/faucet-swap/deposit-address');
    return response.data;
  } catch (error) {
    console.error('Error from getDepositAddress:', error);
    throw error;
  }
}

// ==================== AUTHENTICATED ENDPOINTS ====================

/**
 * Get faucet claim status for logged-in user
 */
export async function getClaimStatus(): Promise<TClaimStatusResponse> {
  try {
    const response = await axios.get('/faucet-swap/claim-status');
    return response.data;
  } catch (error) {
    console.error('Error from getClaimStatus:', error);
    throw error;
  }
}

/**
 * Claim faucet for logged-in user (1 claim per account)
 */
export async function claimFaucet(data: TClaimFaucetRequest): Promise<TClaimFaucetResponse> {
  try {
    const response = await axios.post('/faucet-swap/claim', data);
    return response.data;
  } catch (error) {
    console.error('Error from claimFaucet:', error);
    throw error;
  }
}

/**
 * Swap QIE for BRAIN
 * Flow: User sends QIE to deposit address, then calls this with txHash as proof
 */
export async function swapQieForBrain(data: TSwapRequest): Promise<TSwapResponse> {
  try {
    const response = await axios.post('/faucet-swap/swap', data);
    return response.data;
  } catch (error) {
    console.error('Error from swapQieForBrain:', error);
    throw error;
  }
}

/**
 * Get user's swap history
 */
export async function getSwapHistory(): Promise<TSwapHistoryItem[]> {
  try {
    const response = await axios.get('/faucet-swap/swap-history');
    return response.data;
  } catch (error) {
    console.error('Error from getSwapHistory:', error);
    throw error;
  }
}
