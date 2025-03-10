export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const parseCurrencyString = (value: string): number => {
  // Remove any non-numeric characters except decimal point and minus
  const numericString = value.replace(/[^\d.-]/g, '');
  return parseFloat(numericString) || 0;
};

export const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100;
};

export interface ProfitAnalysis {
  recommendedPrice: number;
  priceChange: number;
  margin: number;
  recommendedAction: string;
}

export const calculateAverageQuantity = (
  currentQuantity: number,
  dailySalesRate: number
): number => {
  if (dailySalesRate <= 0) return currentQuantity;
  
  // Average quantity is current quantity divided by 2
  // This assumes a linear sales rate over time
  return currentQuantity / 2;
};

export const calculateTotalStorageCost = (
  currentQuantity: number,
  dailyStorageCost: number,
  dailySalesRate: number
): number => {
  if (dailySalesRate <= 0) return currentQuantity * 30 * dailyStorageCost;
  
  // Calculate days to sell all inventory
  const daysToSellAll = currentQuantity / dailySalesRate;
  
  // Calculate average quantity over the period (half of current)
  const averageQuantity = calculateAverageQuantity(currentQuantity, dailySalesRate);
  
  // Calculate total storage cost based on average quantity
  return averageQuantity * daysToSellAll * dailyStorageCost;
};

export const analyzeProfitability = (
  costPrice: number,
  currentPrice: number,
  storagePerUnit: number,
  quantity: number,
  dailySalesRate: number
): ProfitAnalysis => {
  // If no sales or cost data, return default recommendation
  if (costPrice <= 0 || currentPrice <= 0) {
    return {
      recommendedPrice: 0,
      priceChange: 0,
      margin: 0,
      recommendedAction: "Установите себестоимость для анализа прибыльности"
    };
  }

  // Calculate current profit per unit
  const currentProfit = currentPrice - costPrice - storagePerUnit;
  
  // Calculate current margin
  const currentMargin = (currentProfit / costPrice) * 100;
  
  // Target margin (minimum acceptable profit)
  const targetMargin = 15; // 15%
  
  // Calculate minimum price to achieve target margin
  const minimumProfitablePrice = costPrice * (1 + targetMargin / 100) + storagePerUnit;
  
  // Calculate price difference
  const priceDifference = Math.round(minimumProfitablePrice - currentPrice);
  
  // Determine if current price is profitable
  const isProfitable = currentMargin >= targetMargin;
  
  // Set recommended price
  const recommendedPrice = Math.max(minimumProfitablePrice, currentPrice);
  
  // Determine recommended action
  let recommendedAction = "";
  
  if (priceDifference > 0) {
    recommendedAction = `Рекомендуется повысить цену на ${formatCurrency(priceDifference)} ₽ для достижения минимальной маржи ${targetMargin}%`;
  } else if (dailySalesRate < 0.2 && quantity > 10) {
    // If slow-moving inventory with significant stock
    recommendedAction = "Товар продается медленно. Рассмотрите снижение цены для ускорения продаж и уменьшения затрат на хранение.";
  } else if (isProfitable) {
    recommendedAction = "Текущая цена обеспечивает достаточную прибыльность.";
  }
  
  return {
    recommendedPrice,
    priceChange: priceDifference,
    margin: currentMargin,
    recommendedAction
  };
};
