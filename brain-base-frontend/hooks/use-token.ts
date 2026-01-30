import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parseEther } from 'viem';
import {
  getFaucetInfo,
  getBrainBalance,
  getClaimStatus,
  claimFaucet,
  getSwapQuote,
  getDepositAddress,
  swapQieForBrain,
  getSwapHistory,
} from '@/services/token';
import type {
  TFaucetInfoResponse,
  TBalanceResponse,
  TClaimStatusResponse,
  TClaimFaucetResponse,
  TSwapQuoteResponse,
  TDepositAddressResponse,
  TSwapResponse,
  TSwapHistoryItem,
} from '@/types/token';

export function useGetFaucetInfo(options?: { enabled?: boolean }) {
  return useQuery<TFaucetInfoResponse, Error>({
    queryKey: ['faucet-info'],
    queryFn: getFaucetInfo,
    enabled: options?.enabled ?? true,
  });
}

export function useGetBrainBalance(address?: string) {
  return useQuery<TBalanceResponse, Error>({
    queryKey: ['brain-balance', address],
    queryFn: () => getBrainBalance(address!),
    enabled: !!address,
  });
}

export function useGetClaimStatus(options?: { enabled?: boolean }) {
  return useQuery<TClaimStatusResponse, Error>({
    queryKey: ['claim-status'],
    queryFn: getClaimStatus,
    enabled: options?.enabled ?? true,
  });
}

export function useGetSwapQuote(qieAmount?: string) {
  return useQuery<TSwapQuoteResponse, Error>({
    queryKey: ['swap-quote', qieAmount],
    queryFn: () => {
      const qieAmountWei = qieAmount!.includes('.')
        ? parseEther(qieAmount!).toString()
        : qieAmount!;
      return getSwapQuote(qieAmountWei);
    },
    enabled: !!qieAmount && qieAmount !== '0',
  });
}

export function useGetDepositAddress() {
  return useQuery<TDepositAddressResponse, Error>({
    queryKey: ['deposit-address'],
    queryFn: getDepositAddress,
  });
}

export function useGetSwapHistory() {
  return useQuery<TSwapHistoryItem[], Error>({
    queryKey: ['swap-history'],
    queryFn: getSwapHistory,
  });
}

export function useClaimFaucet() {
  const queryClient = useQueryClient();

  return useMutation<TClaimFaucetResponse, Error, string>({
    mutationFn: (walletAddress: string) => claimFaucet({ walletAddress }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claim-status'] });
      queryClient.invalidateQueries({ queryKey: ['brain-balance'] });
      queryClient.invalidateQueries({ queryKey: ['faucet-info'] });
    },
  });
}

export function useSwapQieForBrain() {
  const queryClient = useQueryClient();

  return useMutation<TSwapResponse, Error, { txHash: string; walletAddress: string }>({
    mutationFn: (data) => swapQieForBrain(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swap-history'] });
      queryClient.invalidateQueries({ queryKey: ['brain-balance'] });
      queryClient.invalidateQueries({ queryKey: ['faucet-info'] });
    },
  });
}
