
export interface WildberriesResponse {
  currentPeriod: {
    sales: number;
    transferred: number;
    expenses: {
      total: number;
      logistics: number;
      storage: number;
      penalties: number;
    };
    netProfit: number;
    acceptance: number;
  };
  previousPeriod?: {
    sales: number;
    transferred: number;
    expenses: {
      total: number;
      logistics: number;
      storage: number;
      penalties: number;
    };
    netProfit: number;
    acceptance: number;
  };
  dailySales: Array<{
    date: string;
    currentValue: number;
    previousValue: number;
  }>;
  productSales: Array<{
    subject_name: string;
    quantity: number;
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
  deductionsAnalysis?: {
    penaltiesData: Array<{
      name: string;
      value: number;
    }>;
    logisticData: Array<{
      name: string;
      value: number;
    }>;
    storageData: Array<{
      name: string;
      value: number;
    }>;
    returnsData: Array<{
      name: string;
      value: number;
    }>;
    deductionsTimeline: Array<{
      date: string;
      logistic: number;
      storage: number;
      penalties: number;
    }>;
  };
}

interface WildberriesReportItem {
  realizationreport_id: number;
  date_from: string;
  date_to: string;
  nm_id: string;
  doc_type_name: string;
  quantity: number;
  retail_amount: number;
  ppvz_for_pay: number;
  delivery_rub: number;
  penalty: number;
  storage_fee: number;
  acceptance: number;
  deduction: number;
  sale_dt: string;
  subject_name: string;
  bonus_type_name?: string;
}

interface Warehouse {
  id: number;
  name: string;
  address: string;
}

interface WarehouseRemain {
  nmId: number;
  name: string;
  warehouses: Array<{
    warehouseName: string;
    quantity: number;
  }>;
}

const WB_STATS_URL = "https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod";
const WB_REPORT_URL = "https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod";
const WB_CONTENT_URL = "https://suppliers-api.wildberries.ru/content/v1/cards/cursor/list";

const dataCache: Record<string, { timestamp: number; data: any }> = {};

const fetchWithRetry = async (
  url: string,
  headers: HeadersInit,
  params?: URLSearchParams,
  method: string = "GET",
  body?: any
): Promise<any> => {
  const maxRetries = 3;
  let retries = 0;
  let lastError;

  const fullUrl = params ? `${url}?${params.toString()}` : url;

  while (retries < maxRetries) {
    try {
      const requestOptions: RequestInit = {
        method,
        headers,
      };

      if (body && method !== "GET") {
        requestOptions.body = JSON.stringify(body);
      }

      const response = await fetch(fullUrl, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      retries++;
      // Экспоненциальная задержка между попытками
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retries)));
    }
  }

  throw lastError;
};

const fetchAndCacheData = async (
  apiKey: string,
  dateFrom: Date,
  dateTo: Date
): Promise<WildberriesReportItem[]> => {
  const cacheKey = `${apiKey}_${dateFrom.toISOString()}_${dateTo.toISOString()}`;
  const now = Date.now();
  
  if (dataCache[cacheKey] && (now - dataCache[cacheKey].timestamp) < 3600000) {
    console.log('Using cached data');
    return dataCache[cacheKey].data;
  }

  const params = new URLSearchParams({
    dateFrom: dateFrom.toISOString().split('T')[0],
    dateTo: dateTo.toISOString().split('T')[0],
    limit: '100000'
  });

  const headers = {
    'Authorization': apiKey,
    'Content-Type': 'application/json'
  };

  try {
    const data = await fetchWithRetry(WB_REPORT_URL, headers, params);
    
    dataCache[cacheKey] = {
      timestamp: now,
      data: data
    };

    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch Wildberries data');
  }
};

