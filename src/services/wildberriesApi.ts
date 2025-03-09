
// Define types for the API response structure
export interface ExpensesData {
  logistics: number;
  storage: number;
  penalties: number;
  acceptance: number;
  advertising: number;
  deductions: number;
  total?: number;
}

export interface PeriodData {
  orderCount: number;
  income: number;
  expenses: ExpensesData;
  profit: number;
  sales?: number;
  transferred?: number;
  netProfit?: number;
}

export interface SalesData {
  date: string;
  orderCount: number;
  profit: number;
  sales?: number;
  previousSales?: number;
}

export interface ProductData {
  name: string;
  sku: string;
  sales: number;
  income: number;
  profit: number;
  price?: string;
  image?: string;
  quantitySold?: number;
  margin?: number;
  returnCount?: number;
  category?: string;
}

export interface ReturnData {
  name: string;
  value: number;
  count?: number;
}

export interface PenaltyData {
  name: string;
  value: number;
}

export interface DeductionData {
  name: string;
  value: number;
}

export interface WildberriesResponse {
  currentPeriod: PeriodData;
  previousPeriod: PeriodData;
  sales: SalesData[];
  products: ProductData[];
  dailySales?: SalesData[];
  productSales?: Array<{ subject_name: string; quantity: number }>;
  productReturns?: ReturnData[];
  topProfitableProducts?: ProductData[];
  topUnprofitableProducts?: ProductData[];
  penaltiesData?: PenaltyData[];
  deductionsData?: DeductionData[];
}

