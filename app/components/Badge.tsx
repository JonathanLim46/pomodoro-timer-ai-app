import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-[#E8EDF2] text-[#2C3E50]',
    success: 'bg-[#D1FAE5] text-[#065F46]',
    warning: 'bg-[#FEF3C7] text-[#92400E]',
    info: 'bg-[#E3F2FD] text-[#1565C0]'
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