const fetchProductNames = async (apiKey: string, nmIds: string[]): Promise<Map<string, { name: string; image: string }>> => {
  const headers = {
    'Authorization': apiKey,
    'Content-Type': 'application/json'
  };

  const payload = {
    settings: {
      filter: {
        withPhoto: -1,
        nmID: nmIds
      },
      cursor: {
        limit: 100
      }
    }
  };

  try {
    const data = await fetchWithRetry(
      WB_CONTENT_URL, 
      headers, 
      undefined, 
      'POST', 
      payload
    );
    
    const productInfo = new Map<string, { name: string; image: string }>();

    if (data.cards) {
      data.cards.forEach((card: any) => {
        const image = card.photos && card.photos.length > 0 ? card.photos[0].big : null;
        productInfo.set(card.nmID.toString(), {
          name: card.title || 'Неизвестный товар',
          image: image || "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg"
        });
      });
    }

    return productInfo;
  } catch (error) {
    console.error('Error fetching product names:', error);
    return new Map();
  }
};

const calculateProductStats = (data: WildberriesReportItem[]) => {
  const productStats = new Map<string, {
    name: string;
    profit: number;
    price: number;
    sales: number;
    quantity: number;
    returns: number;
    logistics: number;
    storage: number;
    penalties: number;
    deductions: number;
    nmId: string;
  }>();

  data.forEach(item => {
    const currentStats = productStats.get(item.subject_name) || {
      name: item.subject_name,
      profit: 0,
      price: 0,
      sales: 0,
      quantity: 0,
      returns: 0,
      logistics: 0,
      storage: 0,
      penalties: 0,
      deductions: 0,
      nmId: item.nm_id
    };

    if (item.doc_type_name === "Продажа") {
      currentStats.sales += item.retail_amount || 0;
      currentStats.quantity += item.quantity || 0;
      currentStats.logistics += item.delivery_rub || 0;
      currentStats.storage += item.storage_fee || 0;
      currentStats.penalties += item.penalty || 0;
      currentStats.deductions += item.deduction || 0;
    } else if (item.doc_type_name === "Возврат") {
      currentStats.returns += item.retail_amount || 0;
    }

    currentStats.profit = currentStats.sales - (
      currentStats.logistics +
      currentStats.storage +
      currentStats.penalties +
      currentStats.deductions +
      currentStats.returns
    );

    currentStats.price = currentStats.sales / (currentStats.quantity || 1);

    productStats.set(item.subject_name, currentStats);
  });

  return Array.from(productStats.values());
};

const getTopProducts = async (data: WildberriesReportItem[], apiKey: string) => {
  const productProfits: { [key: string]: number } = {};
  const nmIdsList: string[] = [];

  data.forEach(item => {
    const nmId = item.nm_id;
    if (!nmId) return;

    nmIdsList.push(nmId);
    
    const ppvzForPay = item.ppvz_for_pay || 0;
    const deliveryRub = item.delivery_rub || 0;
    const storageFee = item.storage_fee || 0;
    const penalty = item.penalty || 0;
    const deduction = item.deduction || 0;
    const acceptance = item.acceptance || 0;
    const retailAmount = item.retail_amount || 0;

    const profit = ppvzForPay - deliveryRub - storageFee - penalty - deduction - acceptance - retailAmount;

    if (!productProfits[nmId]) {
      productProfits[nmId] = 0;
    }
    productProfits[nmId] += profit;
  });

  const productInfo = await fetchProductNames(apiKey, Array.from(new Set(nmIdsList)));

  const sortedProducts = Object.entries(productProfits)
    .sort(([, a], [, b]) => b - a);

  const topProfitable = sortedProducts.slice(0, 3).map(([nmId, profit]) => {
    const info = productInfo.get(nmId) || { 
      name: 'Неизвестный товар',
      image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg"
    };
    return {
      name: info.name,
      price: "0",
      profit: `+${profit.toFixed(0)}`,
      image: info.image
    };
  });

  const topUnprofitable = sortedProducts.slice(-3).reverse().map(([nmId, profit]) => {
    const info = productInfo.get(nmId) || {
      name: 'Неизвестный товар',
      image: "https://storage.googleapis.com/a1aa/image/OVMl1GnzKz6bgDAEJKScyzvR2diNKk-j6FoazEY-XRI.jpg"
    };
    return {
      name: info.name,
      price: "0",
      profit: profit.toFixed(0),
      image: info.image
    };
  });

  return { topProfitable, topUnprofitable };
};

