
import React from 'react';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';

interface SalesOverviewProps {
  currentValue: number;
  previousValue: number;
}

export const SalesOverview = ({ currentValue, previousValue }: SalesOverviewProps) => {
  const percentageChange = previousValue !== 0 
    ? ((currentValue - previousValue) / Math.abs(previousValue)) * 100 
    : currentValue > 0 ? 100 : 0;
  
  const isPositive = percentageChange > 0;
  const isNeutral = percentageChange === 0;

  return (
    <div className="flex items-center space-x-2">
      <div className={`flex items-center space-x-1 ${
        isPositive ? 'text-green-500' : isNeutral ? 'text-gray-500' : 'text-red-500'
      }`}>
        {!isNeutral && (
          <>
            {isPositive ? (
              <ArrowUpIcon className="h-4 w-4" />
            ) : (
              <ArrowDownIcon className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {Math.abs(percentageChange).toFixed(1)}%
            </span>
          </>
        )}
        {isNeutral && <span className="text-sm font-medium">0%</span>}
      </div>
      <span className="text-xs text-muted-foreground">
        {isPositive ? 'увеличение' : isNeutral ? 'без изменений' : 'снижение'} с прошлого периода
      </span>
    </div>
  );
};
