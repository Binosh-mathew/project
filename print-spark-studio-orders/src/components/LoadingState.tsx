import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  children,
  className,
  loadingText = 'Loading...'
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={cn('flex flex-col items-center justify-center p-4', className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-2 text-sm text-muted-foreground">{loadingText}</p>
    </div>
  );
};

export const LoadingSpinner: React.FC = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export default LoadingState; 