import axios from 'axios';
import { WildberriesOrder, WildberriesSale } from "@/types/store";

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
      deductions?: number; // Добавляем поле для удержаний
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
    count?: number;
  }>;
  penaltiesData?: Array<{
    name: string;
    value: number;
  }>;
  deductionsData?: Array<{  // Добавляем отдельное поле для данных по удержаниям
    name: string;
    value: number;
  }>;
  topProfitableProducts?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
    quantitySold: number;
    margin: number;
    returnCount: number;
    category: string;
  }>;
  topUnprofitableProducts?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
    quantitySold: number;
    margin: number;
    returnCount: number;
    category: string;
  }>;
  orders?: WildberriesOrder[];
  sales?: WildberriesSale[];
  warehouseDistribution?: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  regionDistribution?: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const formatDateRFC3339 = (date: Date, isEnd: boolean = false): string => {
  const formattedDate = date.toISOString().split('T')[0];
  return isEnd ? `${formattedDate}T23:59:59` : `${formattedDate}T00:00:00`;
};

const getLastWeekDateRange = () => {
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  return {
    dateFrom: lastWeek,
    dateTo: today
  };
};

// Function to fetch report details with pagination support
const fetchReportDetail = async (apiKey: string, dateFrom: Date, dateTo: Date, rrdId: number = 0) => {
  try {
    const formattedDateFrom = formatDate(dateFrom);
    const formattedDateTo = formatDate(dateTo);
    
    const url = "https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod";
    
    const headers = {
      "Authorization": apiKey,
      "Content-Type": "application/json"
    };
    
    const params = {
      "dateFrom": formattedDateFrom,
      "dateTo": formattedDateTo,
      "rrdid": rrdId,
      "limit": 100000,
    };
    
    console.log(`Fetching report detail from Wildberries API. Page with rrdId: ${rrdId}`);
    const response = await axios.get(url, { headers, params });
    
    const data = response.data;
    let nextRrdId = 0;
    
    if (data && data.length > 0) {
      const lastRecord = data[data.length - 1];
      nextRrdId = lastRecord.rrd_id || 0;
    }
    
    return { data, nextRrdId };
  } catch (error) {
    console.error("Error fetching report detail:", error);
    return { data: [], nextRrdId: 0 };
  }
};

// Function to fetch all report details with pagination
const fetchAllReportDetails = async (apiKey: string, dateFrom: Date, dateTo: Date) => {
  let allData = [];
  let nextRrdId = 0;
  
  try {
    do {
      const { data, nextRrdId: newRrdId } = await fetchReportDetail(apiKey, dateFrom, dateTo, nextRrdId);
      
      if (!data || data.length === 0) {
        break;
      }
      
      allData = [...allData, ...data];
      nextRrdId = newRrdId;
      
      if (nextRrdId === 0) {
        break;
      }
      
    } while (nextRrdId > 0);
    
    return allData;
  } catch (error) {
    console.error("Error fetching all report details:", error);
    return [];
  }
};

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