// Mock API implementations
export const fetchWildberriesStats = async (apiKey: string, dateFrom: Date, dateTo: Date): Promise<WildberriesResponse> => {
  try {
    // In a real implementation, this would make an API call to the Wildberries API
    // For now, we'll return mock data
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock data with the correct structure
    const currentPeriod: PeriodData = {
      orderCount: Math.floor(Math.random() * 500) + 100,
      income: Math.floor(Math.random() * 1000000) + 100000,
      expenses: {
        logistics: Math.floor(Math.random() * 100000) + 10000,
        storage: Math.floor(Math.random() * 80000) + 8000,
        penalties: Math.floor(Math.random() * 50000) + 5000,
        acceptance: Math.floor(Math.random() * 40000) + 4000,
        advertising: Math.floor(Math.random() * 60000) + 6000,
        deductions: Math.floor(Math.random() * 30000) + 3000,
      },
      profit: 0,
      sales: Math.floor(Math.random() * 1500000) + 200000,
      transferred: Math.floor(Math.random() * 1200000) + 150000,
      netProfit: Math.floor(Math.random() * 900000) + 100000
    };
    
    // Calculate profit based on income and expenses
    const totalExpenses = Object.values(currentPeriod.expenses).reduce((sum, expense) => sum + expense, 0);
    currentPeriod.profit = currentPeriod.income - totalExpenses;
    currentPeriod.expenses.total = totalExpenses;
    
    // Create previous period with slightly lower numbers
    const previousPeriod: PeriodData = {
      orderCount: Math.floor(currentPeriod.orderCount * 0.8),
      income: Math.floor(currentPeriod.income * 0.8),
      expenses: {
        logistics: Math.floor(currentPeriod.expenses.logistics * 0.8),
        storage: Math.floor(currentPeriod.expenses.storage * 0.8),
        penalties: Math.floor(currentPeriod.expenses.penalties * 0.8),
        acceptance: Math.floor(currentPeriod.expenses.acceptance * 0.8),
        advertising: Math.floor(currentPeriod.expenses.advertising * 0.8),
        deductions: Math.floor(currentPeriod.expenses.deductions * 0.8),
      },
      profit: 0,
      sales: currentPeriod.sales ? Math.floor(currentPeriod.sales * 0.8) : 0,
      transferred: currentPeriod.transferred ? Math.floor(currentPeriod.transferred * 0.8) : 0,
      netProfit: currentPeriod.netProfit ? Math.floor(currentPeriod.netProfit * 0.8) : 0
    };
    
    // Calculate previous period profit
    const prevTotalExpenses = Object.values(previousPeriod.expenses).reduce((sum, expense) => sum + expense, 0);
    previousPeriod.profit = previousPeriod.income - prevTotalExpenses;
    previousPeriod.expenses.total = prevTotalExpenses;
    
    // Generate sales data (daily)
    const sales: SalesData[] = [];
    const dailySales: SalesData[] = [];
    const days = Math.round((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < days; i++) {
      const date = new Date(dateFrom);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const orderCount = Math.floor(Math.random() * 30) + 1;
      const profit = Math.floor(Math.random() * 20000) + 5000;
      const salesAmount = Math.floor(Math.random() * 50000) + 10000;
      const prevSalesAmount = Math.floor(salesAmount * 0.8);
      
      sales.push({
        date: dateStr,
        orderCount,
        profit
      });
      
      dailySales.push({
        date: dateStr,
        orderCount,
        profit,
        sales: salesAmount,
        previousSales: prevSalesAmount
      });
    }
    
    // Generate product data
    const products: ProductData[] = [];
    for (let i = 0; i < 10; i++) {
      const productSales = Math.floor(Math.random() * 100) + 10;
      const income = productSales * (Math.floor(Math.random() * 2000) + 500);
      const profit = Math.floor(income * 0.4);
      
      products.push({
        name: `Товар ${i + 1}`,
        sku: `SKU${100000 + i}`,
        sales: productSales,
        income,
        profit,
      });
    }

    // Generate additional demo data
    const productSales = Array.from({ length: 5 }, (_, i) => ({
      subject_name: `Категория ${i + 1}`,
      quantity: Math.floor(Math.random() * 200) + 50
    }));

    const productReturns = Array.from({ length: 5 }, (_, i) => ({
      name: `Товар ${i + 1}`,
      value: Math.floor(Math.random() * 10000) + 1000,
      count: Math.floor(Math.random() * 5) + 1
    }));

    const topProfitableProducts = Array.from({ length: 3 }, (_, i) => ({
      name: `Прибыльный товар ${i + 1}`,
      sku: `SKU${200000 + i}`,
      sales: Math.floor(Math.random() * 200) + 50,
      income: Math.floor(Math.random() * 200000) + 50000,
      profit: Math.floor(Math.random() * 100000) + 20000,
      price: `${Math.floor(Math.random() * 5000) + 1000}`,
      image: `https://images.wbstatic.net/big/new/${10000000 + i}/${10000000 + i + 1}-1.jpg`,
      quantitySold: Math.floor(Math.random() * 100) + 20,
      margin: Math.floor(Math.random() * 40) + 20,
      returnCount: Math.floor(Math.random() * 3),
      category: ["Женская одежда", "Мужская одежда", "Обувь", "Аксессуары"][Math.floor(Math.random() * 4)]
    }));

    const topUnprofitableProducts = Array.from({ length: 3 }, (_, i) => ({
      name: `Убыточный товар ${i + 1}`,
      sku: `SKU${300000 + i}`,
      sales: Math.floor(Math.random() * 50) + 5,
      income: Math.floor(Math.random() * 20000) + 5000,
      profit: -1 * (Math.floor(Math.random() * 10000) + 1000),
      price: `${Math.floor(Math.random() * 3000) + 500}`,
      image: `https://images.wbstatic.net/big/new/${20000000 + i}/${20000000 + i + 1}-1.jpg`,
      quantitySold: Math.floor(Math.random() * 20) + 1,
      margin: Math.floor(Math.random() * 10) + 1,
      returnCount: Math.floor(Math.random() * 10) + 5,
      category: ["Женская одежда", "Мужская одежда", "Обувь", "Аксессуары"][Math.floor(Math.random() * 4)]
    }));

    const penaltiesData = Array.from({ length: 5 }, (_, i) => ({
      name: `Штраф ${i + 1}`,
      value: Math.floor(Math.random() * 5000) + 500
    }));

    const deductionsData = Array.from({ length: 5 }, (_, i) => ({
      name: `Удержание ${i + 1}`,
      value: Math.floor(Math.random() * 8000) + 1000
    }));
    
    return {
      currentPeriod,
      previousPeriod,
      sales,
      products,
      dailySales,
      productSales,
      productReturns,
      topProfitableProducts,
      topUnprofitableProducts,
      penaltiesData,
      deductionsData
    };
  } catch (error) {
    console.error("Error fetching Wildberries statistics:", error);
    throw error;
  }
};

// Mock implementation of order fetching
export const fetchWildberriesOrders = async (apiKey: string, dateFrom: Date) => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock orders data
    return Array.from({ length: 20 }, (_, i) => ({
      date: new Date(dateFrom.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
      lastChangeDate: new Date().toISOString(),
      warehouseName: ["Московский склад", "Санкт-Петербургский склад", "Новосибирский склад"][Math.floor(Math.random() * 3)],
      warehouseType: "Федеральный",
      countryName: "Россия",
      oblastOkrugName: ["Центральный", "Северо-Западный", "Сибирский"][Math.floor(Math.random() * 3)],
      regionName: ["Москва и область", "Ленинградская область", "Новосибирская область"][Math.floor(Math.random() * 3)],
      supplierArticle: `A${100000 + i}`,
      nmId: 1000000 + i,
      barcode: `2000000${i}`,
      category: ["Одежда", "Обувь", "Аксессуары"][Math.floor(Math.random() * 3)],
      subject: ["Футболки", "Джинсы", "Куртки"][Math.floor(Math.random() * 3)],
      brand: ["Бренд А", "Бренд Б", "Бренд В"][Math.floor(Math.random() * 3)],
      techSize: ["S", "M", "L", "XL"][Math.floor(Math.random() * 4)],
      incomeID: 3000000 + i,
      isSupply: true,
      isRealization: true,
      totalPrice: Math.floor(Math.random() * 5000) + 1000,
      discountPercent: Math.floor(Math.random() * 30),
      spp: Math.floor(Math.random() * 10),
      finishedPrice: Math.floor(Math.random() * 4000) + 800,
      priceWithDisc: Math.floor(Math.random() * 4500) + 900,
      isCancel: false,
      isReturn: i % 10 === 0,
      cancelDate: "",
      orderType: "Клиентский",
      sticker: `STICKER${i}`,
      gNumber: `G${i}`,
      srid: `SR${i}`
    }));
  } catch (error) {
    console.error("Error fetching Wildberries orders:", error);
    throw error;
  }
};

