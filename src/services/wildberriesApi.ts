import axios from 'axios';

export interface WildberriesResponse {
  currentPeriod: {
    sales: number;
    transferred: number;
    expenses: {
      total: number;
      logistics: number;
      storage: number;
      penalties: number;
      acceptance: number;
      advertising: number;
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
  }>;
  topProfitableProducts?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
  }>;
  topUnprofitableProducts?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
  }>;
}

// Функция для форматирования даты в YYYY-MM-DD формат
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Функция для форматирования даты в RFC3339 формат (YYYY-MM-DDT00:00:00)
const formatDateRFC3339 = (date: Date, isEnd: boolean = false): string => {
  const formattedDate = date.toISOString().split('T')[0];
  return isEnd ? `${formattedDate}T23:59:59` : `${formattedDate}T00:00:00`;
};

// Функция для получения детальных данных отчета
const fetchReportDetail = async (apiKey: string, dateFrom: Date, dateTo: Date) => {
  try {
    const formattedDateFrom = formatDate(dateFrom);
    const formattedDateTo = formatDate(dateTo);
    const url = "https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod";
    
    const headers = {
      "Authorization": apiKey,
    };
    
    const params = {
      "dateFrom": formattedDateFrom,
      "dateTo": formattedDateTo,
      "rrdid": 0,
      "limit": 100000,
    };
    
    console.log("Fetching report detail from Wildberries API...");
    const response = await axios.get(url, { headers, params });
    return response.data;
  } catch (error) {
    console.error("Error fetching report detail:", error);
    return null;
  }
};

// Функция для получения данных о платной приемке
const fetchPaidAcceptanceReport = async (apiKey: string, dateFrom: Date, dateTo: Date) => {
  try {
    const formattedDateFrom = formatDate(dateFrom);
    const formattedDateTo = formatDate(dateTo);
    const url = "https://seller-analytics-api.wildberries.ru/api/v1/analytics/acceptance-report";
    
    const headers = {
      "Authorization": apiKey,
    };
    
    const params = {
      "dateFrom": formattedDateFrom,
      "dateTo": formattedDateTo,
    };
    
    console.log("Fetching paid acceptance report from Wildberries API...");
    const response = await axios.get(url, { headers, params });
    return response.data.report || [];
  } catch (error) {
    console.error("Error fetching paid acceptance report:", error);
    return [];
  }
};

