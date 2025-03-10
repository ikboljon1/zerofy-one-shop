
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
 * Рассчитывает предполагаемую экономию при предоставлении скидки
 * @param originalPrice Исходная цена товара
 * @param discountPercent Процент скидки
 * @param quantity Количество товара
 * @param dailyStorageCost Ежедневная стоимость хранения
 * @param salesRate Скорость продаж в день
 * @returns Экономия
 */
export const calculateDiscountSavings = (
  originalPrice: number,
  discountPercent: number,
  quantity: number,
  dailyStorageCost: number,
  salesRate: number,
  increasedSalesMultiplier = 1.5
): number => {
  if (quantity <= 0 || salesRate <= 0) return 0;
  
  // Дни до продажи всех товаров без скидки
  const daysToSellOriginal = quantity / salesRate;
  
  // Предполагаемое увеличение скорости продаж при скидке
  const increasedSalesRate = salesRate * increasedSalesMultiplier;
  
  // Дни до продажи всех товаров со скидкой
  const daysToSellDiscounted = quantity / increasedSalesRate;
  
  // Экономия на хранении
  const storageSavings = dailyStorageCost * (daysToSellOriginal - daysToSellDiscounted);
  
  // Потеря в выручке из-за скидки
  const revenueLoss = (originalPrice * (discountPercent / 100)) * quantity;
  
  // Итоговая экономия (может быть отрицательной, если скидка невыгодна)
  return storageSavings - revenueLoss;
};

/**
 * Рассчитывает оптимальный размер скидки для максимизации прибыли
 * @param originalPrice Исходная цена товара
 * @param costPrice Себестоимость товара
 * @param quantity Количество товара
 * @param dailyStorageCost Ежедневная стоимость хранения
 * @param salesRate Скорость продаж в день
 * @returns Оптимальный процент скидки
 */
export const calculateOptimalDiscount = (
  originalPrice: number,
  costPrice: number,
  quantity: number,
  dailyStorageCost: number,
  salesRate: number
): number => {
  // Минимальная допустимая цена - должна покрывать себестоимость
  const minPrice = costPrice * 1.05; // +5% к себестоимости
  
  // Максимальная допустимая скидка в процентах
  const maxDiscountPercent = Math.floor(((originalPrice - minPrice) / originalPrice) * 100);
  
  // Если максимальная скидка слишком мала или отрицательна, возвращаем 0
  if (maxDiscountPercent < 5) return 0;
  
  // Тестируем разные размеры скидки для поиска оптимальной
  let bestDiscount = 0;
  let bestSavings = 0;
  
  for (let discount = 5; discount <= maxDiscountPercent; discount += 5) {
    const savings = calculateDiscountSavings(
      originalPrice,
      discount,
      quantity,
      dailyStorageCost,
      salesRate
    );
    
    if (savings > bestSavings) {
      bestSavings = savings;
      bestDiscount = discount;
    }
  }
  
  return bestDiscount;
};

/**
 * Определяет рекомендуемое действие на основе анализа рентабельности
 * @param daysOfInventory Дни до продажи всех товаров
 * @param discountSavings Экономия при предоставлении скидки
 * @param profitWithDiscount Прибыль со скидкой
 * @param profitWithoutDiscount Прибыль без скидки
 * @returns Рекомендуемое действие ('sell', 'discount', 'keep')
 */
export const determineRecommendedAction = (
  daysOfInventory: number,
  discountSavings: number,
  profitWithDiscount: number,
  profitWithoutDiscount: number
): 'sell' | 'discount' | 'keep' => {
  // Если товар распродастся слишком долго и скидка даёт положительную экономию
  if (daysOfInventory > 60 && discountSavings > 0) {
    return 'discount';
  }
  
  // Если даже со скидкой товар приносит убыток, лучше быстро распродать
  if (profitWithDiscount < 0 && profitWithoutDiscount < 0) {
    return 'sell';
  }
  
  // Если скидка выгодна, рекомендуем её
  if (discountSavings > 0) {
    return 'discount';
  }
  
  // В остальных случаях рекомендуем сохранить текущую цену
  return 'keep';
};
