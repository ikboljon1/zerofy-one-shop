
import { Store, STORES_STORAGE_KEY, STATS_STORAGE_KEY, ORDERS_STORAGE_KEY, SALES_STORAGE_KEY, WildberriesOrder, WildberriesSale } from "@/types/store";
import { fetchWildberriesStats, fetchWildberriesOrders, fetchWildberriesSales } from "@/services/wildberriesApi";

// Константа для управления кешированием
export const USE_ANALYTICS_CACHE = false;

export const getLastWeekDateRange = () => {
  const now = new Date();
  const lastWeek = new Date(now);
  lastWeek.setDate(now.getDate() - 7);
  return { from: lastWeek, to: now };
};

export const loadStores = (): Store[] => {
  try {
    const savedStores = localStorage.getItem(STORES_STORAGE_KEY);
    return savedStores ? JSON.parse(savedStores) : [];
  } catch (error) {
    console.error("Error loading stores from localStorage:", error);
    return [];
  }
};

export const saveStores = (stores: Store[]): void => {
  try {
    localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(stores));
  } catch (error) {
    console.error("Error saving stores to localStorage:", error);
    // Если превышена квота, удаляем старые данные или сжимаем существующие
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // Очищаем некоторые старые данные и пробуем снова
      clearOldStoreData();
      try {
        localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(stores));
      } catch (retryError) {
        console.error("Still unable to save stores after clearing old data:", retryError);
      }
    }
  }
};

// Функция для очистки старых данных
const clearOldStoreData = () => {
  try {
    // Удаляем старые данные статистики, заказов и продаж
    const allKeys = Object.keys(localStorage);
    const statsKeys = allKeys.filter(key => 
      key.startsWith(`${STATS_STORAGE_KEY}_`) || 
      key.startsWith(`${ORDERS_STORAGE_KEY}_`) || 
      key.startsWith(`${SALES_STORAGE_KEY}_`) ||
      key.startsWith(`marketplace_analytics_`) ||
      key.startsWith(`products_detailed_`)
    );
    
    // Сортируем по дате последнего изменения (возможно это не самый эффективный способ, но должен работать)
    const oldestKeys = statsKeys.slice(0, Math.ceil(statsKeys.length / 2));
    
    oldestKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`Cleared ${oldestKeys.length} old store data items from localStorage`);
  } catch (error) {
    console.error("Error clearing old store data:", error);
  }
};

