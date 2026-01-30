'use client';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQueryStates, parseAsInteger } from 'nuqs';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EllipsisVertical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import AnswerDialog from '@/components/global/dialog/answer';
import Leaderboard from '@/components/global/section/leaderboard';
import QuestionDialog from '@/components/global/dialog/question';
import TooltipBadge from '@/components/global/badge/tooltip-badge';
import { PaginationCompo } from '@/components/ui/pagination';
import Faucet from '@/components/global/section/faucet';

import useQuestion from '@/stores/menu/question';
import { useParams } from 'next/navigation';
import {
  useDeleteQuestion,
  useGetAnswerList,
  useGetDetailQuestion,
  useValidateQuestions,
  useDeleteAnswer,
} from '@/hooks/menu/question';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import useTheme from '@/stores/theme';
import useAuth from '@/stores/auth';
import { IQuestion } from '@/types/menu/question';

export default function Question() {
  const router = useRouter();
  const { token } = useAuth();
  const { setModalSuccess, setModalDelete } = useTheme();
  const { setModalAnswer, modalAnswer } = useQuestion();
  const { setModalQuestion } = useTheme();

  const [editingQuestion, setEditingQuestion] = useState<IQuestion | null>(null);

  const [get, set] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
  });

  const { id } = useParams<{ id?: string }>();
  const isValidId = !!id && typeof id === 'string';

  const queryOptions = useMemo(
    () => ({
      enabled: isValidId,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    }),
    [isValidId],
  );

  const { data: question } = useGetDetailQuestion(id!, queryOptions);
  const { data: answer } = useGetAnswerList(id!, queryOptions, {
    page: get.page,
    limit: get.limit,
  });
  const { mutate: validateAnswer, isPending } = useValidateQuestions(id!);
  const { mutate: removeQuestion } = useDeleteQuestion(id!);
  const { mutate: removeAnswer } = useDeleteAnswer(id!);

  const handleValidate = (answerId: string) => {
    validateAnswer(answerId, {
      onSuccess: () => {
        setModalSuccess({
          title: 'Answer Validated',
          message: 'The answer has been validated successfully.',
          open: true,
          animation: 'success',
        });
      },
    });
  };

  const handlePageChange = ({ page, limit }: { page: number; limit: number }) => {
    set({ page });
    set({ limit });
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-7 lg:col-start-2">
        <div className="flex flex-col gap-6 items-center">
          {/* Question Card */}
          <Card className="glass-background p-6 rounded-2xl w-full">
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-row gap-2 items-center">
                <Image
                  src={'/images/unavailable-profile.png'}
                  alt={'unavailable-profile'}
                  className="w-10 h-10 rounded-full"
                  width={40}
                  height={40}
                />
                <div className="flex flex-col sm:flex-row gap-1 sm:items-center">
                  <span className="text-sm font-medium">{question?.author?.name}</span>
                  <div className="hidden sm:block w-1 h-1 bg-primary rounded-full" />
                  <p className="text-xs font-normal text-slate-500">
                    {question?.createdAt && !isNaN(new Date(question.createdAt).getTime())
                      ? new Date(question.createdAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TooltipBadge status={question?.status as 'Open' | 'Verified' | 'Cancelled'} />

                <Badge variant={'default'}>
                  <p className="flex items-center gap-1 text-xs font-normal">
                    <Image
                      src="/images/brain-coin.png"
                      alt="brain-coin"
                      width={20}
                      height={20}
                    />
                    {question?.bountyAmountWei && !isNaN(Number(question.bountyAmountWei))
                      ? Number(question.bountyAmountWei) / 1e18
                      : 0}{' '}
                  </p>
                  <span className="hidden lg:block">BRAIN</span>
                </Badge>
                {question?.isAuthor && question?.status === 'Open' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <EllipsisVertical className="w-5 h-5 text-blue-950 cursor-pointer" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingQuestion(question); // Set to edit mode
                          setModalQuestion(true);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <Separator />
                      <DropdownMenuItem
                        className="!text-red-500"
                        onClick={() => {
                          setModalDelete({
                            open: true,
                            title: 'Delete Question',
                            message:
                              'Are you sure you want to delete this question? This action cannot be undone.',
                            action: async () => {
                              removeQuestion(question.id);
                            },
                          });
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            <h4 className="font-semibold mt-4">{question?.title}</h4>
            <p className="text-lg font-normal mt-1.5 mb-6">{question?.bodyMd}</p>
            {!question?.isAuthor && question?.status === 'Open' && token && (
              <Button
                size="lg"
                className="max-w-40"
                variant="outline"
                onClick={() => setModalAnswer(true, null)}
              >
                <Plus />
                Add an Answer
              </Button>
            )}
          </Card>

          {/* Answer Section */}
          {question?.status === 'Open' && answer?.answers?.length === 0 && (
            <Card className="glass-background p-6 rounded-2xl w-full">
              <div className="flex justify-center gap-4 items-center flex-col">
                <Image
                  src={'/images/waiting-image.png'}
                  alt="waiting-image"
                  width={360}
                  height={237}
                />
                <div className="text-center">
                  <h3 className="text-2xl font-medium max-w-72">
                    {question?.author?.name} is waiting for your help.
                  </h3>
                  <span className="text-base text-slate-500">Give answers and earn coins.</span>
                </div>
                {!question?.isAuthor && question?.status === 'Open' && (
                  <Button
                    size="lg"
                    className="max-w-72 w-full"
                    variant="outline"
                    onClick={
                      token ? () => setModalAnswer(true, null) : () => router.push('/auth/sign-in')
                    }
                  >
                    <Plus />
                    Add an Answer
                  </Button>
                )}
              </div>
            </Card>
          )}
          {answer?.answers?.map((answer, index) => (
            <Card
              className="glass-background p-6 rounded-2xl w-full"
              key={index}
            >
              <div className="flex flex-row gap-2 items-center">
                <h4 className="text-lg grow font-bold">Answer</h4>
                {question?.isAuthor && question?.status === 'Open' ? (
                  <Button
                    size={'sm'}
                    variant={'outline'}
                    onClick={() => handleValidate(answer.id.toString())}
                    disabled={isPending}
                  >
                    {isPending ? 'Validating...' : 'Validate'}
                  </Button>
                ) : (
                  answer.isBest && (
                    <Badge
                      variant={'success'}
                      className="min-w-20"
                    >
                      Verified
                    </Badge>
                  )
                )}
                {answer?.isAuthor && question?.status === 'Open' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <EllipsisVertical className="w-5 h-5 text-blue-950 cursor-pointer" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setModalAnswer(true, { bodyMd: answer.bodyMd, id: answer.id });
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <Separator />
                      <DropdownMenuItem
                        className="!text-red-500"
                        onClick={() => {
                          setModalDelete({
                            open: true,
                            title: 'Delete Answer',
                            message:
                              'Are you sure you want to delete this answer? This action cannot be undone.',
                            action: async () => {
                              removeAnswer(answer.id);
                            },
                          });
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <Separator className="my-4" />
              <div className="flex flex-row gap-2 items-center mb-4">
                <Image
                  src={'/images/unavailable-profile.png'}
                  alt={'unavailable-profile'}
                  className="w-10 h-10 rounded-full"
                  width={40}
                  height={40}
                />
                <div>
                  <span className="text-sm font-medium">{answer.author.name}</span>
                  <p className="text-xs font-normal text-slate-500">
                    {' '}
                    {answer?.createdAt && !isNaN(new Date(answer.createdAt).getTime())
                      ? new Date(answer.createdAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </p>
                </div>
              </div>
              <p className="text-lg font-normal">{answer?.bodyMd}</p>
            </Card>
          ))}
          <PaginationCompo
            meta={{
              pagination: {
                page: answer?.meta?.page || 1,
                limit: answer?.meta?.limit || 10,
                totalPages: answer?.meta?.totalPages || 0,
                total: answer?.meta?.total || 0,
              },
            }}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
      <div className="col-span-12 lg:col-span-3">
        <div className="flex flex-col gap-6">
          <Leaderboard />
          <Faucet />
        </div>
      </div>
      <AnswerDialog
        answer={modalAnswer?.answer}
        question={question?.bodyMd || ''}
        questionId={Number(question?.id)}
      />
      <QuestionDialog
        questionToEdit={editingQuestion}
        onClose={() => setEditingQuestion(null)}
      />
    </div>
  );
}
