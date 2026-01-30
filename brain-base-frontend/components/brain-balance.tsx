'use client';

import Image from 'next/image';

import { Card } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

import { useAccount, useBalance } from 'wagmi';
import { BRAIN_TOKEN_ADDRESS } from '@/lib/chains/base-sepolia';

export default function BrainBalance() {
  const { address, isConnected } = useAccount();

  const { data: brainBalance, isLoading } = useBalance({
    address,
    token: BRAIN_TOKEN_ADDRESS as `0x${string}`,
  });

  return (
    <Tooltip>
      <TooltipTrigger>
        <Card className="glass-background p-2 h-10 w-32">
          <div className="flex items-center gap-2">
            <Image
              src="/images/brain-coin.png"
              alt="brain-coin"
              width={24}
              height={24}
            />
            <span className="text-sm font-semibold text-blue-950 w-full truncate">
              {isConnected
                ? isLoading
                  ? '...'
                  : (brainBalance?.formatted ?? '0')
                : 'Connect Wallet'}
            </span>
          </div>
        </Card>
      </TooltipTrigger>
      <TooltipContent>
        <span className="text-sm font-semibold text-blue-950">
          {isConnected
            ? (isLoading ? '...' : (brainBalance?.formatted ?? '0')) + ' BRAIN'
            : 'Connect Wallet'}
        </span>
      </TooltipContent>
    </Tooltip>
  );
}
