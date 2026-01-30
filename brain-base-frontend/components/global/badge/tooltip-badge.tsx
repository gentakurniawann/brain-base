import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface TooltipBadgeProps {
  status: 'Open' | 'Verified' | 'Cancelled';
}

export default function TooltipBadge({ status }: TooltipBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge
          variant={
            status === 'Open'
              ? 'open'
              : status === 'Verified'
                ? 'success'
                : status === 'Cancelled'
                  ? 'destructive'
                  : 'default'
          }
          className="min-w-20"
        >
          {status}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">
          {status === 'Open'
            ? 'This question is open for answers.'
            : status === 'Verified'
              ? 'This question has been verified and accepted.'
              : status === 'Cancelled'
                ? 'This question has been cancelled.'
                : 'Status of the question.'}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