// Функция для вычисления метрик на основе полученных данных
const calculateMetrics = (data: any[], paidAcceptanceData: any[] = []) => {
  if (!data || data.length === 0) {
    return null;
  }

  let totalSales = 0;          // Продажа
  let totalForPay = 0;         // К перечислению за товар
  let totalDeliveryRub = 0;    // Стоимость логистики
  let totalRebillLogisticCost = 0; // Логистика (возмещение издержек)
  let totalStorageFee = 0;     // Стоимость хранения
  let totalReturns = 0;        // Возврат
  let totalPenalty = 0;        // Штрафы
  let totalDeduction = 0;      // Удержания
  let totalToPay = 0;          // Итого к оплате
  
  // Обработка данных детального отчета - точно как в Python коде
  for (const record of data) {
    if (record.doc_type_name === 'Продажа') {
      totalSales += record.retail_price_withdisc_rub || 0;
      totalForPay += record.ppvz_for_pay || 0;
    } else if (record.doc_type_name === 'Возврат') {
      // Используем именно ppvz_for_pay для возвратов, как в Python коде
      totalReturns += record.ppvz_for_pay || 0;
    }
    
    // Учитываем расходы и доходы (для всех операций)
    totalDeliveryRub += record.delivery_rub || 0;
    totalRebillLogisticCost += record.rebill_logistic_cost || 0;
    totalStorageFee += record.storage_fee || 0;
    totalPenalty += record.penalty || 0;
    totalDeduction += record.deduction || 0;
  }
  
  // Расчет суммы платной приемки
  const totalAcceptance = paidAcceptanceData.reduce((sum, record) => sum + (record.total || 0), 0);
  
  // Рассчитываем итого к оплате (как в Python коде)
  totalToPay = totalForPay - totalDeliveryRub - totalStorageFee - totalReturns - totalPenalty - totalDeduction - totalAcceptance;
  
  // Группировка возвратов по наименованию товара и артикулу
  const returnsByProduct: Record<string, { value: number; count: number }> = {};
  for (const record of data) {
    if (record.doc_type_name === 'Возврат' && record.nm_id && record.sa_name) {
      const productName = record.sa_name;
      if (!returnsByProduct[productName]) {
        returnsByProduct[productName] = { value: 0, count: 0 };
      }
      // Используем именно ppvz_for_pay для возвратов, как в Python коде
      returnsByProduct[productName].value += Math.abs(record.ppvz_for_pay || 0);
      returnsByProduct[productName].count += 1; // Увеличиваем счетчик возвратов
    }
  }
  
  // Преобразование в массив и сортировка
  const productReturns = Object.entries(returnsByProduct)
    .map(([name, { value, count }]) => ({ name, value, count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  
  // Группировка продаж по дням
  const salesByDay: Record<string, { sales: number, previousSales: number }> = {};
  for (const record of data) {
    if (record.doc_type_name === 'Продажа' && record.rr_dt) {
      const date = record.rr_dt.split('T')[0];
      if (!salesByDay[date]) {
        salesByDay[date] = { sales: 0, previousSales: 0 };
      }
      salesByDay[date].sales += record.retail_price_withdisc_rub || 0;
    }
  }
  
  // Преобразование в массив и сортировка по датам
  const dailySales = Object.entries(salesByDay)
    .map(([date, { sales, previousSales }]) => ({ date, sales, previousSales }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Подсчитываем общее количество возвратов
  const totalReturnCount = productReturns.reduce((sum, item) => sum + (item.count || 0), 0);
  
  console.log(`Received and processed data from Wildberries API. Total returns: ${totalReturns}, Returned items count: ${totalReturnCount}, Returned products count: ${productReturns.length}`);
  
  return {
    metrics: {
      total_sales: Math.round(totalSales * 100) / 100,
      total_for_pay: Math.round(totalForPay * 100) / 100,
      total_delivery_rub: Math.round(totalDeliveryRub * 100) / 100,
      total_rebill_logistic_cost: Math.round(totalRebillLogisticCost * 100) / 100,
      total_storage_fee: Math.round(totalStorageFee * 100) / 100,
      total_returns: Math.round(totalReturns * 100) / 100,
      total_penalty: Math.round(totalPenalty * 100) / 100,
      total_deduction: Math.round(totalDeduction * 100) / 100,
      total_to_pay: Math.round(totalToPay * 100) / 100,
      total_acceptance: Math.round(totalAcceptance * 100) / 100
    },
    productReturns,
    dailySales
  };
};

// Функция для получения статистики Wildberries
export const fetchWildberriesStats = async (apiKey: string, dateFrom: Date, dateTo: Date) => {
  try {
    console.log(`Fetching Wildberries stats from ${dateFrom.toISOString()} to ${dateTo.toISOString()}`);
    
    // В режиме разработки используем дем��-данные
    if (process.env.NODE_ENV === 'development' && !apiKey.startsWith('eyJ')) {
      console.log('Using demo data in development mode');
      return getDemoData();
    }
    
    // Получаем детальные данные отчета
    const reportData = await fetchReportDetail(apiKey, dateFrom, dateTo);
    
    // Получаем данные о платной приемке
    const paidAcceptanceData = await fetchPaidAcceptanceReport(apiKey, dateFrom, dateTo);
    
    if (!reportData || reportData.length === 0) {
      console.log('No data received from Wildberries API, using demo data');
      return getDemoData();
    }
    
    // Вычисляем метрики на основе полученных данных
    const result = calculateMetrics(reportData, paidAcceptanceData);
    
    if (!result || !result.metrics) {
      console.log('Failed to calculate metrics, using demo data');
      return getDemoData();
    }
    
    const { metrics, productReturns } = result;
    
    // Группировка продаж по категориям
    const salesByCategory: Record<string, number> = {};
    for (const record of reportData) {
      if (record.doc_type_name === 'Продажа' && record.subject_name) {
        if (!salesByCategory[record.subject_name]) {
          salesByCategory[record.subject_name] = 0;
        }
        salesByCategory[record.subject_name]++;
      }
    }
    
    // Преобразование в массив и сортировка
    const productSales = Object.entries(salesByCategory)
      .map(([subject_name, quantity]) => ({ subject_name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
    
    // Группировка продаж по дням
    const salesByDay: Record<string, { sales: number, previousSales: number }> = {};
    for (const record of reportData) {
      if (record.doc_type_name === 'Продажа' && record.rr_dt) {
        const date = record.rr_dt.split('T')[0];
        if (!salesByDay[date]) {
          salesByDay[date] = { sales: 0, previousSales: 0 };
        }
        salesByDay[date].sales += record.retail_price_withdisc_rub || 0;
      }
    }
    
    // Преобразование в массив и сортировка по датам
    const dailySales = Object.entries(salesByDay)
      .map(([date, { sales, previousSales }]) => ({ date, sales, previousSales }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Формируем ответ в нужном формате
    const response: WildberriesResponse = {
      currentPeriod: {
        sales: metrics.total_sales,
        transferred: metrics.total_to_pay,
        expenses: {
          total: metrics.total_delivery_rub + metrics.total_storage_fee + metrics.total_penalty + metrics.total_acceptance,
          logistics: metrics.total_delivery_rub,
          storage: metrics.total_storage_fee,
          penalties: metrics.total_penalty,
          acceptance: metrics.total_acceptance,
          advertising: 0 // Реклама не включена в API отчет, будет добавлена отдельно
        },
        netProfit: metrics.total_to_pay,
        acceptance: metrics.total_acceptance
      },
      dailySales,
      productSales,
      productReturns,
      topProfitableProducts: [],
      topUnprofitableProducts: []
    };
    
    console.log(`Received and processed data from Wildberries API. Total returns: ${metrics.total_returns}, Returned items count: ${productReturns.length}`);
    
    return response;
  } catch (error) {
    console.error("Error fetching Wildberries stats:", error);
    return getDemoData();
  }
};

// Функция для получения демо-данных
const getDemoData = (): WildberriesResponse => {
  return {
    currentPeriod: {
      sales: 294290.6,
      transferred: 218227.70,
      expenses: {
        total: 58794.94,
        logistics: 35669.16,
        storage: 23125.78,
        penalties: 0,
        acceptance: 0,
        advertising: 0
      },
      netProfit: 147037.23,
      acceptance: 0
    },
    dailySales: [
      {
        date: "2025-02-26",
        sales: 36652.93,
        previousSales: 0
      },
      {
        date: "2025-02-27",
        sales: 79814.5,
        previousSales: 0
      },
      {
        date: "2025-02-28",
        sales: 37899.90,
        previousSales: 0
      },
      {
        date: "2025-03-01",
        sales: 62596.15,
        previousSales: 0
      },
      {
        date: "2025-03-02",
        sales: 77327.11,
        previousSales: 0
      }
    ],
    productSales: [
      { subject_name: "Костюмы", quantity: 48 },
      { subject_name: "Платья", quantity: 6 },
      { subject_name: "Свитшоты", quantity: 4 },
      { subject_name: "Лонгсливы", quantity: 3 },
      { subject_name: "Костюмы спортивные", quantity: 1 }
    ],
    productReturns: [
      { name: "Костюм женский спортивный", value: 12000 },
      { name: "Платье летнее", value: 8500 },
      { name: "Футболка мужская", value: 6300 },
      { name: "Джинсы классические", value: 4200 },
      { name: "Куртка зимняя", value: 3000 }
    ],
    topProfitableProducts: [
      { name: "Загрузка...", price: "0", profit: "+0", image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg" }
    ],
    topUnprofitableProducts: [
      { name: "Загрузка...", price: "0", profit: "0", image: "https://storage.googleapis.com/a1aa/image/OVMl1GnzKz6bgDAEJKScyzvR2diNKk-j6FoazEY-XRI.jpg" }
    ]
  };
};
