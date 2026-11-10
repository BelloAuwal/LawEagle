import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'navy' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060D17]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-2 min-h-[38px] gap-1.5',
    md: 'text-sm px-4 py-2.5 min-h-[44px] gap-2', // meets 44px minimum touch target
    lg: 'text-base px-6 py-3.5 min-h-[50px] gap-2.5 font-semibold',
  }[size];

  const variantStyles = {
    gold: 'bg-gradient-to-r from-[#D8B15F] via-[#C5A059] to-[#B38D43] text-[#07111D] font-semibold hover:brightness-105 shadow-md shadow-[#C5A059]/20 border border-[#F5E8C2]/40',
    navy: 'bg-[#0E223D] text-white hover:bg-[#153158] border border-[#C5A059]/30 shadow-sm',
    outline:
      'bg-transparent text-[#E4C47C] border border-[#C5A059]/50 hover:bg-[#C5A059]/10 hover:border-[#C5A059]',
    ghost: 'bg-transparent text-slate-300 hover:text-white hover:bg-white/5',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
