import { Store, NewStore, STATS_STORAGE_KEY, AIModel, NewAIModel, AI_MODELS_STORAGE_KEY, WildberriesOrder, WildberriesSale } from "@/types/store";
import { fetchWildberriesStats, fetchWildberriesOrders, fetchWildberriesSales } from "@/services/wildberriesApi";

const STORES_STORAGE_KEY = 'marketplace_stores';

// Загрузка списка магазинов из localStorage
export const loadStores = (): Store[] => {
  try {
    const storedStores = localStorage.getItem(STORES_STORAGE_KEY);
    return storedStores ? JSON.parse(storedStores) : [];
  } catch (error) {
    console.error("Ошибка при загрузке магазинов:", error);
    return [];
  }
};

// Сохранение списка магазинов в localStorage
export const saveStores = (stores: Store[]): void => {
  try {
    localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(stores));
  } catch (error) {
    console.error("Ошибка при сохранении магазинов:", error);
  }
};

// Обновление статистики магазина
export const refreshStoreStats = async (store: Store): Promise<Store | null> => {
  try {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const stats = await fetchWildberriesStats(store.apiKey, weekAgo, today);
    
    if (stats) {
      // Сохраняем статистику в localStorage
      localStorage.setItem(`${STATS_STORAGE_KEY}_${store.id}`, JSON.stringify(stats));
      
      return {
        ...store,
        stats,
        lastFetchDate: new Date().toISOString()
      };
    }
    
    return null;
  } catch (error) {
    console.error("Ошибка при обновлении статистики:", error);
    return null;
  }
};

// Проверка валидности API ключа
export const validateApiKey = async (apiKey: string): Promise<{ isValid: boolean; errorMessage?: string }> => {
  try {
    // Здесь можно добавить реальную проверку API ключа через запрос к API маркетплейса
    // Для примера просто проверяем, что ключ не пустой и имеет минимальную длину
    if (!apiKey) {
      return { isValid: false, errorMessage: "API ключ не может быть пустым" };
    }
    
    if (apiKey.length < 8) {
      return { isValid: false, errorMessage: "API ключ должен содержать минимум 8 символов" };
    }
    
    return { isValid: true };
  } catch (error) {
    console.error("Ошибка при проверке API ключа:", error);
    return { isValid: false, errorMessage: "Произошла ошибка при проверке API ключа" };
  }
};

// Обеспечение сохранения выбранного магазина
export const ensureStoreSelectionPersistence = (): Store[] => {
  const stores = loadStores();
  
  // Если нет магазинов, просто возвращаем пустой массив
  if (stores.length === 0) {
    return stores;
  }
  
  // Проверяем, есть ли выбранный магазин
  const hasSelectedStore = stores.some(store => store.isSelected);
  
  // Если нет выбранного магазина, проверяем сохраненный ID последнего выбранного магазина
  if (!hasSelectedStore) {
    try {
      const lastSelectedStore = localStorage.getItem('last_selected_store');
      if (lastSelectedStore) {
        const { storeId } = JSON.parse(lastSelectedStore);
        
        // Обновляем выбранный магазин
        const updatedStores = stores.map(store => ({
          ...store,
          isSelected: store.id === storeId
        }));
        
        saveStores(updatedStores);
        return updatedStores;
      }
    } catch (error) {
      console.error("Ошибка при восстановлении выбранного магазина:", error);
    }
    
    // Если не удалось восстановить выбранный магазин, выбираем первый
    const updatedStores = stores.map((store, index) => ({
      ...store,
      isSelected: index === 0
    }));
    
    saveStores(updatedStores);
    return updatedStores;
  }
  
  return stores;
};

// Получение аналитических данных
export const getAnalyticsData = (storeId: string) => {
  try {
    const analyticsData = localStorage.getItem(`marketplace_analytics_${storeId}`);
    if (analyticsData) {
      return JSON.parse(analyticsData);
    }
    return null;
  } catch (error) {
    console.error('Ошибка при получении аналитических данных:', error);
    return null;
  }
};

