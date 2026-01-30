'use client';
import React, { useEffect, useState } from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { parseEther, maxUint256 } from 'viem';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import useTheme from '@/stores/theme';
import { CustomField } from '@/components/ui/form-field';
import { Text as TextInput } from '@/components/ui/text';
import { useCreateQuestion, useUpdateQuestion } from '@/hooks/menu/question';
import { IQuestionPayload } from '@/types/menu/question';
import { BRAIN_TOKEN_ADDRESS, QNA_CONTRACT_ADDRESS } from '@/lib/chains/base-sepolia';
import BrainBalance from '@/components/brain-balance';
import { toast } from 'sonner';

const ERC20_ABI = [
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const;

export const makeQuestionFormSchema = (userBalance: number) =>
  z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    bodyMd: z.string().min(10, 'Question must be at least 10 characters'),
    bounty: z
      .string()
      .nonempty('Please insert bounty')
      .refine((val) => /^[0-9]+$/.test(val), {
        message: 'Bounty must be a whole number',
      })
      .refine((val) => parseInt(val) >= 1, {
        message: 'Minimum bounty is 1 BRAIN',
      })
      .refine((val) => parseInt(val) <= userBalance, {
        message: `Bounty cannot exceed your wallet balance (${Math.floor(userBalance)} BRAIN)`,
      }),
  });

interface QuestionDialogProps {
  questionToEdit?: {
    id: number;
    title: string;
    bodyMd: string;
    bountyAmountWei?: string;
  } | null;
  onClose?: () => void;
}

export default function QuestionDialog({ questionToEdit, onClose }: QuestionDialogProps) {
  const { modalQuestion, setModalQuestion, setModalSuccess } = useTheme();
  const { address } = useAccount();
  const [step, setStep] = useState<'idle' | 'approving' | 'submitting'>('idle');
  const [pendingFormData, setPendingFormData] = useState<z.infer<
    ReturnType<typeof makeQuestionFormSchema>
  > | null>(null);

  const { data: brainBalance } = useBalance({
    address,
    token: BRAIN_TOKEN_ADDRESS as `0x${string}`,
  });
  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract({
    address: BRAIN_TOKEN_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, QNA_CONTRACT_ADDRESS as `0x${string}`] : undefined,
  });

  const {
    writeContract: writeApprove,
    data: approveTxHash,
    isPending: isApprovePending,
  } = useWriteContract();

  const { isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  const balanceValue = parseFloat(brainBalance?.formatted || '0');
  const questionFormSchema = makeQuestionFormSchema(balanceValue);

  const form = useForm<z.infer<typeof questionFormSchema>>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      title: questionToEdit?.title || '',
      bodyMd: questionToEdit?.bodyMd || '',
      bounty: questionToEdit ? (Number(questionToEdit.bountyAmountWei) / 1e18).toString() : '',
    },
  });

  const { mutate: createQuestion, isPending: isCreating } = useCreateQuestion();
  const { mutate: updateQuestion, isPending: isUpdating } = useUpdateQuestion(
    questionToEdit?.id?.toString() || '',
  );

  const isEditing = !!questionToEdit;

  const checkAllowanceAndSubmit = (bountyWei: bigint) => {
    const allowance = currentAllowance ? BigInt(currentAllowance.toString()) : BigInt(0);
    if (allowance >= bountyWei) {
      submitToBackend();
    } else {
      setStep('approving');
      writeApprove({
        address: BRAIN_TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [QNA_CONTRACT_ADDRESS as `0x${string}`, maxUint256],
      });
    }
  };

  const submitToBackend = () => {
    if (!pendingFormData) return;

    setStep('submitting');
    const payload: IQuestionPayload = {
      title: pendingFormData.title,
      bodyMd: pendingFormData.bodyMd,
      bounty: pendingFormData.bounty,
    };

    createQuestion(payload, {
      onSuccess: () => {
        setModalSuccess({
          title: 'Question Submitted',
          message: 'Your question has been submitted successfully.',
          open: true,
          animation: 'success',
        });
        form.reset();
        setModalQuestion(false);
        setStep('idle');
        setPendingFormData(null);
      },
      onError: (error) => {
        console.error('Submission failed:', error);
        alert(error instanceof Error ? error.message : 'Failed to submit question');
        setStep('idle');
        setPendingFormData(null);
      },
    });
  };

  useEffect(() => {
    if (isApproveConfirmed && step === 'approving' && pendingFormData) {
      refetchAllowance();
      submitToBackend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApproveConfirmed, step, pendingFormData]);

  const onSubmit = async (data: z.infer<typeof questionFormSchema>) => {
    if (isEditing && questionToEdit) {
      const payload: IQuestionPayload = {
        title: data.title,
        bodyMd: data.bodyMd,
        bounty: data.bounty,
        id: questionToEdit.id.toString(),
      };
      updateQuestion(payload, {
        onSuccess: () => {
          toast.success('Question updated successfully');
          form.reset();
          setModalQuestion(false);
          setStep('idle');
          setPendingFormData(null);
        },
        onError: (error) => {
          console.error('Update failed:', error);
          alert(error instanceof Error ? error.message : 'Failed to update question');
          setStep('idle');
          setPendingFormData(null);
        },
      });
    }

    const bountyWei = parseEther(data.bounty);
    setPendingFormData(data);
    checkAllowanceAndSubmit(bountyWei);
  };

  useEffect(() => {
    if (questionToEdit) {
      form.reset({
        title: questionToEdit.title,
        bodyMd: questionToEdit.bodyMd,
        bounty: (Number(questionToEdit.bountyAmountWei) / 1e18).toString(),
      });
    } else {
      form.reset({
        title: '',
        bodyMd: '',
        bounty: '',
      });
    }
  }, [questionToEdit, form]);

  const isLoading = step !== 'idle' || isApprovePending || isCreating || isUpdating;

  const getButtonText = () => {
    if (isEditing) return 'Save Changes';
    if (isApprovePending) return 'Approve in Wallet...';
    if (step === 'approving') return 'Approving...';
    if (step === 'submitting' || isCreating) return 'Submitting...';
    return 'Submit Question';
  };

  return (
    <Dialog
      open={modalQuestion}
      onOpenChange={(open) => {
        setModalQuestion(open);
        if (!open) {
          form.reset({ title: '', bodyMd: '', bounty: '' });
          setStep('idle');
          setPendingFormData(null);
          onClose?.();
        }
      }}
    >
      <DialogContent className="!max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Question' : 'Ask a Question'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <CustomField
                name="title"
                control={form.control}
                render={({ field }) => (
                  <TextInput
                    placeholder="Write title here"
                    {...field}
                  />
                )}
              />
              <CustomField
                name="bodyMd"
                control={form.control}
                render={({ field }) => (
                  <Textarea
                    placeholder="Write your question here"
                    className="h-56"
                    {...field}
                  />
                )}
              />
              <div className="flex flex-row justify-between items-start">
                <div className="flex flex-row gap-2 items-start">
                  <CustomField
                    name="bounty"
                    control={form.control}
                    render={({ field }) => (
                      <TextInput
                        placeholder="Write Bounty eg. 1"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          field.onChange(value);
                        }}
                        disabled={isLoading}
                      />
                    )}
                  />
                  <BrainBalance />
                </div>

                <Button
                  type="submit"
                  variant="default"
                  size={'lg'}
                  disabled={isLoading}
                >
                  {getButtonText()}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
