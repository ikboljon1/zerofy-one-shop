
import React from 'react';

interface AdvertisingBreakdown {
  search: number;
}

interface AnalyticsData {
  currentPeriod: {
    sales: number;
    transferred: number;
    expenses: {
      total: number;
      logistics: number;
      storage: number;
      penalties: number;
      advertising: number;
      acceptance: number;
      deductions?: number;
    };
    netProfit: number;
    acceptance: number;
  };
  dailySales: Array<{
    date: string;
    sales: number;
    previousSales: number;
  }>;
  productSales: Array<{
    subject_name: string;
    quantity: number;
  }>;
  productReturns: Array<{
    name: string;
    value: number;
    count?: number;
  }>;
  topProfitableProducts?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
    quantitySold?: number;
    margin?: number;
    returnCount?: number;
    category?: string;
  }>;
  topUnprofitableProducts?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
    quantitySold?: number;
    margin?: number;
    returnCount?: number;
    category?: string;
  }>;
}

interface AdvertisingOptimizationProps {
  data: AnalyticsData;
  advertisingBreakdown: AdvertisingBreakdown;
  isLoading: boolean;
}

const AdvertisingOptimizationWithProps = ({ data, advertisingBreakdown, isLoading }: AdvertisingOptimizationProps) => {
  // Since our AdvertisingOptimization component is static and doesn't use data props,
  // we'll just import and render the component
  
  // We're only creating this wrapper to define the prop types correctly
  // In the future, we could pass props to customize the component
  
  // Import the actual component dynamically to avoid circular dependencies
  const AdvertisingOptimization = React.lazy(() => import('./AdvertisingOptimization'));
  
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <AdvertisingOptimization />
    </React.Suspense>
  );
};

export default AdvertisingOptimizationWithProps;
