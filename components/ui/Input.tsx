import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  onIconClick?: () => void;
  iconClickable?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon: Icon, onIconClick, iconClickable, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            ref={ref}
            className={cn(
              "flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm",
              Icon ? "pr-10" : "",
              error ? "border-red-500 focus:ring-red-500" : "",
              className
            )}
            {...props}
          />
          {Icon && (
            <div 
              className={cn(
                "absolute right-3 top-2.5 text-slate-400",
                iconClickable ? "cursor-pointer hover:text-slate-600" : "pointer-events-none"
              )}
              onClick={iconClickable ? onIconClick : undefined}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-500 animate-slide-up">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';