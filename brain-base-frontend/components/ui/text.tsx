import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/utils';

interface TextProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  iconClassName?: string;
}

const Text = React.forwardRef<HTMLInputElement, TextProps>(
  ({ className, type, icon: Icon, iconClassName, ...props }, ref) => {
    return (
      <div className="relative">
        {Icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 z-10">
            <Icon className={cn('h-5 w-5', iconClassName)} />
          </div>
        )}
        <input
          type={type}
          className={cn(
            'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            Icon && 'pr-10',
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);

Text.displayName = 'Text';

export { Text };
