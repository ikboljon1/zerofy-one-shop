
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
  if (initialQuantity <= 0 || salesRate <= 0) return 0;
  
  // Если скорость продаж очень низкая, считаем что среднее количество примерно равно текущему
  if (salesRate < 0.01) return initialQuantity;
  
  // Время до исчерпания запаса (в днях)
  const daysUntilZero = initialQuantity / salesRate;
  
  // Среднее количество за период (начальное количество + 0) / 2
  return initialQuantity / 2;
};

/**
 * Рассчитывает общие затраты на хранение с учетом среднего количества
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
  
  // Если скорость продаж почти нулевая, то берем обычную формулу
  if (salesRate < 0.01) {
    return initialQuantity * dailyCostPerUnit * 30; // Расчет за 30 дней
  }
  
  // Среднее количество товара за период
  const averageQuantity = calculateAverageQuantity(initialQuantity, salesRate);
  
  // Время до исчерпания запаса (в днях)
  const daysUntilZero = initialQuantity / salesRate;
  
  // Если товар закончится быстрее чем за 30 дней
  const daysToCalculate = Math.min(daysUntilZero, 30);
  
  // Общие затраты на хранение
  return averageQuantity * dailyCostPerUnit * daysToCalculate;
};