export const refreshStoreStats = async (store: Store): Promise<Store | null> => {
  if (store.marketplace === "Wildberries") {
    try {
      const { from, to } = getLastWeekDateRange();
      const stats = await fetchWildberriesStats(store.apiKey, from, to);
      if (stats) {
        const updatedStore = { 
          ...store, 
          stats,
          lastFetchDate: new Date().toISOString() 
        };
        
        // Создаем базовую структуру для deductionsTimeline, если она отсутствует
        const deductionsTimeline = stats.dailySales?.map((day: any) => {
          const daysCount = stats.dailySales.length || 1;
          const logistic = (stats.currentPeriod.expenses.logistics || 0) / daysCount;
          const storage = (stats.currentPeriod.expenses.storage || 0) / daysCount;
          const penalties = (stats.currentPeriod.expenses.penalties || 0) / daysCount;
          const acceptance = (stats.currentPeriod.expenses.acceptance || 0) / daysCount;
          const advertising = (stats.currentPeriod.expenses.advertising || 0) / daysCount;
          
          return {
            date: typeof day.date === 'string' ? day.date.split('T')[0] : new Date().toISOString().split('T')[0],
            logistic,
            storage,
            penalties,
            acceptance,
            advertising
          };
        }) || [];
        
        // Генерируем уникальный timestamp для данных, чтобы предотвратить кэширование
        const timestamp = Date.now();
        
        if (USE_ANALYTICS_CACHE) {
          try {
            // Сохраняем полные данные статистики, включая топовые продукты с их изображениями
            localStorage.setItem(`${STATS_STORAGE_KEY}_${store.id}`, JSON.stringify({
              storeId: store.id,
              dateFrom: from.toISOString(),
              dateTo: to.toISOString(),
              stats: stats,
              deductionsTimeline: deductionsTimeline,
              timestamp: timestamp
            }));
            
            // Также сохраняем данные для аналитики и раздела товаров с тем же timestamp
            localStorage.setItem(`marketplace_analytics_${store.id}`, JSON.stringify({
              storeId: store.id,
              dateFrom: from.toISOString(),
              dateTo: to.toISOString(),
              data: stats,
              deductionsTimeline: deductionsTimeline,
              penalties: [],
              returns: [],
              productAdvertisingData: [],
              advertisingBreakdown: { search: stats.currentPeriod.expenses.advertising || 0 },
              timestamp: timestamp
            }));
            
            // Сохраняем данные о заказах отдельно
            if (stats.orders && stats.orders.length > 0) {
              localStorage.setItem(`${ORDERS_STORAGE_KEY}_${store.id}`, JSON.stringify({
                storeId: store.id,
                dateFrom: from.toISOString(),
                dateTo: to.toISOString(),
                orders: stats.orders,
                warehouseDistribution: stats.warehouseDistribution || [],
                regionDistribution: stats.regionDistribution || [],
                timestamp: timestamp
              }));
            }
            
            // Сохраняем данные о продажах отдельно
            if (stats.sales && stats.sales.length > 0) {
              localStorage.setItem(`${SALES_STORAGE_KEY}_${store.id}`, JSON.stringify({
                storeId: store.id,
                dateFrom: from.toISOString(),
                dateTo: to.toISOString(),
                sales: stats.sales,
                timestamp: timestamp
              }));
            }
            
            // Детализированные данные по продуктам для раздела товаров с тем же timestamp
            if (stats.topProfitableProducts || stats.topUnprofitableProducts) {
              localStorage.setItem(`products_detailed_${store.id}`, JSON.stringify({
                profitableProducts: stats.topProfitableProducts || [],
                unprofitableProducts: stats.topUnprofitableProducts || [],
                updateDate: new Date().toISOString(),
                timestamp: timestamp
              }));
            }
          } catch (storageError) {
            // Обработка ошибок localStorage
            console.error('Error saving data to localStorage:', storageError);
            if (storageError instanceof DOMException && storageError.name === 'QuotaExceededError') {
              clearOldStoreData();
              // Пытаемся сохранить только самые важные данные после очистки
              try {
                localStorage.setItem(`${STATS_STORAGE_KEY}_${store.id}`, JSON.stringify({
                  storeId: store.id,
                  dateFrom: from.toISOString(),
                  dateTo: to.toISOString(),
                  stats: stats,
                  timestamp: timestamp
                }));
              } catch (retryError) {
                console.error('Still unable to save data after clearing storage:', retryError);
              }
            }
          }
        }
        
        return updatedStore;
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
      // Return store without stats on error
      return store;
    }
  }
  return store;
};

// Получение данных о заказах для конкретного магазина
export const getOrdersData = (storeId: string) => {
  try {
    const storedData = localStorage.getItem(`${ORDERS_STORAGE_KEY}_${storeId}`);
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  } catch (error) {
    console.error('Error loading orders data:', error);
    return null;
  }
};

// Получение данных о продажах для конкретного магазина
export const getSalesData = (storeId: string) => {
  try {
    const storedData = localStorage.getItem(`${SALES_STORAGE_KEY}_${storeId}`);
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  } catch (error) {
    console.error('Error loading sales data:', error);
    return null;
  }
};

// Загрузка и обновление данных о заказах с учетом периода
export const fetchAndUpdateOrders = async (store: Store, startDate?: Date) => {
  if (store.marketplace === "Wildberries") {
    try {
      const { from } = startDate ? { from: startDate } : getLastWeekDateRange();
      const orders = await fetchWildberriesOrders(store.apiKey, from);
      
      if (orders && orders.length > 0) {
        // Рассчитываем распределение складов
        const warehouseCounts: Record<string, number> = {};
        const totalOrders = orders.length;
        
        orders.forEach(order => {
          if (order.warehouseName) {
            warehouseCounts[order.warehouseName] = (warehouseCounts[order.warehouseName] || 0) + 1;
          }
        });
        
        const warehouseDistribution = Object.entries(warehouseCounts)
          .map(([name, count]) => ({
            name,
            count,
            percentage: (count / totalOrders) * 100
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        // Рассчитываем распределение регионов
        const regionCounts: Record<string, number> = {};
        
        orders.forEach(order => {
          if (order.regionName) {
            regionCounts[order.regionName] = (regionCounts[order.regionName] || 0) + 1;
          }
        });
        
        const regionDistribution = Object.entries(regionCounts)
          .map(([name, count]) => ({
            name,
            count,
            percentage: (count / totalOrders) * 100
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        try {
          // Сохраняем данные в localStorage
          localStorage.setItem(`${ORDERS_STORAGE_KEY}_${store.id}`, JSON.stringify({
            storeId: store.id,
            dateFrom: from.toISOString(),
            dateTo: new Date().toISOString(),
            orders,
            warehouseDistribution,
            regionDistribution,
            timestamp: Date.now()
          }));
        } catch (storageError) {
          console.error('Error saving orders to localStorage:', storageError);
          if (storageError instanceof DOMException && storageError.name === 'QuotaExceededError') {
            clearOldStoreData();
            // Пытаемся сохранить снова после очистки
            try {
              localStorage.setItem(`${ORDERS_STORAGE_KEY}_${store.id}`, JSON.stringify({
                storeId: store.id,
                dateFrom: from.toISOString(),
                dateTo: new Date().toISOString(),
                orders,
                warehouseDistribution,
                regionDistribution,
                timestamp: Date.now()
              }));
            } catch (retryError) {
              console.error('Still unable to save orders after clearing storage:', retryError);
            }
          }
        }
        
        return {
          orders,
          warehouseDistribution,
          regionDistribution
        };
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }
  return null;
};

// Загрузка и обновление данных о продажах с учетом периода
export const fetchAndUpdateSales = async (store: Store, startDate?: Date) => {
  if (store.marketplace === "Wildberries") {
    try {
      const { from } = startDate ? { from: startDate } : getLastWeekDateRange();
      const sales = await fetchWildberriesSales(store.apiKey, from);
      
      if (sales && sales.length > 0) {
        try {
          // Сохраняем данные в localStorage
          localStorage.setItem(`${SALES_STORAGE_KEY}_${store.id}`, JSON.stringify({
            storeId: store.id,
            dateFrom: from.toISOString(),
            dateTo: new Date().toISOString(),
            sales,
            timestamp: Date.now()
          }));
        } catch (storageError) {
          console.error('Error saving sales to localStorage:', storageError);
          if (storageError instanceof DOMException && storageError.name === 'QuotaExceededError') {
            clearOldStoreData();
            // Пытаемся сохранить снова после очистки
            try {
              localStorage.setItem(`${SALES_STORAGE_KEY}_${store.id}`, JSON.stringify({
                storeId: store.id,
                dateFrom: from.toISOString(),
                dateTo: new Date().toISOString(),
                sales,
                timestamp: Date.now()
              }));
            } catch (retryError) {
              console.error('Still unable to save sales after clearing storage:', retryError);
            }
          }
        }
        
        return sales;
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  }
  return null;
};

// Получение данных о доходности товаров для конкретного магазина
export const getProductProfitabilityData = (storeId: string) => {
  try {
    const storedData = localStorage.getItem(`products_detailed_${storeId}`);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      
      // Ensure we're only returning the top profitable and unprofitable products
      return {
        profitableProducts: parsedData.profitableProducts?.slice(0, 3) || [],
        unprofitableProducts: parsedData.unprofitableProducts?.slice(0, 3) || [],
        updateDate: parsedData.updateDate
      };
    }
    
    // Также пробуем загрузить из аналитики, если специальные данные не найдены
    const analyticsData = localStorage.getItem(`marketplace_analytics_${storeId}`);
    if (analyticsData) {
      const parsedData = JSON.parse(analyticsData);
      return {
        profitableProducts: (parsedData.data.topProfitableProducts || []).slice(0, 3),
        unprofitableProducts: (parsedData.data.topUnprofitableProducts || []).slice(0, 3),
        updateDate: parsedData.dateTo
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error loading product profitability data:', error);
    return null;
  }
};

// Получение данных аналитики с проверкой обязательных полей и принудительным обновлением при наличии параметра forceRefresh
export const getAnalyticsData = (storeId: string, forceRefresh?: boolean, customDateRange?: { from: Date, to: Date }) => {
  if (!USE_ANALYTICS_CACHE || forceRefresh) {
    console.log('Analytics cache disabled or force refresh requested, returning null');
    return null;
  }
  
  try {
    const key = `marketplace_analytics_${storeId}`;
    const storedData = localStorage.getItem(key);
    
    // Если данные отсутствуют или запрошено принудительное обновление, или указан пользовательский диапазон дат,
    // возвращаем пустую структуру и отмечаем, что нужно загрузить новые данные
    if (!storedData || forceRefresh || customDateRange) {
      console.log('Analytics data not found or forced refresh requested, returning default structure');
      // Возвращаем базовую структуру с демо-данными
      return {
        data: null,
        penalties: [],
        returns: [],
        deductionsTimeline: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          logistic: 0,
          storage: 0, 
          penalties: 0,
          acceptance: 0,
          advertising: 0
        })),
        productAdvertisingData: [],
        advertisingBreakdown: { search: 0 },
        timestamp: Date.now(), // Добавляем текущий timestamp
        needsRefresh: true, // Флаг, указывающий на необходимость обновления данных
        customDateRange // Добавляем пользовательский диапазон дат, если он указан
      };
    }
    
    let parsedData = JSON.parse(storedData);
    
    // Добавляем timestamp, если отсутствует
    if (!parsedData.timestamp) {
      parsedData.timestamp = Date.now();
    }
    
    // Проверяем наличие обязательных полей и устанавливаем значения по умолчанию
    if (!parsedData.deductionsTimeline || !Array.isArray(parsedData.deductionsTimeline) || parsedData.deductionsTimeline.length === 0) {
      console.log("Creating default deductionsTimeline data");
      parsedData.deductionsTimeline = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        logistic: 0,
        storage: 0, 
        penalties: 0,
        acceptance: 0,
        advertising: 0
      }));
    } else {
      // Ensure all items in deductionsTimeline have all required properties
      parsedData.deductionsTimeline = parsedData.deductionsTimeline.map((item: any) => ({
        date: item.date || new Date().toISOString().split('T')[0],
        logistic: item.logistic || 0,
        storage: item.storage || 0,
        penalties: item.penalties || 0,
        acceptance: item.acceptance || 0,
        advertising: item.advertising || 0
      }));
    }
    
    if (!parsedData.penalties || !Array.isArray(parsedData.penalties)) {
      parsedData.penalties = [];
    }
    
    if (!parsedData.returns || !Array.isArray(parsedData.returns)) {
      parsedData.returns = [];
    }
    
    if (!parsedData.productAdvertisingData || !Array.isArray(parsedData.productAdvertisingData)) {
      parsedData.productAdvertisingData = [];
    }
    
    if (!parsedData.advertisingBreakdown) {
      parsedData.advertisingBreakdown = { search: 0 };
    }
    
    if (parsedData.data && parsedData.data.currentPeriod && parsedData.data.currentPeriod.expenses) {
      // Ensure all expense fields exist
      parsedData.data.currentPeriod.expenses.advertising = parsedData.data.currentPeriod.expenses.advertising || 0;
      parsedData.data.currentPeriod.expenses.acceptance = parsedData.data.currentPeriod.expenses.acceptance || 0;
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error loading analytics data:', error);
    // Возвращаем базовую структуру в случае ошибки
    return {
      data: null,
      penalties: [],
      returns: [],
      deductionsTimeline: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        logistic: 0,
        storage: 0, 
        penalties: 0,
        acceptance: 0,
        advertising: 0
      })),
      productAdvertisingData: [],
      advertisingBreakdown: { search: 0 },
      timestamp: Date.now(), // Добавляем текущий timestamp
      needsRefresh: true // Флаг, указывающий на необходимость обновления данных
    };
  }
};

// Обновляем данные аналитики и сохраняем их
export const updateAnalyticsData = (storeId: string, data: any) => {
  try {
    localStorage.setItem(`marketplace_analytics_${storeId}`, JSON.stringify({
      ...data,
      timestamp: Date.now()
    }));
    return true;
  } catch (error) {
    console.error('Error updating analytics data:', error);
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearOldStoreData();
      try {
        localStorage.setItem(`marketplace_analytics_${storeId}`, JSON.stringify({
          ...data,
          timestamp: Date.now()
        }));
        return true;
      } catch (retryError) {
        console.error('Still unable to save analytics data after clearing storage:', retryError);
      }
    }
    return false;
  }
};

// Получаем данные о расходах на рекламу для конкретного периода
export const getExpensesForPeriod = (storeId: string, period: string) => {
  try {
    const analyticsData = getAnalyticsData(storeId);
    if (!analyticsData || !analyticsData.data || !analyticsData.data.currentPeriod) {
      return {
        logistics: 0,
        storage: 0,
        penalties: 0,
        acceptance: 0,
        advertising: 0,
        total: 0
      };
    }

    // Фильтруем deductionsTimeline по периоду, если он указан
    let filteredData = analyticsData.deductionsTimeline;
    let totalDays = filteredData.length;

    if (period !== 'all') {
      const now = new Date();
      const periodDays = {
        'today': 1,
        'yesterday': 1,
        'week': 7,
        '2weeks': 14,
        '4weeks': 28
      }[period] || 7;
      
      const cutoffDate = new Date(now);
      cutoffDate.setDate(now.getDate() - periodDays);
      
      filteredData = analyticsData.deductionsTimeline.filter((item: any) => {
        const itemDate = new Date(item.date);
        return itemDate >= cutoffDate;
      });
      
      totalDays = filteredData.length || 1;
    }

    // Если нет данных после фильтрации, возвращаем нули
    if (filteredData.length === 0) {
      return {
        logistics: 0,
        storage: 0,
        penalties: 0,
        acceptance: 0,
        advertising: 0,
        total: 0
      };
    }

    // Суммируем расходы по всем дням в отфильтрованном периоде
    const sumExpenses = filteredData.reduce((acc: any, item: any) => {
      return {
        logistic: acc.logistic + (item.logistic || 0),
        storage: acc.storage + (item.storage || 0),
        penalties: acc.penalties + (item.penalties || 0),
        acceptance: acc.acceptance + (item.acceptance || 0),
        advertising: acc.advertising + (item.advertising || 0)
      };
    }, { logistic: 0, storage: 0, penalties: 0, acceptance: 0, advertising: 0 });

    const total = sumExpenses.logistic + sumExpenses.storage + sumExpenses.penalties + sumExpenses.acceptance + sumExpenses.advertising;

    return {
      logistics: sumExpenses.logistic,
      storage: sumExpenses.storage,
      penalties: sumExpenses.penalties,
      acceptance: sumExpenses.acceptance,
      advertising: sumExpenses.advertising,
      total: total
    };
  } catch (error) {
    console.error('Error getting expenses for period:', error);
    return {
      logistics: 0,
      storage: 0,
      penalties: 0,
      acceptance: 0,
      advertising: 0,
      total: 0
    };
  }
};
