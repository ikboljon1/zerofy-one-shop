/**
 * Форматирует число как валюту (без символа рубля)
 * @param value Число для форматирования
 * @returns Отформатированная строка
 */
export const formatCurrency = (value: number): string => {
  if (isNaN(value)) return "0,00";
  
  return new Intl.NumberFormat('ru-RU', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Преобразует строку с ценой в число
 * @param value Строка с ценой
 * @returns Число
 */
export const parseCurrencyString = (value: string): number => {
  if (!value) return 0;
  const numericValue = value.replace(/[^\d.-]/g, '');
  return parseFloat(numericValue) || 0;
};

/**
 * Округляет число до двух знаков после запятой
 * @param value Число для округления
 * @returns Округленное число
 */
export const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100;
};

/**
 * Рассчитывает среднее количество товара за период с учетом дней до полной продажи
 * @param initialQuantity Начальное количество товара
 * @param salesRate Продаж в день (единиц в день)
 * @param days Период расчета в днях
 * @returns Среднее количество товара
 */
export const calculateAverageQuantity = (initialQuantity: number, salesRate: number, days = 28): number => {
  if (initialQuantity <= 0 || salesRate <= 0) return initialQuantity;
  
  // Дни до полной продажи
  const daysUntilSoldOut = initialQuantity / salesRate;
  
  // Если товар продастся раньше расчетного периода
  if (daysUntilSoldOut < days) {
    // Среднее количество за период продажи
    return initialQuantity / 2;
  }
  
  // Если товар не успеет продаться за расчетный период
  const endQuantity = initialQuantity - (salesRate * days);
  return (initialQuantity + endQuantity) / 2;
};

/**
 * Рассчитывает затраты на хранение с учетом постепенного уменьшения количества
 * @param initialQuantity Начальное количество
 * @param dailyCostPerUnit Стоимость хранения единицы в день
 * @param salesRate Продаж в день
 * @param days Период в днях
 * @returns Общие затраты на хранение
 */
export const calculateTotalStorageCost = (
  initialQuantity: number,
  dailyCostPerUnit: number,
  salesRate: number,
  days = 28
): number => {
  if (initialQuantity <= 0 || dailyCostPerUnit <= 0) return 0;
  
  // Дни до полной продажи
  const daysUntilSoldOut = salesRate > 0 ? initialQuantity / salesRate : days;
  
  // Используем фактический период (минимум из дней до продажи и расчетного периода)
  const actualDays = Math.min(daysUntilSoldOut, days);
  
  // Среднее количество за период
  const avgQuantity = calculateAverageQuantity(initialQuantity, salesRate, actualDays);
  
  // Общие затраты на хранение
  return avgQuantity * dailyCostPerUnit * actualDays;
};

interface ProfitAnalysis {
  withoutDiscount: {
    daysToSell: number;
    storageCost: number;
    totalProfit: number;
    roi: number;
  };
  withDiscount: {
    daysToSell: number;
    storageCost: number;
    totalProfit: number;
    roi: number;
    expectedSalesIncrease: number;
  };
  recommendedAction: string;
  recommendedPrice: number;
}

/**
 * Анализирует прибыльность товара с учетом затрат на хранение
 */
export const analyzeProfitability = (
  costPrice: number,
  currentPrice: number,
  storageCost: number,
  quantity: number,
  salesRate: number,
  discountPercent = 20
): ProfitAnalysis => {
  if (costPrice <= 0 || quantity <= 0) {
    return {
      withoutDiscount: { daysToSell: 0, storageCost: 0, totalProfit: 0, roi: 0 },
      withDiscount: { 
        daysToSell: 0, 
        storageCost: 0, 
        totalProfit: 0, 
        roi: 0,
        expectedSalesIncrease: 0 
      },
      recommendedAction: "Укажите корректную себестоимость и количество",
      recommendedPrice: currentPrice
    };
  }

  // Расчет без скидки
  const daysToSellNoDiscount = salesRate > 0 ? quantity / salesRate : 28;
  const storageCostNoDiscount = calculateTotalStorageCost(
    quantity,
    storageCost,
    salesRate
  );
  const totalProfitNoDiscount = (currentPrice - costPrice) * quantity - storageCostNoDiscount;
  const roiNoDiscount = (totalProfitNoDiscount / (costPrice * quantity)) * 100;

  // Расчет со скидкой
  const discountedPrice = currentPrice * (1 - discountPercent / 100);
  const expectedSalesIncrease = 1.5; // Ожидаемое увеличение продаж при скидке
  const discountedSalesRate = salesRate * expectedSalesIncrease;
  const daysToSellDiscount = discountedSalesRate > 0 ? quantity / discountedSalesRate : 28;
  
  const storageCostWithDiscount = calculateTotalStorageCost(
    quantity,
    storageCost,
    discountedSalesRate
  );
  
  const totalProfitWithDiscount = (discountedPrice - costPrice) * quantity - storageCostWithDiscount;
  const roiWithDiscount = (totalProfitWithDiscount / (costPrice * quantity)) * 100;

  // Сравнение и рекомендации
  let recommendedAction = "";
  let recommendedPrice = currentPrice;

  const profitDifference = totalProfitWithDiscount - totalProfitNoDiscount;
  const storageSavings = storageCostNoDiscount - storageCostWithDiscount;
  const revenueLoss = quantity * (currentPrice - discountedPrice);

  if (currentPrice <= costPrice) {
    recommendedAction = `Срочно повысить цену! Текущая цена ниже себестоимости на ${formatCurrency(costPrice - currentPrice)} ₽`;
    recommendedPrice = costPrice * 1.2; // Минимальная маржа 20%
  } else if (totalProfitNoDiscount < 0) {
    if (storageCostNoDiscount > quantity * (currentPrice - costPrice) * 0.3) {
      recommendedAction = "Срочно снизить остатки! Затраты на хранение превышают 30% от возможной прибыли";
      recommendedPrice = discountedPrice;
    } else {
      recommendedAction = `Текущая цена убыточна. Рекомендуется повысить до ${formatCurrency(costPrice * 1.3)} ₽`;
      recommendedPrice = costPrice * 1.3;
    }
  } else if (storageSavings > revenueLoss) {
    recommendedAction = "Рекомендуется снизить цену. Экономия на хранении превысит потери от скидки";
    recommendedPrice = discountedPrice;
  } else if (roiWithDiscount > roiNoDiscount) {
    recommendedAction = "Рекомендуется применить скидку для ускорения продаж";
    recommendedPrice = discountedPrice;
  } else {
    recommendedAction = "Сохранить текущую цену";
    recommendedPrice = currentPrice;
  }

  return {
    withoutDiscount: {
      daysToSell: daysToSellNoDiscount,
      storageCost: storageCostNoDiscount,
      totalProfit: totalProfitNoDiscount,
      roi: roiNoDiscount
    },
    withDiscount: {
      daysToSell: daysToSellDiscount,
      storageCost: storageCostWithDiscount,
      totalProfit: totalProfitWithDiscount,
      roi: roiWithDiscount,
      expectedSalesIncrease
    },
    recommendedAction,
    recommendedPrice
  };
};

/**
 * Рассчитывает рекомендуемую цену на основе анализа прибыльности
 */
export const calculateRecommendedPrice = (
  costPrice: number,
  currentPrice: number,
  storageCost: number,
  quantity: number,
  salesRate: number
): number => {
  const analysis = analyzeProfitability(
    costPrice,
    currentPrice,
    storageCost,
    quantity,
    salesRate
  );
  
  return analysis.recommendedPrice;
};