// Получение данных о заказах
export const getOrdersData = (storeId: string) => {
  try {
    const ordersData = localStorage.getItem(`marketplace_orders_${storeId}`);
    if (ordersData) {
      return JSON.parse(ordersData);
    }
    return null;
  } catch (error) {
    console.error('Ошибка при получении данных о заказах:', error);
    return null;
  }
};

// Получение данных о продажах
export const getSalesData = (storeId: string) => {
  try {
    const salesData = localStorage.getItem(`marketplace_sales_${storeId}`);
    if (salesData) {
      return JSON.parse(salesData);
    }
    return null;
  } catch (error) {
    console.error('Ошибка при получении данных о продажах:', error);
    return null;
  }
};

// Получение данных о прибыльности товаров
export const getProductProfitabilityData = (storeId: string) => {
  try {
    const profitabilityData = localStorage.getItem(`marketplace_profitability_${storeId}`);
    if (profitabilityData) {
      return JSON.parse(profitabilityData);
    }
    return null;
  } catch (error) {
    console.error('Ошибка при получении данных о прибыльности товаров:', error);
    return null;
  }
};

// Получение выбранного магазина
export const getSelectedStore = () => {
  try {
    const stores = loadStores();
    return stores.find(store => store.isSelected) || null;
  } catch (error) {
    console.error('Ошибка при получении выбранного магазина:', error);
    return null;
  }
};

// Функция для загрузки и обновления данных о заказах
export const fetchAndUpdateOrders = async (store: Store) => {
  try {
    if (!store.apiKey) {
      console.error('API ключ не предоставлен для магазина:', store.name);
      return null;
    }

    console.log(`Начинаем загрузку заказов для магазина ${store.name}...`);
    
    // Определяем дату, с которой начнем загрузку (30 дней назад)
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 30);
    
    // Вызываем API Wildberries для загрузки заказов
    const orders = await fetchWildberriesOrders(store.apiKey, dateFrom);
    
    if (!orders || orders.length === 0) {
      console.log('Нет заказов для обработки');
      return null;
    }
    
    console.log(`Успешно загружено ${orders.length} заказов`);
    
    // Рассчитываем распределение по складам и регионам
    const warehouseDistribution = calculateWarehouseDistribution(orders);
    const regionDistribution = calculateRegionDistribution(orders);
    
    // Сохраняем полученные данные в localStorage
    localStorage.setItem(`marketplace_orders_${store.id}`, JSON.stringify({
      orders,
      warehouseDistribution,
      regionDistribution,
      lastUpdated: new Date().toISOString()
    }));
    
    return {
      orders,
      warehouseDistribution,
      regionDistribution
    };
  } catch (error) {
    console.error('Ошибка при загрузке и обновлении заказов:', error);
    return null;
  }
};

// Функция для загрузки и обновления данных о продажах
export const fetchAndUpdateSales = async (store: Store) => {
  try {
    if (!store.apiKey) {
      console.error('API ключ не предоставлен для магазина:', store.name);
      return null;
    }

    console.log(`Начинаем загрузку продаж для магазина ${store.name}...`);
    
    // Определяем дату, с которой начнем загрузку (30 дней назад)
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 30);
    
    // Вызываем API Wildberries для загрузки продаж
    const sales = await fetchWildberriesSales(store.apiKey, dateFrom);
    
    if (!sales || sales.length === 0) {
      console.log('Нет продаж для обработки');
      return null;
    }
    
    console.log(`Успешно загружено ${sales.length} продаж`);
    
    // Сохраняем полученные данные в localStorage
    localStorage.setItem(`marketplace_sales_${store.id}`, JSON.stringify({
      sales,
      lastUpdated: new Date().toISOString()
    }));
    
    return sales;
  } catch (error) {
    console.error('Ошибка при загрузке и обновлении продаж:', error);
    return null;
  }
};