export const fetchWildberriesOrders = async (apiKey: string, dateFrom: Date): Promise<WildberriesOrder[]> => {
  try {
    const formattedDate = formatDateRFC3339(dateFrom);
    const url = "https://statistics-api.wildberries.ru/api/v1/supplier/orders";
    
    const headers = {
      "Authorization": apiKey,
    };
    
    const params = {
      "dateFrom": formattedDate
    };
    
    console.log("Fetching orders from Wildberries API...");
    const response = await axios.get(url, { headers, params });
    return response.data || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

export const fetchWildberriesSales = async (apiKey: string, dateFrom: Date): Promise<WildberriesSale[]> => {
  try {
    const formattedDate = formatDateRFC3339(dateFrom);
    const url = "https://statistics-api.wildberries.ru/api/v1/supplier/sales";
    
    const headers = {
      "Authorization": apiKey,
    };
    
    const params = {
      "dateFrom": formattedDate
    };
    
    console.log("Fetching sales from Wildberries API...");
    const response = await axios.get(url, { headers, params });
    return response.data || [];
  } catch (error) {
    console.error("Error fetching sales:", error);
    return [];
  }
};

const calculateMetrics = (reportData: any[], paidAcceptanceData: any[] = []) => {
  if (!reportData || reportData.length === 0) {
    return null;
  }
  
  let totalSales = 0;
  let totalTransferred = 0;
  let totalLogistics = 0;
  let totalStorage = 0;
  let totalPenalties = 0;
  let totalAcceptance = 0;
  let totalAdvertising = 0;
  let totalDeductions = 0; // Добавляем учет удержаний
  const dailySales = [];
  const productSales = {};
  const returnedProducts = {};
  const penaltiesByReason = {};
  const deductionsByReason = {}; // Словарь для учета удержаний по причинам
  
  console.log("Processing reportData:", reportData.length);
  
  // Process the reportData
  for (const record of reportData) {
    // Skip invalid data
    if (!record.date) continue;
    
    // Convert the date to a consistent format
    const date = record.date.split('T')[0];
    
    // Track daily sales
    if (!dailySales[date]) {
      dailySales[date] = 0;
    }
    
    // Process sales and transferred amounts
    if (record.doc_type_name === "Продажа" || record.order_type === "Продажа") {
      const saleAmount = record.ppvz_for_pay !== undefined ? record.ppvz_for_pay : 
                        (record.price_with_disc !== undefined ? record.price_with_disc : 0);
      
      totalSales += saleAmount;
      dailySales[date] += saleAmount;
      totalTransferred += record.supplier_reward !== undefined ? record.supplier_reward : 
                          (record.ppvz_for_pay !== undefined ? record.ppvz_for_pay : 0);
      
      // Track product sales
      if (record.subject_name) {
        if (!productSales[record.subject_name]) {
          productSales[record.subject_name] = 0;
        }
        productSales[record.subject_name] += 1;
      }
    }
    
    // Process returns
    if (record.doc_type_name === "Возврат" || record.order_type === "Возврат" || record.is_return) {
      const productName = record.product_name || record.subject_name || "Неизвестный товар";
      const returnAmount = record.ppvz_for_pay !== undefined ? record.ppvz_for_pay : 
                          (record.price_with_disc !== undefined ? record.price_with_disc : 0);
      
      if (!returnedProducts[productName]) {
        returnedProducts[productName] = { value: 0, count: 0 };
      }
      returnedProducts[productName].value += Math.abs(returnAmount);
      returnedProducts[productName].count += 1;
    }
    
    // Process expenses
    if (record.delivery_rub) {
      totalLogistics += record.delivery_rub;
    }
    
    if (record.storage_fee) {
      totalStorage += record.storage_fee;
    }
    
    if (record.acceptance) {
      totalAcceptance += record.acceptance;
    }
    
    if (record.surcharge) {
      totalAdvertising += record.surcharge;
    }
    
    // Process penalties
    if (record.penalty && record.penalty > 0) {
      const reason = record.penalty_reason || record.bonus_type_name || 'Другие причины';
      if (!penaltiesByReason[reason]) {
        penaltiesByReason[reason] = 0;
      }
      penaltiesByReason[reason] += record.penalty;
    }
    
    // Process deductions
    if (record.deduction && record.deduction > 0) {
      const reason = record.bonus_type_name || 'Прочие удержания';
      if (!deductionsByReason[reason]) {
        deductionsByReason[reason] = 0;
      }
      deductionsByReason[reason] += record.deduction;
      totalDeductions += record.deduction;
    }
  }
  
  // Process paid acceptance data
  for (const record of paidAcceptanceData || []) {
    if (record.finishedPrice) {
      totalAcceptance += record.finishedPrice;
    }
  }
  
  // Create penalties data array
  const penaltiesData = Object.entries(penaltiesByReason).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100
  })).sort((a, b) => b.value - a.value);

  // Create separate array for deductions
  const deductionsData = Object.entries(deductionsByReason).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100
  })).sort((a, b) => b.value - a.value);
  
  // Format daily sales for chart
  const formattedDailySales = Object.entries(dailySales).map(([date, sales]) => ({
    date,
    sales,
    previousSales: sales * 0.8 + Math.random() * sales * 0.4 // Dummy data for comparison
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Format product sales for chart
  const formattedProductSales = Object.entries(productSales).map(([subject_name, quantity]) => ({
    subject_name,
    quantity
  })).sort((a, b) => b.quantity - a.quantity);
  
  // Format returned products for chart
  const formattedReturns = Object.entries(returnedProducts).map(([name, data]) => ({
    name,
    value: Math.round(data.value * 100) / 100,
    count: data.count
  })).sort((a, b) => b.value - a.value);
  
  // Calculate total expenses
  const totalExpenses = totalLogistics + totalStorage + totalPenalties + totalAcceptance + totalAdvertising + totalDeductions;
  
  // Calculate net profit
  const netProfit = totalTransferred - totalExpenses;
  
  return {
    currentPeriod: {
      sales: Math.round(totalSales * 100) / 100,
      transferred: Math.round(totalTransferred * 100) / 100,
      expenses: {
        total: Math.round(totalExpenses * 100) / 100,
        logistics: Math.round(totalLogistics * 100) / 100,
        storage: Math.round(totalStorage * 100) / 100,
        penalties: Math.round(totalPenalties * 100) / 100,
        acceptance: Math.round(totalAcceptance * 100) / 100,
        advertising: Math.round(totalAdvertising * 100) / 100,
        deductions: Math.round(totalDeductions * 100) / 100 // Добавляем сумму удержаний
      },
      netProfit: Math.round(netProfit * 100) / 100,
      acceptance: Math.round(totalAcceptance * 100) / 100
    },
    dailySales: formattedDailySales,
    productSales: formattedProductSales,
    productReturns: formattedReturns,
    penaltiesData: penaltiesData,
    deductionsData: deductionsData // Добавляем массив данных по удержаниям
  };
};

const getDemoData = (): WildberriesResponse => {
  return {
    currentPeriod: {
      sales: 294290.6,
      transferred: 218227.70,
      expenses: {
        total: 65794.94, // Updated to include deductions
        logistics: 35669.16,
        storage: 23125.78,
        penalties: 0,
        acceptance: 0,
        advertising: 0,
        deductions: 7000 // Added deductions
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
      { name: "Костюм женский спортивный", value: 12000, count: 3 },
      { name: "Платье летнее", value: 8500, count: 2 },
      { name: "Футболка мужская", value: 6300, count: 4 },
      { name: "Джинсы классические", value: 4200, count: 1 },
      { name: "Куртка зимняя", value: 3000, count: 1 }
    ],
    penaltiesData: [
      { name: "Недопоставка", value: 3500 },
      { name: "Нарушение упаковки", value: 2800 },
      { name: "Нарушение маркировки", value: 1200 },
      { name: "Другие причины", value: 2500 }
    ],
    deductionsData: [ // Добавляем отдельные демо-данные для удержаний
      { name: "Прочие удержания", value: 7000 }
    ],
    topProfitableProducts: [
      { 
        name: "Костюм женский спортивный", 
        price: "3200", 
        profit: "25000", 
        image: "https://images.wbstatic.net/big/new/25250000/25251346-1.jpg",
        quantitySold: 65,
        margin: 42,
        returnCount: 3,
        category: "Женская одежда"
      },
      { 
        name: "Платье летнее", 
        price: "1200", 
        profit: "18000", 
        image: "https://images.wbstatic.net/big/new/22270000/22271973-1.jpg",
        quantitySold: 58,
        margin: 45,
        returnCount: 2,
        category: "Женская одежда" 
      },
      { 
        name: "Джинсы классические", 
        price: "2800", 
        profit: "15500", 
        image: "https://images.wbstatic.net/big/new/13730000/13733711-1.jpg",
        quantitySold: 42,
        margin: 35,
        returnCount: 1,
        category: "Мужская одежда" 
      }
    ],
    topUnprofitableProducts: [
      { 
        name: "Шарф зимний", 
        price: "800", 
        profit: "-5200", 
        image: "https://images.wbstatic.net/big/new/11080000/11081822-1.jpg",
        quantitySold: 4,
        margin: 8,
        returnCount: 12,
        category: "Аксессуары" 
      },
      { 
        name: "Рубашка офисная", 
        price: "1500", 
        profit: "-3800", 
        image: "https://images.wbstatic.net/big/new/9080000/9080277-1.jpg",
        quantitySold: 3,
        margin: 5,
        returnCount: 8,
        category: "Мужская одежда" 
      },
      { 
        name: "Перчатки кожаные", 
        price: "1200", 
        profit: "-2900", 
        image: "https://images.wbstatic.net/big/new/10320000/10328291-1.jpg",
        quantitySold: 2,
        margin: 12,
        returnCount: 10,
        category: "Аксессуары" 
      }
    ],
    orders: [],
    sales: [],
    warehouseDistribution: [],
    regionDistribution: []
  };
};

const fetchTransactions = async (apiKey: string, dateFrom: Date, dateTo: Date) => {
  try {
    const formattedDateFrom = formatDate(dateFrom);
    const formattedDateTo = formatDate(dateTo);
    const url = "https://seller-analytics-api.wildberries.ru/api/v1/analytics/financial-transactions";
    
    const headers = {
      "Authorization": apiKey,
    };
    
    const params = {
      "dateFrom": formattedDateFrom,
      "dateTo": formattedDateTo,
    };
    
    console.log("Fetching financial transactions from Wildberries API...");
    const response = await axios.get(url, { headers, params });
    return response.data.transactions || [];
  } catch (error) {
    console.error("Error fetching financial transactions:", error);
    return [];
  }
};

export const fetchWildberriesData = async (apiKey: string, dateFrom: Date, dateTo: Date): Promise<WildberriesResponse> => {
  try {
    if (!apiKey) {
      console.log("No API key provided, returning demo data");
      return getDemoData();
    }
    
    // Use the paginated function to get all report data
    const reportData = await fetchAllReportDetails(apiKey, dateFrom, dateTo);
    
    const paidAcceptanceData = await fetchPaidAcceptanceReport(apiKey, dateFrom, dateTo);
    
    const ordersData = await fetchWildberriesOrders(apiKey, dateFrom);
    const salesData = await fetchWildberriesSales(apiKey, dateFrom);
    
    // Calculate metrics from the report data
    const metrics = calculateMetrics(reportData, paidAcceptanceData);
    
    // In case of metrics calculation failure, fallback to demo data
    if (!metrics) {
      console.log("Failed to calculate metrics, returning demo data");
      return getDemoData();
    }
    
    // Add orders and sales to the result
    return {
      ...metrics,
      orders: ordersData,
      sales: salesData
    };
  } catch (error) {
    console.error("Error fetching Wildberries data:", error);
    return getDemoData();
  }
};
