
import axios from "axios";
import { AnalyticsData } from "@/types/analytics";

// Интерфейсы для заказов и продаж
export interface WildberriesOrder {
  date: string;
  lastChangeDate: string;
  warehouseName: string;
  warehouseType: string;
  countryName: string;
  oblastOkrugName: string;
  regionName: string;
  supplierArticle: string;
  nmId: number;
  barcode: string;
  category: string;
  subject: string;
  brand: string;
  techSize: string;
  incomeID: number;
  isSupply: boolean;
  isRealization: boolean;
  totalPrice: number;
  discountPercent: number;
  spp: number;
  finishedPrice: number;
  priceWithDisc: number;
  isCancel: boolean;
  cancelDate: string;
  orderType: string;
  sticker: string;
  gNumber: string;
  srid: string;
}

export interface WildberriesSale {
  date: string;
  lastChangeDate: string;
  warehouseName: string;
  warehouseType: string;
  countryName: string;
  oblastOkrugName: string;
  regionName: string;
  supplierArticle: string;
  nmId: number;
  barcode: string;
  category: string;
  subject: string;
  brand: string;
  techSize: string;
  incomeID: number;
  isSupply: boolean;
  isRealization: boolean;
  totalPrice: number;
  discountPercent: number;
  spp: number;
  paymentSaleAmount: number;
  forPay: number;
  finishedPrice: number;
  priceWithDisc: number;
  saleID: string;
  orderType: string;
  sticker: string;
  gNumber: string;
  srid: string;
}

// Базовый интерфейс для общей структуры данных статистики
export interface WildberriesStats {
  currentPeriod: {
    sales: number;
    orders: number;
    returns: number;
    cancellations: number;
    transferred: number;
    expenses: {
      total: number;
      logistics: number;
      storage: number;
      penalties: number;
      advertising: number;
      acceptance: number;
    };
    netProfit: number;
    acceptance: number;
  };
  previousPeriod?: {
    sales: number;
    orders: number;
    returns: number;
    cancellations: number;
  };
  dailySales?: Array<{
    date: string;
    sales: number;
    previousSales?: number;
  }>;
  productSales?: Array<{
    subject_name: string;
    quantity: number;
  }>;
  productReturns?: Array<{
    name: string;
    value: number;
  }>;
  topProfitableProducts?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
    quantitySold?: number;
    margin?: number;
    returnCount?: number;
    category?: string;
  }>;
  topUnprofitableProducts?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
    quantitySold?: number;
    margin?: number;
    returnCount?: number;
    category?: string;
  }>;
  ordersByRegion?: Array<{
    region: string;
    count: number;
  }>;
  ordersByWarehouse?: Array<{
    warehouse: string;
    count: number;
  }>;
  penaltiesData?: Array<{
    name: string;
    value: number;
  }>;
}

/**
 * Форматирует дату в строку ISO для API Wildberries
 */
const formatDateForAPI = (date: Date): string => {
  return date.toISOString();
};

/**
 * Получает заказы Wildberries с использованием пагинации
 * @param apiKey API ключ для Wildberries
 * @param from Начальная дата для выборки заказов
 */
export const fetchWildberriesOrders = async (apiKey: string, from?: Date): Promise<WildberriesOrder[]> => {
  // Если дата не указана, используем начало текущего дня
  let dateFrom = from || new Date();
  dateFrom.setHours(0, 0, 0, 0);
  
  const allOrders: WildberriesOrder[] = [];
  let nextDateFrom = formatDateForAPI(dateFrom);
  let hasMoreData = true;
  let attemptCount = 0;
  const MAX_ATTEMPTS = 10; // Ограничение на количество запросов для предотвращения бесконечных циклов
  
  try {
    while (hasMoreData && attemptCount < MAX_ATTEMPTS) {
      console.log(`Fetching orders with dateFrom: ${nextDateFrom}`);
      
      const response = await axios.get('https://statistics-api.wildberries.ru/api/v1/supplier/orders', {
        headers: {
          'Authorization': apiKey,
        },
        params: {
          dateFrom: nextDateFrom,
          flag: 1
        }
      });
      
      const ordersData: WildberriesOrder[] = response.data || [];
      
      if (ordersData.length === 0) {
        // Больше данных нет
        hasMoreData = false;
        console.log('No more orders data available');
      } else {
        // Добавляем полученные заказы в общий массив
        allOrders.push(...ordersData);
        
        // Получаем дату последнего заказа для следующего запроса
        const lastOrder = ordersData[ordersData.length - 1];
        nextDateFrom = lastOrder.lastChangeDate;
        
        console.log(`Loaded ${ordersData.length} orders. Next dateFrom: ${nextDateFrom}`);
      }
      
      attemptCount++;
    }
    
    console.log(`Total orders loaded: ${allOrders.length}`);
    return allOrders;
  } catch (error) {
    console.error("Error fetching Wildberries orders:", error);
    return [];
  }
};

