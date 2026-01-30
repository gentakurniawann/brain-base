'use client';

import React, { useEffect, useState } from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWaitForTransactionReceipt, useAccount, useBalance, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CustomField } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';

import useTheme from '@/stores/theme';
import {
  BRAIN_TOKEN_ADDRESS,
  BRAIN_SWAP_ADDRESS,
  MOCK_IDRX_ADDRESS,
} from '@/lib/chains/base-sepolia';

type SwapType = 'idrx-to-brain' | 'brain-to-idrx';
type SwapStep = 'input' | 'approving' | 'swapping' | 'success' | 'error';

const idrxToBrainSchema = z.object({
  idrxAmount: z.number().positive('Amount must be > 0'),
  brainAmount: z.number().nonnegative(),
});

const brainToIdrxSchema = z.object({
  brainAmount: z.number().positive('Amount must be > 0'),
  idrxAmount: z.number().nonnegative(),
});

const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const;

const BRAIN_SWAP_ABI = [
  {
    name: 'swapIdrxToBrain',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'idrxAmount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'swapBrainToIdrx',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'brainAmount', type: 'uint256' }],
    outputs: [],
  },
] as const;

const IDRX_TO_BRAIN_RATE = 0.0002;
const BRAIN_TO_IDRX_RATE = 5000;

