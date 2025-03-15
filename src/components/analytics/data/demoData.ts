
// Минимальная структура для API-интерфейса
export const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#6366F1'];

// Пустые данные для состояния по умолчанию при превышении лимита
export const emptyAnalyticsData = {
  currentPeriod: {
    sales: 0,
    transferred: 0,
    expenses: {
      total: 0,
      logistics: 0,
      storage: 0,
      penalties: 0,
      advertising: 0,
      acceptance: 0,
      deductions: 0
    },
    netProfit: 0,
    acceptance: 0,
    returnsAmount: 0 // Add returnsAmount property with default value of 0
  },
  dailySales: [],
  productSales: [],
  productReturns: [],
  topProfitableProducts: [],
  topUnprofitableProducts: []
};

// Пустые данные для графиков
export const emptyDeductionsTimelineData = [];
export const emptyAdvertisingData = [];
export const emptyPenaltiesData = [];
export const emptyReturnsData = [];
export const emptyDeductionsData = [];

// Минимальные данные для складского API (для обратной совместимости)
export const warehousesData = [];
export const logisticsRoutes = [];
export const inventoryData = [];

/**
 * Получает средние продажи по продуктам из API Wildberries
 * @param apiKey API ключ Wildberries
 * @param dateFrom Дата начала в формате YYYY-MM-DD
 * @param dateTo Дата окончания в формате YYYY-MM-DD
 * @returns Объект с данными о средних продажах по продуктам
 */
export const fetchAverageDailySalesFromAPI = async (
  apiKey: string, 
  dateFrom: string, 
  dateTo: string
): Promise<Record<number, number>> => {
  try {
    console.log(`Запрос данных о продажах с ${dateFrom} по ${dateTo}`);
    
    const response = await fetch(
      `https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod?dateFrom=${dateFrom}&dateTo=${dateTo}&limit=100000`,
      {
        headers: {
          'Authorization': apiKey
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`API запрос вернул ошибку: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Получено ${data.length} записей о продажах`);
    
    // Группировка данных по nmId
    const salesByProduct: Record<number, { totalSales: number, uniqueDays: Set<string> }> = {};
    
    data.forEach((sale: any) => {
      if (sale.nm_id && sale.doc_type_name === "Продажа" && sale.quantity > 0) {
        const nmId = sale.nm_id;
        const saleDate = sale.sale_dt?.split('T')[0] || sale.rr_dt;
        
        if (!salesByProduct[nmId]) {
          salesByProduct[nmId] = { totalSales: 0, uniqueDays: new Set() };
        }
        
        salesByProduct[nmId].totalSales += sale.quantity;
        salesByProduct[nmId].uniqueDays.add(saleDate);
      }
    });
    
    // Расчет среднего количества продаж в день для каждого товара
    const averageSalesPerDay: Record<number, number> = {};
    
    // Расчет количества дней в периоде
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    Object.entries(salesByProduct).forEach(([nmIdStr, salesData]) => {
      const nmId = parseInt(nmIdStr);
      const uniqueDaysCount = salesData.uniqueDays.size;
      
      // Используем количество уникальных дней продаж, если оно не равно нулю
      // В противном случае используем общее количество дней в периоде
      const divisor = uniqueDaysCount > 0 ? uniqueDaysCount : daysInPeriod;
      const averageSales = salesData.totalSales / divisor;
      
      averageSalesPerDay[nmId] = parseFloat(averageSales.toFixed(2));
    });
    
    console.log('Рассчитаны средние продажи по продуктам:', Object.keys(averageSalesPerDay).length);
    
    // Отправка события для уведомления компонентов об обновлении данных
    const event = new CustomEvent('salesDataUpdated', { 
      detail: { 
        averageSalesPerDay, 
        dateFrom, 
        dateTo 
      } 
    });
    window.dispatchEvent(event);
    
    return averageSalesPerDay;
  } catch (error) {
    console.error('Ошибка при получении данных о продажах:', error);
    return {};
  }
};