/**
 * Получает продажи Wildberries с использованием пагинации
 * @param apiKey API ключ для Wildberries
 * @param from Начальная дата для выборки продаж
 */
export const fetchWildberriesSales = async (apiKey: string, from?: Date): Promise<WildberriesSale[]> => {
  // Если дата не указана, используем начало текущего дня
  let dateFrom = from || new Date();
  dateFrom.setHours(0, 0, 0, 0);
  
  const allSales: WildberriesSale[] = [];
  let nextDateFrom = formatDateForAPI(dateFrom);
  let hasMoreData = true;
  let attemptCount = 0;
  const MAX_ATTEMPTS = 10; // Ограничение на количество запросов для предотвращения бесконечных циклов
  
  try {
    while (hasMoreData && attemptCount < MAX_ATTEMPTS) {
      console.log(`Fetching sales with dateFrom: ${nextDateFrom}`);
      
      const response = await axios.get('https://statistics-api.wildberries.ru/api/v1/supplier/sales', {
        headers: {
          'Authorization': apiKey,
        },
        params: {
          dateFrom: nextDateFrom,
          flag: 1
        }
      });
      
      const salesData: WildberriesSale[] = response.data || [];
      
      if (salesData.length === 0) {
        // Больше данных нет
        hasMoreData = false;
        console.log('No more sales data available');
      } else {
        // Добавляем полученные продажи в общий массив
        allSales.push(...salesData);
        
        // Получаем дату последней продажи для следующего запроса
        const lastSale = salesData[salesData.length - 1];
        nextDateFrom = lastSale.lastChangeDate;
        
        console.log(`Loaded ${salesData.length} sales. Next dateFrom: ${nextDateFrom}`);
      }
      
      attemptCount++;
    }
    
    console.log(`Total sales loaded: ${allSales.length}`);
    return allSales;
  } catch (error) {
    console.error("Error fetching Wildberries sales:", error);
    return [];
  }
};

