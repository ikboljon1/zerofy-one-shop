
import { WildberriesResponse, WildberriesOrder, WildberriesSale } from "@/types/store";

/**
 * Calculates percentage change between two values
 */
export const calculatePercentageChange = (current: number, previous: number): string => {
  if (previous === 0) return '0%';
  const change = ((current - previous) / previous) * 100;
  return `${Math.abs(change).toFixed(1)}%`;
};

/**
 * Formats currency with thousands separators
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('ru-RU').format(Math.round(value));
};

/**
 * Extracts and formats sales trend data for charts
 */
export const prepareSalesTrendData = (data: WildberriesResponse) => {
  if (!data || !data.dailySales) return [];
  return data.dailySales;
};

/**
 * Extracts and formats product sales data for charts
 */
export const prepareProductSalesData = (data: WildberriesResponse) => {
  if (!data || !data.productSales) return [];
  return data.productSales;
};

/**
 * Groups orders by warehouse for visualization
 */
export const groupOrdersByWarehouse = (orders: WildberriesOrder[]): Record<string, number> => {
  const warehouseCounts: Record<string, number> = {};
  
  orders.forEach(order => {
    const warehouse = order.warehouseName || 'Неизвестно';
    warehouseCounts[warehouse] = (warehouseCounts[warehouse] || 0) + 1;
  });
  
  return warehouseCounts;
};

/**
 * Groups orders by region for visualization
 */
export const groupOrdersByRegion = (orders: WildberriesOrder[]): Record<string, number> => {
  const regionCounts: Record<string, number> = {};
  
  orders.forEach(order => {
    const region = order.regionName || 'Неизвестно';
    regionCounts[region] = (regionCounts[region] || 0) + 1;
  });
  
  return regionCounts;
};

/**
 * Calculates returns data from sales data
 */
export const calculateReturnsData = (sales: WildberriesSale[]) => {
  const returns = sales.filter(sale => sale.saleID?.startsWith('R'));
  
  const totalAmount = returns.reduce((sum, sale) => sum + Math.abs(sale.forPay || 0), 0);
  
  return {
    count: returns.length,
    amount: totalAmount,
    byReason: {} // In a real implementation, we would categorize by reason
  };
};