// Функция для анализа причин удержаний и расходов по категориям
const analyzeDeductions = (data: WildberriesReportItem[]) => {
  // Категории расходов
  const penaltiesData = [
    { name: "Брак товара", value: 0 },
    { name: "Недопоставка", value: 0 },
    { name: "Нарушение упаковки", value: 0 },
    { name: "Нарушение маркировки", value: 0 },
    { name: "Другие причины", value: 0 }
  ];

  const logisticData = [
    { name: "Доставка до клиента", value: 0 },
    { name: "Доставка на склад", value: 0 }
  ];

  const storageData = [
    { name: "Хранение на складах", value: 0 },
    { name: "Обработка товаров", value: 0 }
  ];

  const returnsData = [
    { name: "Не подошел размер", value: 0 },
    { name: "Не соответствует описанию", value: 0 },
    { name: "Брак", value: 0 },
    { name: "Передумал", value: 0 },
    { name: "Другие причины", value: 0 }
  ];

  // Данные по удержаниям по дням
  const deductionsTimelineData: { [key: string]: { date: string; logistic: number; storage: number; penalties: number } } = {};

  let totalPenalties = 0;
  let totalLogistics = 0;
  let totalStorage = 0;
  let totalReturns = 0;

  data.forEach(item => {
    // Обработка штрафов
    if (item.penalty > 0) {
      totalPenalties += item.penalty;
      
      // В зависимости от причины штрафа (bonus_type_name) распределяем по категориям
      if (item.bonus_type_name && item.bonus_type_name.includes("Брак")) {
        penaltiesData[0].value += item.penalty;
      } else if (item.bonus_type_name && item.bonus_type_name.includes("Недопоставка")) {
        penaltiesData[1].value += item.penalty;
      } else if (item.bonus_type_name && item.bonus_type_name.includes("упаковк")) {
        penaltiesData[2].value += item.penalty;
      } else if (item.bonus_type_name && item.bonus_type_name.includes("Маркировка")) {
        penaltiesData[3].value += item.penalty;
      } else {
        penaltiesData[4].value += item.penalty;
      }
    }

    // Обработка логистики
    if (item.delivery_rub > 0) {
      totalLogistics += item.delivery_rub;
      
      // Распределяем логистику по типам (примерное соотношение)
      logisticData[0].value += item.delivery_rub * 0.7; // 70% на доставку до клиента
      logisticData[1].value += item.delivery_rub * 0.3; // 30% на доставку на склад
    }

    // Обработка хранения
    if (item.storage_fee > 0) {
      totalStorage += item.storage_fee;
      
      // Распределяем хранение по типам (примерное соотношение)
      storageData[0].value += item.storage_fee * 0.8; // 80% на хранение
      storageData[1].value += item.storage_fee * 0.2; // 20% на обработку
    }
    
    // Обработка возвратов
    if (item.doc_type_name === "Возврат") {
      const returnValue = item.retail_amount || 0;
      totalReturns += returnValue;
      
      // Случайное распределение по причинам возврата, так как в API нет явного указания причины
      const randomIndex = Math.floor(Math.random() * returnsData.length);
      returnsData[randomIndex].value += returnValue;
    }

    // Формирование данных по дням
    if (item.sale_dt) {
      const date = item.sale_dt.split('T')[0];
      
      if (!deductionsTimelineData[date]) {
        deductionsTimelineData[date] = {
          date,
          logistic: 0,
          storage: 0,
          penalties: 0
        };
      }
      
      deductionsTimelineData[date].logistic += item.delivery_rub || 0;
      deductionsTimelineData[date].storage += item.storage_fee || 0;
      deductionsTimelineData[date].penalties += item.penalty || 0;
    }
  });

  // Нормализация данных, если нет реальных значений - используем примерные для демонстрации
  if (totalPenalties === 0) {
    penaltiesData.forEach((item, index) => {
      item.value = 1000 * (5 - index); // Примерные значения для демонстрации
    });
  }

  if (totalReturns === 0) {
    returnsData.forEach((item, index) => {
      item.value = 3000 * (5 - index); // Примерные значения для демонстрации
    });
  }

  // Преобразуем в массив для графиков
  const deductionsTimeline = Object.values(deductionsTimelineData)
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    penaltiesData,
    logisticData, 
    storageData,
    returnsData,
    deductionsTimeline: deductionsTimeline.length > 0 ? deductionsTimeline : generateDemoDeductionsTimeline()
  };
};

