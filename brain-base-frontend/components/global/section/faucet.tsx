'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { useClaimFaucet, useGetClaimStatus, useGetFaucetInfo } from '@/hooks/use-token';
import useAuth from '@/stores/auth';

export default function Faucet() {
  const router = useRouter();
  const { token } = useAuth();
  const { address, isConnected } = useAccount();

  const { data: claimStatus, isLoading: isLoadingStatus } = useGetClaimStatus({
    enabled: !!token,
  });
  const { data: faucetInfo } = useGetFaucetInfo({
    enabled: !!token,
  });
  const claimMutation = useClaimFaucet();

  const handleClaimFaucet = () => {
    if (!token) {
      router.push('/auth/sign-in');
      return;
    }

    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (claimStatus?.hasClaimed) {
      toast.error('You have already claimed the faucet');
      return;
    }

    claimMutation.mutate(address, {
      onSuccess: (data) => {
        toast.success(`Successfully claimed ${data.amount} BRAIN!`);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to claim faucet');
      },
    });
  };

  const getButtonText = () => {
    if (!token) return 'Claim it Now';
    if (!isConnected) return 'Connect Wallet';
    if (isLoadingStatus) return 'Loading...';
    if (claimStatus?.hasClaimed) return 'Already Claimed';
    if (claimMutation.isPending) return 'Claiming...';
    return 'Claim it Now';
  };

  const isButtonDisabled = token
    ? !isConnected || isLoadingStatus || claimStatus?.hasClaimed || claimMutation.isPending
    : false;

  return (
    <Card className="glass-background p-6 rounded-2xl w-full">
      <div className="flex flex-col items-center gap-2">
        <Image
          src="/images/faucet-image.png"
          alt="faucet"
          width={135}
          height={169}
        />
        <div className="text-center">
          <h4 className="text-lg font-bold">Get Your Free BRAIN</h4>
          <p className="text-xs font-normal text-slate-500">
            You will get free {faucetInfo?.faucetAmount ?? '100'} BRAIN token. You only can claim it
            once per account
          </p>
        </div>

        {token && claimStatus?.hasClaimed && (
          <p className="text-xs text-green-600">
            ✓ Claimed on {new Date(claimStatus.claimedAt!).toLocaleDateString()}
          </p>
        )}

        <Button
          variant={'outline'}
          className="w-full"
          onClick={handleClaimFaucet}
          disabled={isButtonDisabled}
        >
          {getButtonText()}
        </Button>
      </div>
    </Card>
  );
}
