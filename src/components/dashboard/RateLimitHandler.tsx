
import React from 'react';
import LimitExceededMessage from '../analytics/components/LimitExceededMessage';

interface RateLimitHandlerProps {
  isVisible: boolean;
  onRetry: () => void;
  isRetrying: boolean;
  retryCount: number;
  nextRetryTime?: Date;
  storeName?: string;
}

const RateLimitHandler: React.FC<RateLimitHandlerProps> = ({
  isVisible,
  onRetry,
  isRetrying,
  retryCount,
  nextRetryTime,
  storeName
}) => {
  if (!isVisible) return null;
  
  const secondsUntilRetry = nextRetryTime ? 
    Math.max(0, Math.floor((nextRetryTime.getTime() - Date.now()) / 1000)) : 
    0;

  return (
    <LimitExceededMessage
      onRefresh={onRetry}
      isLoading={isRetrying}
      retryCount={retryCount}
      retryAfter={secondsUntilRetry}
      storeName={storeName}
    />
  );
};

export default RateLimitHandler;
