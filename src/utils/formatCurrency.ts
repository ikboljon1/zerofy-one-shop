
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
 * Рассчитывает среднее количество товара за период с учетом постепенного уменьшения
 * @param initialQuantity Начальное количество товара
 * @param salesRate Скорость продаж (единиц в день)
 * @param days Период расчета в днях (по умолчанию 30)
 * @returns Среднее количество товара
 */
export const calculateAverageQuantity = (initialQuantity: number, salesRate: number, days = 30): number => {
  if (initialQuantity <= 0) return 0;
  
  // Если скорость продаж очень низкая или нулевая
  if (salesRate <= 0.01) {
    return initialQuantity;
  }
  
  // Время до исчерпания запаса (в днях)
  const daysUntilZero = initialQuantity / salesRate;
  
  // Если запас закончится раньше расчетного периода
  if (daysUntilZero < days) {
    // Среднее количество при линейном уменьшении от initialQuantity до 0 за daysUntilZero дней
    return initialQuantity / 2;
  } else {
    // За период days товар уменьшится на (salesRate * days)
    const endQuantity = initialQuantity - (salesRate * days);
    // Среднее количество при линейном уменьшении от initialQuantity до endQuantity
    return (initialQuantity + endQuantity) / 2;
  }
};

/**
 * Рассчитывает общие затраты на хранение с учетом постепенного уменьшения товара
 * @param initialQuantity Начальное количество товара
 * @param dailyCostPerUnit Стоимость хранения одной единицы в день
 * @param salesRate Скорость продаж (единиц в день)
 * @param days Период расчета в днях (по умолчанию 30)
 * @returns Общие затраты на хранение
 */
export const calculateTotalStorageCost = (
  initialQuantity: number, 
  dailyCostPerUnit: number, 
  salesRate: number,
  days = 30
): number => {
  if (initialQuantity <= 0 || dailyCostPerUnit <= 0) return 0;
  
  // Если товар не продается или продается очень медленно
  if (salesRate <= 0.01) {
    return initialQuantity * dailyCostPerUnit * days; // Расчет при неизменном количестве
  }
  
  // Время до исчерпания запаса (в днях)
  const daysUntilZero = initialQuantity / salesRate;
  
  // Ограничиваем период расчета до указанного количества дней или до исчерпания запаса, если это произойдет раньше
  const daysToCalculate = Math.min(daysUntilZero, days);
  
  // Среднее количество товара за период с учетом постепенного уменьшения
  const averageQuantity = calculateAverageQuantity(initialQuantity, salesRate, days);
  
  // Общие затраты на хранение: среднее количество × стоимость хранения в день × количество дней
  return averageQuantity * dailyCostPerUnit * daysToCalculate;
};

/**
 * Рассчитывает рекомендуемую цену на основе себестоимости и затрат на хранение
 * @param costPrice Себестоимость товара
 * @param storageCost Затраты на хранение одной единицы
 * @param desiredMargin Желаемая маржа в процентах (по умолчанию 30%)
 * @returns Рекомендуемая цена
 */
export const calculateRecommendedPrice = (
  costPrice: number,
  storageCost: number,
  desiredMargin = 30
): number => {
  if (costPrice <= 0) return 0;
  
  // Общие затраты на единицу товара (себестоимость + хранение)
  const totalCost = costPrice + storageCost;
  
  // Рассчитываем цену с учетом желаемой маржи
  // Формула: Цена = Затраты / (1 - Маржа/100)
  const recommendedPrice = totalCost / (1 - desiredMargin / 100);
  
  return roundToTwoDecimals(recommendedPrice);
};

/**
 * Анализирует прибыльность товара и дает рекомендации по ценообразованию
 * @param costPrice Себестоимость товара
 * @param currentPrice Текущая цена товара
 * @param storageCost Затраты на хранение одной единицы
 * @param salesRate Скорость продаж (единиц в день)
 * @returns Объект с рекомендациями
 */
export const analyzeProfitability = (
  costPrice: number,
  currentPrice: number,
  storageCost: number,
  salesRate: number
): {
  isProfit: boolean;
  margin: number;
  recommendedPrice: number;
  priceChange: number;
  recommendation: string;
} => {
  // Если нет данных о себестоимости, не можем дать рекомендации
  if (costPrice <= 0) {
    return {
      isProfit: false,
      margin: 0,
      recommendedPrice: currentPrice,
      priceChange: 0,
      recommendation: "Укажите себестоимость товара для получения рекомендаций"
    };
  }
  
  // Общие затраты на единицу товара
  const totalCost = costPrice + storageCost;
  
  // Текущая прибыль на единицу товара
  const profit = currentPrice - totalCost;
  
  // Определяем, прибыльный ли товар
  const isProfit = profit > 0;
  
  // Рассчитываем текущую маржу
  const margin = costPrice > 0 ? (profit / costPrice) * 100 : 0;
  
  // Рассчитываем рекомендуемую цену (с желаемой маржой 30%)
  const recommendedPrice = calculateRecommendedPrice(costPrice, storageCost);
  
  // Разница между рекомендуемой и текущей ценой
  const priceChange = recommendedPrice - currentPrice;
  
  // Формируем рекомендацию
  let recommendation = "";
  
  if (!isProfit) {
    recommendation = "Товар убыточный. Рекомендуется повысить цену или сократить затраты на хранение.";
  } else if (margin < 15) {
    recommendation = "Низкая маржинальность. Рекомендуется повысить цену или ускорить продажи.";
  } else if (salesRate < 0.1 && storageCost > totalCost * 0.1) {
    recommendation = "Высокие затраты на хранение при низких продажах. Рекомендуется снизить цену для ускорения продаж.";
  } else if (priceChange > currentPrice * 0.1) {
    recommendation = "Цена ниже рекомендуемой. Возможно повышение цены без существенного влияния на спрос.";
  } else if (priceChange < -currentPrice * 0.1) {
    recommendation = "Цена выше рекомендуемой. Снижение цены может увеличить оборот.";
  } else {
    recommendation = "Текущая цена близка к оптимальной. Поддерживайте баланс цены и скорости продаж.";
  }
  
  return {
    isProfit,
    margin: roundToTwoDecimals(margin),
    recommendedPrice,
    priceChange: roundToTwoDecimals(priceChange),
    recommendation
  };
};
