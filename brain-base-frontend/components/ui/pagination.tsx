import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-react';

import { cn } from '@/utils/utils';
import { Button, ButtonProps, buttonVariants } from '@/components/ui/button';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Meta } from '@/types';

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('flex w-full justify-center md:justify-end', className)}
    {...props}
  />
);
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  ),
);
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn('', className)}
      {...props}
    />
  ),
);
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
  isActive?: boolean;
  disabled?: boolean;
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>;

const PaginationLink = ({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? 'default' : 'ghost',
        size,
      }),
      '!rounded-md',
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn('gap-1 pl-2.5 hover:bg-white/0', className)}
    {...props}
  >
    <Button
      size="icon"
      variant="outline"
      className="!rounded-md"
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>
  </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn('gap-1 pr-2.5 hover:bg-white/0', className)}
    {...props}
  >
    <Button
      size="icon"
      variant="outline"
      className="!rounded-md"
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex h-9 w-9 items-center justify-center rounded-md', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

type TPaginationProps = {
  meta: Meta;
  pageSize?: string[];
  onPageChange: ({ page, limit }: { page: number; limit: number }) => void;
  className?: string;
};

const PaginationCompo = ({
  meta,
  pageSize = ['10', '15', '20', '25'],
  onPageChange,
  className,
}: TPaginationProps) => {
  const { page, totalPages } = meta.pagination;
  const calculateJumpSize = () => {
    if (totalPages <= 10) return 2;
    if (totalPages <= 20) return 3;
    if (totalPages <= 50) return 5;
    return Math.floor(totalPages / 10);
  };

  const jumpSize = calculateJumpSize();
  const handleJumpBack = () => {
    const newPage = Math.max(1, page - jumpSize);
    onPageChange({ page: newPage, limit: meta.pagination.limit });
  };

  const handleJumpForward = () => {
    const newPage = Math.min(totalPages, page + jumpSize);
    onPageChange({ page: newPage, limit: meta.pagination.limit });
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const visiblePages = 5;

    let startPage = Math.max(1, page - Math.floor(visiblePages / 2));
    let endPage = startPage + visiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - visiblePages + 1);
    }

    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) pageNumbers.push('ellipsis1');
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pageNumbers.push('ellipsis2');
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  if (totalPages === 0) return null;

  return (
    <div
      className={cn(
        'flex flex-col md:flex-row w-full justify-between items-center gap-4',
        className,
      )}
    >
      {/* Page Size Selector - Hidden on very small screens */}
      <div className="hidden sm:block">
        <Select
          defaultValue={String(meta.pagination.limit)}
          onValueChange={(value) => onPageChange({ page: 1, limit: Number(value) })}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Items per page</SelectLabel>
              {pageSize?.map((size) => (
                <SelectItem
                  key={size}
                  value={String(size)}
                >
                  {size}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Pagination Controls */}
      <Pagination>
        <PaginationContent className="gap-1 sm:gap-2">
          {/* Navigation buttons - Shown based on screen size */}
          <div className="hidden sm:flex items-center">
            <PaginationItem>
              <PaginationLink
                onClick={handleJumpBack}
                className={cn(page <= 1 && 'pointer-events-none opacity-50')}
              >
                <Button
                  size="icon"
                  variant="outline"
                  className="!rounded-md"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
              </PaginationLink>
            </PaginationItem>
          </div>

          <PaginationItem>
            <PaginationPrevious
              onClick={() =>
                onPageChange({
                  page: Math.max(1, page - 1),
                  limit: meta.pagination.limit,
                })
              }
              className={cn(page === 1 && 'pointer-events-none opacity-50')}
            />
          </PaginationItem>

          {/* Page Numbers - Responsive */}
          <div className="hidden sm:flex items-center">
            {getPageNumbers().map((pageNumber, index) => (
              <PaginationItem key={`${pageNumber}-${index}`}>
                {pageNumber === 'ellipsis1' || pageNumber === 'ellipsis2' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    isActive={page === pageNumber}
                    onClick={() =>
                      onPageChange({
                        page: pageNumber as number,
                        limit: meta.pagination.limit,
                      })
                    }
                    className="cursor-pointer"
                  >
                    {pageNumber}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
          </div>

          {/* Mobile Current Page Indicator */}
          <div className="sm:hidden">
            <span className="text-xs md:text-sm text-center">
              Page {page} of {totalPages}
            </span>
          </div>

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                onPageChange({
                  page: Math.min(totalPages, page + 1),
                  limit: meta.pagination.limit,
                })
              }
              className={cn(page === totalPages && 'pointer-events-none opacity-50')}
            />
          </PaginationItem>

          {/* Jump Forward - Hidden on mobile */}
          <div className="hidden sm:flex items-center">
            <PaginationItem>
              <PaginationLink
                onClick={handleJumpForward}
                className={cn(page >= totalPages && 'pointer-events-none opacity-50')}
              >
                <Button
                  size="icon"
                  variant="outline"
                  className="!rounded-md"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </PaginationLink>
            </PaginationItem>
          </div>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

PaginationCompo.displayName = 'PaginationCompo';

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationCompo,
};
