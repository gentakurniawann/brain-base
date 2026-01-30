import React from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Crown } from 'lucide-react';
import { BadgeCheck } from 'lucide-react';
import { useGetLeaderboard } from '@/hooks/menu/question';

export default function Leaderboard() {
  const { data: leaderboard } = useGetLeaderboard();

  return (
    <Card className="glass-background p-6 rounded-2xl w-full">
      <div className="flex gap-2 items-center">
        <Crown className="h-6 w-6" />
        <h4 className="text-lg font-bold">Verified Leaderboard</h4>
      </div>
      <Separator className="my-4" />
      {(leaderboard || []).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <Crown className="w-10 h-10 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-600">No Rankings Yet</h3>
          <p className="text-sm text-slate-500 mt-1">
            There are no verified answers yet. Be the first to help!
          </p>
        </div>
      ) : (
        <ul>
          {leaderboard?.map((user, index) => (
            <li
              key={index}
              className="text-sm py-1 px-2 flex flex-row justify-between items-center"
            >
              {user?.name}
              <span className="float-right font-medium text-xs">
                {user?._count?.answers}{' '}
                {user?._count?.answers === 1 || user?._count?.answers === 0 ? 'Answer' : 'Answers'}
                <BadgeCheck className="inline-block w-4 h-4 ml-2" />
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
