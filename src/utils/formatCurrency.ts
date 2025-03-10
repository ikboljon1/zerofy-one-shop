

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
 * @returns Среднее количество товара
 */
export const calculateAverageQuantity = (initialQuantity: number, salesRate: number): number => {
  if (initialQuantity <= 0) return 0;
  
  // Если скорость продаж очень низкая или нулевая
  if (salesRate <= 0.01) {
    return initialQuantity;
  }
  
  // Время до исчерпания запаса (в днях)
  const daysUntilZero = initialQuantity / salesRate;
  
  // Среднее количество за период: (начальное количество + 0) / 2
  // Это отражает линейное уменьшение количества от initialQuantity до 0
  return initialQuantity / 2;
};

/**
 * Рассчитывает общие затраты на хранение с учетом постепенного уменьшения товара
 * @param initialQuantity Начальное количество товара
 * @param dailyCostPerUnit Стоимость хранения одной единицы в день
 * @param salesRate Скорость продаж (единиц в день)
 * @returns Общие затраты на хранение
 */
export const calculateTotalStorageCost = (
  initialQuantity: number, 
  dailyCostPerUnit: number, 
  salesRate: number
): number => {
  if (initialQuantity <= 0 || dailyCostPerUnit <= 0) return 0;
  
  // Если товар не продается или продается очень медленно
  if (salesRate <= 0.01) {
    return initialQuantity * dailyCostPerUnit * 30; // Расчет за 30 дней при неизменном количестве
  }
  
  // Время до исчерпания запаса (в днях)
  const daysUntilZero = initialQuantity / salesRate;
  
  // Ограничиваем период расчета до 30 дней или до исчерпания запаса, если это произойдет раньше
  const daysToCalculate = Math.min(daysUntilZero, 30);
  
  // Среднее количество товара за период с учетом постепенного уменьшения
  const averageQuantity = calculateAverageQuantity(initialQuantity, salesRate);
  
  // Общие затраты на хранение: среднее количество × стоимость хранения в день × количество дней
  return averageQuantity * dailyCostPerUnit * daysToCalculate;
};

