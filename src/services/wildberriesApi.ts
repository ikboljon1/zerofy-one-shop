
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
  dailySales: Array<{
    date: string;
    sales: number;
    previousSales: number;
  }>;
  productSales: Array<{
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

// Функция для получения данных по заказам
export const fetchWildberriesOrders = async (apiKey: string, from?: Date, to?: Date) => {
  // If no dates provided, use current day
  const dateFrom = from || new Date();
  dateFrom.setHours(0, 0, 0, 0);
  
  const dateTo = to || new Date();
  dateTo.setHours(23, 59, 59, 999);
  
  try {
    const response = await axios.get('https://statistics-api.wildberries.ru/api/v1/supplier/orders', {
      headers: {
        'Authorization': apiKey,
      },
      params: {
        dateFrom: dateFrom.toISOString().split('T')[0],
        flag: 1
      }
    });
    
    return response.data || [];
  } catch (error) {
    console.error("Error fetching Wildberries orders:", error);
    return [];
  }
};

// Функция для получения данных по продажам
export const fetchWildberriesSales = async (apiKey: string, from?: Date, to?: Date) => {
  // If no dates provided, use current day
  const dateFrom = from || new Date();
  dateFrom.setHours(0, 0, 0, 0);
  
  const dateTo = to || new Date();
  dateTo.setHours(23, 59, 59, 999);
  
  try {
    const response = await axios.get('https://statistics-api.wildberries.ru/api/v1/supplier/sales', {
      headers: {
        'Authorization': apiKey,
      },
      params: {
        dateFrom: dateFrom.toISOString().split('T')[0],
        flag: 1
      }
    });
    
    return response.data || [];
  } catch (error) {
    console.error("Error fetching Wildberries sales:", error);
    return [];
  }
};

// Основная функция для получения статистики
export const fetchWildberriesStats = async (apiKey: string, from?: Date, to?: Date): Promise<Partial<AnalyticsData>> => {
  try {
    // Fetch orders data
    const orders = await fetchWildberriesOrders(apiKey, from, to);
    
    // Fetch sales data
    const sales = await fetchWildberriesSales(apiKey, from, to);
    
    // Process orders data to get regions, warehouses, and categories
    const regions = new Map();
    const warehouses = new Map();
    const categories = new Map();
    
    // Count orders, cancellations, and group by region/warehouse
    let totalOrders = 0;
    let cancelledOrders = 0;
    
    orders.forEach((order: any) => {
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
    const returnItemsMap = new Map();
    
    sales.forEach((sale: any) => {
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
    
    // Create the stats object with the new structure
    const stats: Partial<AnalyticsData> = {
      currentPeriod: {
        sales: totalSales,
        orders: totalOrders,
        returns: returns,
        cancellations: cancelledOrders,
        transferred: totalSales * 0.9, // Примерно 90% от продаж идет к перечислению
        expenses: {
          total: 0,
          logistics: 0,
          storage: 0,
          penalties: 0,
          advertising: 0,
          acceptance: 0
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
      ordersByRegion,
      ordersByWarehouse,
      penaltiesData: [] // Пустой массив, так как API не предоставляет эти данные
    };
    
    return stats;
  } catch (error) {
    console.error("Error in fetchWildberriesStats:", error);
    throw error;
  }
};