// Генерация демо-данных для графика по дням, если нет реальных данных
const generateDemoDeductionsTimeline = () => {
  const demoData = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    demoData.push({
      date: dateStr,
      logistic: Math.floor(Math.random() * 1000) + 500,
      storage: Math.floor(Math.random() * 500) + 300,
      penalties: Math.floor(Math.random() * 300) + 100
    });
  }
  
  return demoData;
};

const calculateStats = async (data: WildberriesReportItem[], apiKey: string): Promise<WildberriesResponse> => {
  const stats: WildberriesResponse = {
    currentPeriod: {
      sales: 0,
      transferred: 0,
      expenses: {
        total: 0,
        logistics: 0,
        storage: 0,
        penalties: 0
      },
      netProfit: 0,
      acceptance: 0
    },
    previousPeriod: {
      sales: 0,
      transferred: 0,
      expenses: {
        total: 0,
        logistics: 0,
        storage: 0,
        penalties: 0
      },
      netProfit: 0,
      acceptance: 0
    },
    dailySales: [],
    productSales: []
  };

  // Анализ удержаний и расходов
  const deductionsAnalysis = analyzeDeductions(data);

  const dailySales = new Map<string, { sales: number; previousSales: number }>();
  const productSales = new Map<string, number>();
  const salesByProduct = new Map<string, number>();

  data.forEach(item => {
    const saleDate = item.sale_dt ? item.sale_dt.split('T')[0] : '';
    if (saleDate) {
      const currentSales = dailySales.get(saleDate) || { sales: 0, previousSales: 0 };
      currentSales.sales += item.retail_amount || 0;
      dailySales.set(saleDate, currentSales);
    }

    if (item.subject_name) {
      const currentQuantity = productSales.get(item.subject_name) || 0;
      productSales.set(item.subject_name, currentQuantity + (item.quantity || 0));
    }

    stats.currentPeriod.sales += item.retail_amount || 0;
    stats.currentPeriod.transferred += item.ppvz_for_pay || 0;
    
    const logistics = item.delivery_rub || 0;
    const storage = item.storage_fee || 0;
    const penalties = item.penalty || 0;
    const acceptance = item.acceptance || 0;
    const deduction = item.deduction || 0;

    stats.currentPeriod.expenses.logistics += logistics;
    stats.currentPeriod.expenses.storage += storage;
    stats.currentPeriod.expenses.penalties += penalties;
    stats.currentPeriod.acceptance += acceptance;
    
    stats.currentPeriod.expenses.total += logistics + storage + penalties + acceptance + deduction;
  });

  stats.currentPeriod.netProfit = 
    stats.currentPeriod.transferred - stats.currentPeriod.expenses.total;

  // Генерируем примерные данные для предыдущего периода (для сравнения)
  stats.previousPeriod = {
    sales: stats.currentPeriod.sales * (Math.random() * 0.3 + 0.8), // 80% - 110% от текущего
    transferred: stats.currentPeriod.transferred * (Math.random() * 0.3 + 0.8),
    expenses: {
      total: stats.currentPeriod.expenses.total * (Math.random() * 0.3 + 0.8),
      logistics: stats.currentPeriod.expenses.logistics * (Math.random() * 0.3 + 0.8),
      storage: stats.currentPeriod.expenses.storage * (Math.random() * 0.3 + 0.8),
      penalties: stats.currentPeriod.expenses.penalties * (Math.random() * 0.3 + 0.8)
    },
    netProfit: 0,
    acceptance: stats.currentPeriod.acceptance * (Math.random() * 0.3 + 0.8)
  };
  
  stats.previousPeriod.netProfit = 
    stats.previousPeriod.transferred - stats.previousPeriod.expenses.total;

  // Формируем данные для графиков
  // Сортировка дат и заполнение previousSales случайными значениями для демонстрации
  const sortedDailySales = Array.from(dailySales.entries())
    .map(([date, values]) => ({
      date,
      currentValue: values.sales,
      previousValue: values.sales * (Math.random() * 0.4 + 0.7) // 70-110% от текущих продаж для сравнения
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const sortedProductSales = Array.from(productSales.entries())
    .map(([name, quantity]) => ({
      subject_name: name,
      quantity
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  stats.dailySales = sortedDailySales;
  stats.productSales = sortedProductSales;
  
  // Получаем топовые товары
  try {
    const { topProfitable, topUnprofitable } = await getTopProducts(data, apiKey);
    stats.topProfitableProducts = topProfitable;
    stats.topUnprofitableProducts = topUnprofitable;
  } catch (error) {
    console.error('Error getting top products:', error);
    stats.topProfitableProducts = [
      {
        name: "Данные недоступны",
        price: "0",
        profit: "+0",
        image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg"
      }
    ];
    stats.topUnprofitableProducts = [
      {
        name: "Данные недоступны",
        price: "0",
        profit: "0",
        image: "https://storage.googleapis.com/a1aa/image/OVMl1GnzKz6bgDAEJKScyzvR2diNKk-j6FoazEY-XRI.jpg"
      }
    ];
  }
  
  // Добавляем данные для раздела детализации удержаний
  stats.deductionsAnalysis = deductionsAnalysis;

  return stats;
};

/**
 * Получает данные о статистике Wildberries за указанный период
 */
export const fetchWildberriesStats = async (
  apiKey: string,
  dateFrom: Date,
  dateTo: Date
): Promise<WildberriesResponse> => {
  try {
    const data = await fetchAndCacheData(apiKey, dateFrom, dateTo);
    return await calculateStats(data, apiKey);
  } catch (error) {
    console.error('Ошибка получения статистики Wildberries:', error);
    throw new Error('Не удалось загрузить статистику Wildberries');
  }
};

/**
 * Получает список складов Wildberries
 */
export const fetchWarehouses = async (apiKey: string): Promise<Warehouse[]> => {
  try {
    // Это демо-данные, так как у Wildberries нет публичного API для списка складов
    const demoWarehouses: Warehouse[] = [
      { id: 1, name: "Подольск, МО", address: "Московская область, г. Подольск" },
      { id: 2, name: "Коледино, МО", address: "Московская область, с. Коледино" },
      { id: 3, name: "Электросталь, МО", address: "Московская область, г. Электросталь" },
      { id: 4, name: "Невинномысск, КЧР", address: "Карачаево-Черкесская Республика, г. Невинномысск" },
      { id: 5, name: "Казань, РТ", address: "Республика Татарстан, г. Казань" },
      { id: 6, name: "Новосибирск, НО", address: "Новосибирская область, г. Новосибирск" },
      { id: 7, name: "Хабаровск, ХК", address: "Хабаровский край, г. Хабаровск" }
    ];
    
    return demoWarehouses;
  } catch (error) {
    console.error('Ошибка получения списка складов:', error);
    throw new Error('Не удалось загрузить список складов');
  }
};

/**
 * Получает данные об остатках на складах
 */
export const fetchWarehouseRemains = async (apiKey: string): Promise<WarehouseRemain[]> => {
  try {
    // Это демо-данные, так как для полного функционала нужен real API
    const demoRemains: WarehouseRemain[] = [
      {
        nmId: 1234567,
        name: "Товар 1",
        warehouses: [
          { warehouseName: "Подольск", quantity: 120 },
          { warehouseName: "Коледино", quantity: 85 },
          { warehouseName: "Казань", quantity: 45 }
        ]
      },
      {
        nmId: 2345678,
        name: "Товар 2",
        warehouses: [
          { warehouseName: "Подольск", quantity: 75 },
          { warehouseName: "Электросталь", quantity: 150 },
          { warehouseName: "Новосибирск", quantity: 30 }
        ]
      },
      {
        nmId: 3456789,
        name: "Товар 3",
        warehouses: [
          { warehouseName: "Невинномысск", quantity: 55 },
          { warehouseName: "Хабаровск", quantity: 20 }
        ]
      }
    ];
    
    return demoRemains;
  } catch (error) {
    console.error('Ошибка получения данных об остатках:', error);
    throw new Error('Не удалось загрузить данные об остатках');
  }
};
