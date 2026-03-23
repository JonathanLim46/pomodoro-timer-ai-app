import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ progress, height = 'md', showLabel = false, className = '' }: ProgressBarProps) {
  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };
  
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between mb-2 text-sm text-[#6B7280]">
          <span>Progress</span>
          <span>{clampedProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-[#E8EDF2] rounded-full overflow-hidden ${heights[height]}`}>
        <div 
          className="h-full bg-gradient-to-r from-[#5B9BD5] to-[#4ECDC4] transition-all duration-500 ease-out rounded-full"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