export default function SwapToken() {
  const { modalSwapToken, setModalSwapToken } = useTheme();
  const { address, isConnected } = useAccount();
  const [swapType, setSwapType] = useState<SwapType>('idrx-to-brain');
  const [step, setStep] = useState<SwapStep>('input');

  const { data: idrxBalance, refetch: refetchIdrx } = useBalance({
    address,
    token: MOCK_IDRX_ADDRESS,
  });
  const { data: brainBalance, refetch: refetchBrain } = useBalance({
    address,
    token: BRAIN_TOKEN_ADDRESS,
  });

  const {
    writeContract: approveToken,
    data: approveHash,
    reset: resetApprove,
  } = useWriteContract();
  const { writeContract: executeSwap, data: swapHash, reset: resetSwap } = useWriteContract();

  const { isSuccess: isApproveConfirmed, isError: isApproveError } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  const { isSuccess: isSwapConfirmed, isError: isSwapError } = useWaitForTransactionReceipt({
    hash: swapHash,
  });

  const idrxForm = useForm<z.infer<typeof idrxToBrainSchema>>({
    resolver: zodResolver(idrxToBrainSchema),
    defaultValues: { idrxAmount: 5000, brainAmount: 1 },
  });

  const brainForm = useForm<z.infer<typeof brainToIdrxSchema>>({
    resolver: zodResolver(brainToIdrxSchema),
    defaultValues: { brainAmount: 1, idrxAmount: 5000 },
  });

  const handleIdrxChange = (value: number) =>
    idrxForm.setValue('brainAmount', value * IDRX_TO_BRAIN_RATE);
  const handleBrainChange = (value: number) =>
    brainForm.setValue('idrxAmount', value * BRAIN_TO_IDRX_RATE);


  useEffect(() => {
    if (isApproveConfirmed && step === 'approving') {
      setStep('swapping');

      if (swapType === 'idrx-to-brain') {
        const amount = idrxForm.getValues('idrxAmount');
        executeSwap({
          address: BRAIN_SWAP_ADDRESS,
          abi: BRAIN_SWAP_ABI,
          functionName: 'swapIdrxToBrain',
          args: [parseUnits(amount.toString(), 18)],
        });
      } else {
        const amount = brainForm.getValues('brainAmount');
        executeSwap({
          address: BRAIN_SWAP_ADDRESS,
          abi: BRAIN_SWAP_ABI,
          functionName: 'swapBrainToIdrx',
          args: [parseUnits(amount.toString(), 18)],
        });
      }
    }
  }, [isApproveConfirmed, step, swapType]);

  useEffect(() => {
    if (isSwapConfirmed && step === 'swapping') {
      setStep('success');
      toast.success('Swap berhasil!');
      refetchIdrx();
      refetchBrain();
      setTimeout(handleClose, 2000);
    }
  }, [isSwapConfirmed, step]);

  useEffect(() => {
    if (isApproveError || isSwapError) {
      setStep('error');
      toast.error('Transaction failed');
    }
  }, [isApproveError, isSwapError]);

  const onSubmitIdrxToBrain = async (data: z.infer<typeof idrxToBrainSchema>) => {
    if (!isConnected) {
      toast.error('Connect wallet first');
      return;
    }
    setStep('approving');
    approveToken({
      address: MOCK_IDRX_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [BRAIN_SWAP_ADDRESS, parseUnits(data.idrxAmount.toString(), 18)],
    });
  };

  const onSubmitBrainToIdrx = async (data: z.infer<typeof brainToIdrxSchema>) => {
    if (!isConnected) {
      toast.error('Connect wallet first');
      return;
    }
    setStep('approving');
    approveToken({
      address: BRAIN_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [BRAIN_SWAP_ADDRESS, parseUnits(data.brainAmount.toString(), 18)],
    });
  };

  const handleClose = () => {
    setStep('input');
    idrxForm.reset();
    brainForm.reset();
    resetApprove();
    resetSwap();
    setModalSwapToken(false);
  };

  const getButtonText = () => {
    const texts: Record<SwapStep, string> = {
      approving: 'Approving...',
      swapping: 'Swapping...',
      success: '✓ Success!',
      error: 'Try Again',
      input: 'Swap',
    };
    return texts[step];
  };

  const isButtonDisabled = ['approving', 'swapping', 'success'].includes(step);

  return (
    <Dialog
      open={modalSwapToken}
      onOpenChange={(open) => {
        if (!open) handleClose();
        else setModalSwapToken(open);
      }}
    >
      <DialogContent className="!max-w-[380px] glass-background">
        <DialogTitle className="hidden" />
        <div className="flex flex-col items-center gap-4">
          <h4 className="text-lg font-bold">Swap Token</h4>

          {/* Tabs */}
          <div className="flex gap-2 w-full">
            <Button
              size="sm"
              variant={swapType === 'idrx-to-brain' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => {
                setSwapType('idrx-to-brain');
                setStep('input');
              }}
            >
              mIDRX → BRAIN
            </Button>
            <Button
              size="sm"
              variant={swapType === 'brain-to-idrx' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => {
                setSwapType('brain-to-idrx');
                setStep('input');
              }}
            >
              BRAIN → mIDRX
            </Button>
          </div>

          {/* Rate & Balance */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {swapType === 'idrx-to-brain' ? '5,000 mIDRX = 1 BRAIN' : '1 BRAIN = 5,000 mIDRX'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Balance:{' '}
              {swapType === 'idrx-to-brain'
                ? `${parseFloat(idrxBalance?.formatted ?? '0').toLocaleString()} mIDRX`
                : `${parseFloat(brainBalance?.formatted ?? '0').toLocaleString()} BRAIN`}
            </p>
          </div>

          {/* mIDRX → BRAIN */}
          {swapType === 'idrx-to-brain' && (
            <Form {...idrxForm}>
              <form
                className="space-y-3 w-full"
                onSubmit={idrxForm.handleSubmit(onSubmitIdrxToBrain)}
              >
                <CustomField
                  control={idrxForm.control}
                  name="idrxAmount"
                  className="w-full"
                  render={({ field }) => (
                    <div className="relative">
                      <Input
                        type="number"
                        step="100"
                        className="glass-background text-center pr-16"
                        {...field}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value) || 0;
                          field.onChange(v);
                          handleIdrxChange(v);
                        }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        mIDRX
                      </span>
                    </div>
                  )}
                />
                <CustomField
                  control={idrxForm.control}
                  name="brainAmount"
                  className="w-full"
                  render={({ field }) => (
                    <div className="relative">
                      <Input
                        disabled
                        className="glass-background text-center pr-16"
                        value={field.value.toFixed(2)}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        BRAIN
                      </span>
                    </div>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isButtonDisabled || !isConnected}
                >
                  {!isConnected ? 'Connect Wallet' : getButtonText()}
                </Button>
              </form>
            </Form>
          )}

          {/* BRAIN → mIDRX */}
          {swapType === 'brain-to-idrx' && (
            <Form {...brainForm}>
              <form
                className="space-y-3 w-full"
                onSubmit={brainForm.handleSubmit(onSubmitBrainToIdrx)}
              >
                <CustomField
                  control={brainForm.control}
                  name="brainAmount"
                  className="w-full"
                  render={({ field }) => (
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.1"
                        className="glass-background text-center pr-16"
                        {...field}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value) || 0;
                          field.onChange(v);
                          handleBrainChange(v);
                        }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        BRAIN
                      </span>
                    </div>
                  )}
                />
                <CustomField
                  control={brainForm.control}
                  name="idrxAmount"
                  className="w-full"
                  render={({ field }) => (
                    <div className="relative">
                      <Input
                        disabled
                        className="glass-background text-center pr-16"
                        value={field.value.toLocaleString()}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        mIDRX
                      </span>
                    </div>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isButtonDisabled || !isConnected}
                >
                  {!isConnected ? 'Connect Wallet' : getButtonText()}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