// Mock implementation of sales fetching
export const fetchWildberriesSales = async (apiKey: string, dateFrom: Date) => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock sales data
    return Array.from({ length: 20 }, (_, i) => ({
      date: new Date(dateFrom.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
      lastChangeDate: new Date().toISOString(),
      warehouseName: ["Московский склад", "Санкт-Петербургский склад", "Новосибирский склад"][Math.floor(Math.random() * 3)],
      warehouseType: "Федеральный",
      countryName: "Россия",
      oblastOkrugName: ["Центральный", "Северо-Западный", "Сибирский"][Math.floor(Math.random() * 3)],
      regionName: ["Москва и область", "Ленинградская область", "Новосибирская область"][Math.floor(Math.random() * 3)],
      supplierArticle: `A${100000 + i}`,
      nmId: 1000000 + i,
      barcode: `2000000${i}`,
      category: ["Одежда", "Обувь", "Аксессуары"][Math.floor(Math.random() * 3)],
      subject: ["Футболки", "Джинсы", "Куртки"][Math.floor(Math.random() * 3)],
      brand: ["Бренд А", "Бренд Б", "Бренд В"][Math.floor(Math.random() * 3)],
      techSize: ["S", "M", "L", "XL"][Math.floor(Math.random() * 4)],
      incomeID: 3000000 + i,
      isSupply: true,
      isRealization: true,
      totalPrice: Math.floor(Math.random() * 5000) + 1000,
      discountPercent: Math.floor(Math.random() * 30),
      spp: Math.floor(Math.random() * 10),
      paymentSaleAmount: Math.floor(Math.random() * 4000) + 800,
      forPay: Math.floor(Math.random() * 3500) + 700,
      finishedPrice: Math.floor(Math.random() * 4000) + 800,
      priceWithDisc: Math.floor(Math.random() * 4500) + 900,
      isReturn: i % 10 === 0,
      saleID: `SALE${i}`,
      orderType: "Клиентский",
      sticker: `STICKER${i}`,
      gNumber: `G${i}`,
      srid: `SR${i}`
    }));
  } catch (error) {
    console.error("Error fetching Wildberries sales:", error);
    throw error;
  }
};