// Рассчитывает распределение заказов по складам
const calculateWarehouseDistribution = (orders: WildberriesOrder[]) => {
  const warehouseCounts: Record<string, number> = {};
  const totalOrders = orders.length;
  
  orders.forEach(order => {
    if (order.warehouseName) {
      warehouseCounts[order.warehouseName] = (warehouseCounts[order.warehouseName] || 0) + 1;
    }
  });
  
  return Object.entries(warehouseCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

// Рассчитывает распределение заказов по регионам
const calculateRegionDistribution = (orders: WildberriesOrder[]) => {
  const regionCounts: Record<string, number> = {};
  const totalOrders = orders.length;
  
  orders.forEach(order => {
    if (order.regionName) {
      regionCounts[order.regionName] = (regionCounts[order.regionName] || 0) + 1;
    }
  });
  
  return Object.entries(regionCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

// === Функции для работы с AI моделями ===

// Загрузка списка AI моделей из localStorage
export const loadAIModels = (): AIModel[] => {
  try {
    const storedModels = localStorage.getItem(AI_MODELS_STORAGE_KEY);
    return storedModels ? JSON.parse(storedModels) : [];
  } catch (error) {
    console.error("Ошибка при загрузке AI моделей:", error);
    return [];
  }
};

// Сохранение списка AI моделей в localStorage
export const saveAIModels = (models: AIModel[]): void => {
  try {
    localStorage.setItem(AI_MODELS_STORAGE_KEY, JSON.stringify(models));
  } catch (error) {
    console.error("Ошибка при сохранении AI моделей:", error);
  }
};

// Проверка валидности API ключа для AI модели
export const validateAIModelApiKey = async (apiKey: string, modelType: string): Promise<{ isValid: boolean; errorMessage?: string }> => {
  try {
    // Здесь можно добавить реальную проверку API ключа через запрос к соответствующему API
    // Для примера просто проверяем, что ключ не пустой и имеет минимальную длину
    if (!apiKey) {
      return { isValid: false, errorMessage: "API ключ не может быть пустым" };
    }
    
    // Разные модели имеют разные форматы ключей
    switch (modelType) {
      case "OpenAI":
        if (!apiKey.startsWith("sk-") || apiKey.length < 20) {
          return { isValid: false, errorMessage: "API ключ OpenAI должен начинаться с 'sk-' и содержать минимум 20 символов" };
        }
        break;
      case "Gemini":
        if (apiKey.length < 12) {
          return { isValid: false, errorMessage: "API ключ Gemini должен содержать минимум 12 символов" };
        }
        break;
      default:
        if (apiKey.length < 10) {
          return { isValid: false, errorMessage: `API ключ ${modelType} должен содержать минимум 10 символов` };
        }
    }
    
    return { isValid: true };
  } catch (error) {
    console.error(`Ошибка при проверке API ключа ${modelType}:`, error);
    return { isValid: false, errorMessage: `Произошла ошибка при проверке API ключа ${modelType}` };
  }
};

// Получение выбранной AI модели
export const getSelectedAIModel = (): AIModel | null => {
  try {
    const models = loadAIModels();
    return models.find(model => model.isSelected) || null;
  } catch (error) {
    console.error('Ошибка при получении выбранной AI модели:', error);
    return null;
  }
};

// Обеспечение сохранения выбранной AI модели
export const ensureAIModelSelectionPersistence = (): AIModel[] => {
  const models = loadAIModels();
  
  // Если нет моделей, просто возвращаем пустой массив
  if (models.length === 0) {
    return models;
  }
  
  // Проверяем, есть ли выбранная модель
  const hasSelectedModel = models.some(model => model.isSelected);
  
  // Если нет выбранной модели, проверяем сохраненный ID последней выбранной модели
  if (!hasSelectedModel) {
    try {
      const lastSelectedModel = localStorage.getItem('last_selected_ai_model');
      if (lastSelectedModel) {
        const { modelId } = JSON.parse(lastSelectedModel);
        
        // Обновляем выбранную модель
        const updatedModels = models.map(model => ({
          ...model,
          isSelected: model.id === modelId
        }));
        
        saveAIModels(updatedModels);
        return updatedModels;
      }
    } catch (error) {
      console.error("Ошибка при восстановлении выбранной AI модели:", error);
    }
    
    // Если не удалось восстановить выбранную модель, выбираем первую
    const updatedModels = models.map((model, index) => ({
      ...model,
      isSelected: index === 0
    }));
    
    saveAIModels(updatedModels);
    return updatedModels;
  }
  
  return models;
};
