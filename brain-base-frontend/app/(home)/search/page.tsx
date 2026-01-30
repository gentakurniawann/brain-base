'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search as SearchIcon, TextSearch } from 'lucide-react';
import { PaginationCompo } from '@/components/ui/pagination';

import TooltipBadge from '@/components/global/badge/tooltip-badge';
import Leaderboard from '@/components/global/section/leaderboard';
import Faucet from '@/components/global/section/faucet';

import useAuth from '@/stores/auth';
import { useGetQuestionsList } from '@/hooks/menu/question';

export default function Search() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [get, set] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    search: parseAsString,
  });

  const handlePageChange = ({ page, limit }: { page: number; limit: number }) => {
    set({ page });
    set({ limit });
  };

  const { data: questions } = useGetQuestionsList({
    page: get.page,
    limit: get.limit,
    search: searchQuery,
  });

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-7 lg:col-start-2">
        <Card className="glass-background p-6 rounded-2xl w-full">
          <div className="flex flex-row items-center">
            <SearchIcon className="w-5 h-5 mr-2" />
            <h3 className="text-lg font-bold">Search Results</h3>
          </div>
          <Separator className="my-4" />
          {(questions?.data || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TextSearch className="w-16 h-16 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-600">No Questions Found</h3>
              <p className="text-sm text-slate-500 mt-1">
                There are no questions to display. Be the first to ask!
              </p>
            </div>
          ) : (
            (questions?.data || []).map((q) => (
              <div key={q.id}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex flex-row gap-2 items-center">
                    <Image
                      src={'/images/unavailable-profile.png'}
                      alt={'unavailable-profile'}
                      className="w-10 h-10 rounded-full"
                      width={40}
                      height={40}
                    />
                    <div className="flex flex-col sm:flex-row gap-1 sm:items-center">
                      <span className="text-sm font-medium">{q.author.name}</span>
                      <div className="hidden sm:block w-1 h-1 bg-primary rounded-full" />
                      <p className="text-xs font-normal text-slate-500">
                        {q?.createdAt && !isNaN(new Date(q.createdAt).getTime())
                          ? new Date(q.createdAt).toLocaleString('en-GB', {
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
                  <div className="flex flex-row gap-2">
                    <TooltipBadge status={q.status} />

                    <Badge variant={'default'}>
                      <p className="flex items-center gap-1 text-xs font-normal">
                        <Image
                          src="/images/brain-coin.png"
                          alt="brain-coin"
                          width={20}
                          height={20}
                        />
                        {q?.bountyAmountWei && !isNaN(Number(q.bountyAmountWei))
                          ? Number(q.bountyAmountWei) / 1e18
                          : 0}{' '}
                      </p>
                      <span className="hidden lg:block">BRAIN</span>
                    </Badge>
                  </div>
                </div>
                <p className="text-lg font-normal mt-4 mb-6 truncate">{q.bodyMd}</p>
                <div className="flex justify-end">
                  <Link href={`/question/${q.id}`}>
                    <Button
                      size={'lg'}
                      className="max-w-32"
                      variant={'outline'}
                    >
                      {q.isAuthor || q.status === 'Verified' || !token ? 'Detail' : 'Answer'}
                    </Button>
                  </Link>
                </div>
                <Separator className="my-4" />
              </div>
            ))
          )}
          <PaginationCompo
            meta={{
              pagination: {
                page: questions?.meta?.page || 1,
                limit: questions?.meta?.limit || 10,
                totalPages: questions?.meta?.totalPages || 0,
                total: questions?.meta?.total || 0,
                filter: questions?.meta?.filter || '',
                search: questions?.meta?.search || '',
              },
            }}
            onPageChange={handlePageChange}
          />
        </Card>
      </div>
      <div className="col-span-12 lg:col-span-3">
        <div className="flex flex-col gap-6">
          <Leaderboard />
          <Faucet />
        </div>
      </div>
    </div>
  );
}