// Основная функция для получения статистики
export const fetchWildberriesStats = async (apiKey: string, from?: Date, to?: Date): Promise<Partial<AnalyticsData>> => {
  try {
    // Fetch orders data with pagination
    const orders = await fetchWildberriesOrders(apiKey, from);
    
    // Fetch sales data with pagination
    const sales = await fetchWildberriesSales(apiKey, from);
    
    // Process orders data to get regions, warehouses, and categories
    const regions = new Map<string, number>();
    const warehouses = new Map<string, number>();
    const categories = new Map<string, number>();
    
    // Count orders, cancellations, and group by region/warehouse
    let totalOrders = 0;
    let cancelledOrders = 0;
    
    orders.forEach((order: WildberriesOrder) => {
      totalOrders++;
      
      if (order.isCancel) {
        cancelledOrders++;
      }
      
      // Group by region
      if (order.regionName) {
        const count = regions.get(order.regionName) || 0;
        regions.set(order.regionName, count + 1);
      }
      
      // Group by warehouse
      if (order.warehouseName) {
        const count = warehouses.get(order.warehouseName) || 0;
        warehouses.set(order.warehouseName, count + 1);
      }
      
      // Group by category
      if (order.subject) {
        const count = categories.get(order.subject) || 0;
        categories.set(order.subject, count + 1);
      }
    });
    
    // Process sales data to get totalSales and returns
    let totalSales = 0;
    let returns = 0;
    const returnItemsMap = new Map<string, number>();
    
    sales.forEach((sale: WildberriesSale) => {
      if (sale.saleID && sale.saleID.startsWith('S')) {
        totalSales += sale.finishedPrice || 0;
      } else if (sale.saleID && sale.saleID.startsWith('R')) {
        returns++;
        
        // Track returns by item
        if (sale.subject) {
          const value = returnItemsMap.get(sale.subject) || 0;
          returnItemsMap.set(sale.subject, value + (sale.finishedPrice || 0));
        }
      }
    });
    
    // Convert maps to sorted arrays
    const ordersByRegion = Array.from(regions.entries())
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);
    
    const ordersByWarehouse = Array.from(warehouses.entries())
      .map(([warehouse, count]) => ({ warehouse, count }))
      .sort((a, b) => b.count - a.count);
    
    const productSales = Array.from(categories.entries())
      .map(([subject_name, quantity]) => ({ subject_name, quantity }))
      .sort((a, b) => Number(b.quantity) - Number(a.quantity));
    
    // Calculate daily sales for today
    const today = new Date().toISOString().split('T')[0];
    const dailySales = [{
      date: today,
      sales: totalSales,
      previousSales: 0 // Setting to 0 as we only have current day data
    }];
    
    // Create returns data
    const productReturns = Array.from(returnItemsMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    // Создаем примерные данные для топ-3 прибыльных товаров
    const topProfitableProducts = productSales.slice(0, 3).map((item, index) => ({
      name: item.subject_name,
      price: `${Math.round(2000 + Math.random() * 5000)}`,
      profit: `${Math.round(500 + Math.random() * 2000)}`,
      image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg",
      quantitySold: item.quantity,
      margin: Math.round(25 + Math.random() * 20),
      returnCount: Math.round(Math.random() * 3),
      category: "Одежда"
    }));
    
    // Создаем примерные данные для топ-3 убыточных товаров
    const topUnprofitableProducts = productSales.slice(3, 6).map((item, index) => ({
      name: item.subject_name,
      price: `${Math.round(1000 + Math.random() * 3000)}`,
      profit: `-${Math.round(300 + Math.random() * 1000)}`,
      image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg",
      quantitySold: Math.round(1 + Math.random() * 5),
      margin: Math.round(5 + Math.random() * 10),
      returnCount: Math.round(5 + Math.random() * 10),
      category: "Одежда"
    }));
    
    // Create the stats object with the proper structure
    const stats: Partial<AnalyticsData> = {
      currentPeriod: {
        sales: totalSales,
        orders: totalOrders,
        returns: returns,
        cancellations: cancelledOrders,
        transferred: totalSales * 0.9, // Примерно 90% от продаж идет к перечислению
        expenses: {
          total: totalSales * 0.3, // Примерные общие расходы
          logistics: totalSales * 0.1, // Примерные расходы на логистику
          storage: totalSales * 0.05, // Примерные расходы на хранение
          penalties: totalSales * 0.02, // Примерные штрафы
          advertising: totalSales * 0.1, // Примерные расходы на рекламу
          acceptance: totalSales * 0.03 // Примерные расходы на приемку
        },
        netProfit: totalSales * 0.7, // Примерная чистая прибыль
        acceptance: 0
      },
      previousPeriod: {
        sales: 0,
        orders: 0,
        returns: 0,
        cancellations: 0
      },
      dailySales,
      productSales,
      productReturns,
      topProfitableProducts,
      topUnprofitableProducts,
      ordersByRegion,
      ordersByWarehouse,
      penaltiesData: [
        { name: "Брак", value: totalSales * 0.01 },
        { name: "Просрочка", value: totalSales * 0.005 },
        { name: "Упаковка", value: totalSales * 0.005 }
      ]
    };
    
    return stats;
  } catch (error) {
    console.error("Error in fetchWildberriesStats:", error);
    throw error;
  }
};
