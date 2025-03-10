
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
 * Рассчитывает затраты на хранение с учетом постепенного уменьшения количества товара
 * @param quantity Начальное количество товара
 * @param dailyStorageCost Стоимость хранения единицы товара в день
 * @param averageDailySales Средняя продаж в день
 * @returns Общие затраты на хранение
 */
export const calculateStorageCosts = (
  quantity: number,
  dailyStorageCost: number,
  averageDailySales: number
): number => {
  if (quantity <= 0 || averageDailySales <= 0) return 0;
  
  // Количество дней до полной продажи
  const totalDays = Math.ceil(quantity / averageDailySales);
  
  // Рассчитываем затраты на хранение для каждого дня с учетом уменьшения количества
  let remainingQuantity = quantity;
  let totalStorageCost = 0;
  
  for (let day = 1; day <= totalDays; day++) {
    // Стоимость хранения для текущего дня
    totalStorageCost += remainingQuantity * dailyStorageCost;
    
    // Уменьшаем количество товара на складе на основе среднедневных продаж
    remainingQuantity = Math.max(0, remainingQuantity - averageDailySales);
  }
  
  return totalStorageCost;
};

/**
 * Вычисляет комиссию Wildberries и логистику для товара
 * @param price Цена товара
 * @param commissionPercent Процент комиссии WB
 * @param logisticCost Стоимость логистики за единицу
 * @returns Общая сумма комиссии и логистики
 */
export const calculateWBFeesAndLogistics = (
  price: number,
  commissionPercent: number = 15,
  logisticCost: number = 100
): number => {
  const commission = price * (commissionPercent / 100);
  return commission + logisticCost;
};

/**
 * Рассчитывает предполагаемую экономию при предоставлении скидки с учетом комиссий WB и логистики
 * @param originalPrice Исходная цена товара
 * @param discountPercent Процент скидки
 * @param quantity Количество товара
 * @param dailyStorageCost Ежедневная стоимость хранения
 * @param averageDailySales Средняя продаж в день
 * @param commissionPercent Процент комиссии WB
 * @param logisticCost Стоимость логистики
 * @returns Экономия
 */
export const calculateDiscountSavings = (
  originalPrice: number,
  discountPercent: number,
  quantity: number,
  dailyStorageCost: number,
  averageDailySales: number,
  commissionPercent: number = 15,
  logisticCost: number = 100,
  increasedSalesMultiplier = 1.5
): number => {
  if (quantity <= 0 || averageDailySales <= 0) return 0;
  
  // Стоимость хранения без скидки
  const storageCostWithoutDiscount = calculateStorageCosts(
    quantity, 
    dailyStorageCost, 
    averageDailySales
  );
  
  // Предполагаемое увеличение средней продаж в день при скидке
  const increasedAverageDailySales = averageDailySales * increasedSalesMultiplier;
  
  // Стоимость хранения со скидкой
  const storageCostWithDiscount = calculateStorageCosts(
    quantity, 
    dailyStorageCost, 
    increasedAverageDailySales
  );
  
  // Экономия на хранении
  const storageSavings = storageCostWithoutDiscount - storageCostWithDiscount;
  
  // Стоимость товара с учетом скидки
  const discountedPrice = originalPrice * (1 - discountPercent / 100);
  
  // Комиссия WB и логистика для обычной цены
  const regularFees = calculateWBFeesAndLogistics(originalPrice, commissionPercent, logisticCost);
  
  // Комиссия WB и логистика для цены со скидкой (комиссия меньше из-за меньшей цены)
  const discountedFees = calculateWBFeesAndLogistics(discountedPrice, commissionPercent, logisticCost);
  
  // Экономия на комиссии и логистике из-за более быстрой продажи
  const feeSavings = (regularFees - discountedFees) * quantity;
  
  // Потеря в выручке из-за скидки
  const revenueLoss = (originalPrice * (discountPercent / 100)) * quantity;
  
  // Итоговая экономия (может быть отрицательной, если скидка невыгодна)
  return storageSavings + feeSavings - revenueLoss;
};

/**
 * Рассчитывает оптимальный размер скидки для максимизации прибыли
 * @param originalPrice Исходная цена товара
 * @param costPrice Себестоимость товара
 * @param quantity Количество товара
 * @param dailyStorageCost Ежедневная стоимость хранения
 * @param averageDailySales Средняя продаж в день
 * @param commissionPercent Процент комиссии WB
 * @param logisticCost Стоимость логистики
 * @returns Оптимальный процент скидки
 */
export const calculateOptimalDiscount = (
  originalPrice: number,
  costPrice: number,
  quantity: number,
  dailyStorageCost: number,
  averageDailySales: number,
  commissionPercent: number = 15,
  logisticCost: number = 100
): number => {
  // Минимальная допустимая цена - должна покрывать себестоимость и часть комиссий
  const minFeesAndLogistics = calculateWBFeesAndLogistics(0, commissionPercent, logisticCost);
  const minPrice = costPrice + minFeesAndLogistics;
  
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
      averageDailySales,
      commissionPercent,
      logisticCost
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
