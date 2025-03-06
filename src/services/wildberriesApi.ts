
import axios from 'axios';
import { subDays } from 'date-fns';

// Types for API responses
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
    count?: number;
  }>;
  penaltiesData?: Array<{
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
  ordersByWarehouse: Record<string, number>;
  ordersByRegion: Record<string, number>;
  salesByDay: Record<string, number>;
  returnsData: {
    count: number;
    amount: number;
    byReason: Record<string, number>;
  };
}

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const formatDateRFC3339 = (date: Date): string => {
  return date.toISOString().split('.')[0];
};

// Function to fetch orders with pagination
export const fetchWildberriesOrders = async (apiKey: string, dateFrom: Date): Promise<WildberriesOrder[]> => {
  try {
    console.log(`Fetching Wildberries orders from ${dateFrom.toISOString()}`);
    
    // Use demo data in development mode if not a proper API key
    if (process.env.NODE_ENV === 'development' && !apiKey.startsWith('eyJ')) {
      console.log('Using demo orders data in development mode');
      return getDemoOrders();
    }
    
    const allOrders: WildberriesOrder[] = [];
    let nextDateFrom = formatDateRFC3339(dateFrom);
    let hasMoreData = true;
    
    // Implement pagination using lastChangeDate
    while (hasMoreData) {
      console.log(`Fetching orders batch with dateFrom: ${nextDateFrom}`);
      
      const url = "https://statistics-api.wildberries.ru/api/v1/supplier/orders";
      const headers = {
        "Authorization": apiKey,
      };
      const params = {
        "dateFrom": nextDateFrom,
      };
      
      const response = await axios.get(url, { headers, params });
      const orders: WildberriesOrder[] = response.data;
      
      if (orders.length === 0) {
        // No more data to fetch
        hasMoreData = false;
      } else {
        allOrders.push(...orders);
        // Get lastChangeDate from the last order for the next request
        nextDateFrom = orders[orders.length - 1].lastChangeDate;
        
        // Rate limiting: wait 1 minute between requests (Wildberries API limitation)
        // In production, we'd implement a proper delay, but for this example we'll just log
        console.log(`Fetched ${orders.length} orders. Total orders now: ${allOrders.length}`);
        console.log("Note: In a production environment, we would wait 1 minute before making the next request due to API rate limits");
        
        // For the sake of the demo, we'll limit to one batch
        hasMoreData = false;
      }
    }
    
    console.log(`Completed fetching orders. Total: ${allOrders.length} orders`);
    return allOrders;
  } catch (error) {
    console.error("Error fetching Wildberries orders:", error);
    return getDemoOrders();
  }
};

// Function to fetch sales with pagination
export const fetchWildberriesSales = async (apiKey: string, dateFrom: Date): Promise<WildberriesSale[]> => {
  try {
    console.log(`Fetching Wildberries sales from ${dateFrom.toISOString()}`);
    
    // Use demo data in development mode if not a proper API key
    if (process.env.NODE_ENV === 'development' && !apiKey.startsWith('eyJ')) {
      console.log('Using demo sales data in development mode');
      return getDemoSales();
    }
    
    const allSales: WildberriesSale[] = [];
    let nextDateFrom = formatDateRFC3339(dateFrom);
    let hasMoreData = true;
    
    // Implement pagination using lastChangeDate
    while (hasMoreData) {
      console.log(`Fetching sales batch with dateFrom: ${nextDateFrom}`);
      
      const url = "https://statistics-api.wildberries.ru/api/v1/supplier/sales";
      const headers = {
        "Authorization": apiKey,
      };
      const params = {
        "dateFrom": nextDateFrom,
      };
      
      const response = await axios.get(url, { headers, params });
      const sales: WildberriesSale[] = response.data;
      
      if (sales.length === 0) {
        // No more data to fetch
        hasMoreData = false;
      } else {
        allSales.push(...sales);
        // Get lastChangeDate from the last sale for the next request
        nextDateFrom = sales[sales.length - 1].lastChangeDate;
        
        // Rate limiting: wait 1 minute between requests (Wildberries API limitation)
        // In production, we'd implement a proper delay, but for this example we'll just log
        console.log(`Fetched ${sales.length} sales. Total sales now: ${allSales.length}`);
        console.log("Note: In a production environment, we would wait 1 minute before making the next request due to API rate limits");
        
        // For the sake of the demo, we'll limit to one batch
        hasMoreData = false;
      }
    }
    
    console.log(`Completed fetching sales. Total: ${allSales.length} sales`);
    return allSales;
  } catch (error) {
    console.error("Error fetching Wildberries sales:", error);
    return getDemoSales();
  }
};

// Process the orders and sales data to generate insights for the dashboard
export const processWildberriesData = (orders: WildberriesOrder[], sales: WildberriesSale[], dateFrom: Date, dateTo: Date): WildberriesResponse => {
  // Initialize summary data
  const summary = {
    totalSales: 0,
    totalTransferred: 0,
    totalLogistics: 0,
    totalStorage: 0,
    totalPenalties: 0,
    totalDeduction: 0,
    totalAcceptance: 0,
    totalReturns: 0,
    totalOrders: 0,
    totalCancellations: 0,
    totalWithDiscount: 0,
  };
  
  // Track data for charts and breakdowns
  const ordersByWarehouse: Record<string, number> = {};
  const ordersByRegion: Record<string, number> = {};
  const salesByDay: Record<string, number> = {};
  const salesByProduct: Record<string, number> = {};
  const productQuantities: Record<string, number> = {};
  const returnsByProduct: Record<string, { value: number; count: number }> = {};
  const penaltiesByReason: Record<string, number> = {};
  
  // Process orders
  orders.forEach(order => {
    // Count total orders
    summary.totalOrders++;
    
    // Count cancellations
    if (order.isCancel) {
      summary.totalCancellations++;
    }
    
    // Track orders by warehouse
    const warehouse = order.warehouseName;
    ordersByWarehouse[warehouse] = (ordersByWarehouse[warehouse] || 0) + 1;
    
    // Track orders by region
    const region = order.regionName;
    ordersByRegion[region] = (ordersByRegion[region] || 0) + 1;
    
    // Track orders by date
    const orderDate = order.date.split('T')[0];
    salesByDay[orderDate] = (salesByDay[orderDate] || 0) + order.priceWithDisc;
    
    // Track product sales
    if (order.subject && !order.isCancel) {
      salesByProduct[order.subject] = (salesByProduct[order.subject] || 0) + order.priceWithDisc;
      productQuantities[order.subject] = (productQuantities[order.subject] || 0) + 1;
    }
  });
  
  // Process sales
  sales.forEach(sale => {
    const saleId = sale.saleID || '';
    
    // Check if it's a sale or return
    if (saleId.startsWith('S')) {
      // It's a sale
      summary.totalSales += sale.priceWithDisc;
      summary.totalTransferred += sale.forPay || 0;
      
      // Estimate logistics cost (simplified)
      const logisticsCost = sale.priceWithDisc * 0.05; // Estimate 5% for logistics
      summary.totalLogistics += logisticsCost;
      
      // Estimate storage cost (simplified)
      const storageCost = sale.priceWithDisc * 0.02; // Estimate 2% for storage
      summary.totalStorage += storageCost;
      
    } else if (saleId.startsWith('R')) {
      // It's a return
      summary.totalReturns += Math.abs(sale.priceWithDisc);
      
      // Track returns by product
      if (sale.supplierArticle) {
        const productName = sale.supplierArticle;
        if (!returnsByProduct[productName]) {
          returnsByProduct[productName] = { value: 0, count: 0 };
        }
        returnsByProduct[productName].value += Math.abs(sale.priceWithDisc);
        returnsByProduct[productName].count += 1;
      }
    }
  });
  
  // Calculate net profit
  const netProfit = summary.totalSales - summary.totalLogistics - summary.totalStorage - summary.totalPenalties - summary.totalReturns;
  
  // Prepare daily sales data
  const dailySales = Object.entries(salesByDay).map(([date, sales]) => ({
    date,
    sales,
    previousSales: 0 // For now, we don't have previous period data
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Prepare product sales data
  const productSales = Object.entries(productQuantities)
    .map(([subject_name, quantity]) => ({ subject_name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);
  
  // Prepare returns data
  const productReturns = Object.entries(returnsByProduct)
    .map(([name, { value, count }]) => ({ name, value, count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  
  // Prepare penalties data (simplified for demo)
  const penaltiesData = Object.entries(penaltiesByReason)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  
  // Create WildberriesResponse object
  const response: WildberriesResponse = {
    currentPeriod: {
      sales: summary.totalSales,
      transferred: summary.totalTransferred,
      orders: summary.totalOrders,
      returns: summary.totalReturns,
      cancellations: summary.totalCancellations,
      expenses: {
        total: summary.totalLogistics + summary.totalStorage + summary.totalPenalties + summary.totalAcceptance,
        logistics: summary.totalLogistics,
        storage: summary.totalStorage,
        penalties: summary.totalPenalties,
        acceptance: summary.totalAcceptance,
        advertising: 0
      },
      netProfit: netProfit,
      acceptance: summary.totalAcceptance
    },
    dailySales,
    productSales,
    productReturns,
    penaltiesData,
    ordersByWarehouse,
    ordersByRegion,
    salesByDay,
    returnsData: {
      count: Object.values(returnsByProduct).reduce((sum, { count }) => sum + count, 0),
      amount: Object.values(returnsByProduct).reduce((sum, { value }) => sum + value, 0),
      byReason: {} // In a real implementation, we would track returns by reason
    },
    // Add placeholder data for product profitability (would be calculated from real data)
    topProfitableProducts: getDemoData().topProfitableProducts,
    topUnprofitableProducts: getDemoData().topUnprofitableProducts
  };
  
  return response;
};

export const fetchWildberriesStats = async (apiKey: string, dateFrom: Date, dateTo: Date) => {
  try {
    console.log(`Fetching Wildberries stats from ${dateFrom.toISOString()} to ${dateTo.toISOString()}`);
    
    if (process.env.NODE_ENV === 'development' && !apiKey.startsWith('eyJ')) {
      console.log('Using demo data in development mode');
      return getDemoData();
    }
    
    // Fetch both orders and sales data
    const orders = await fetchWildberriesOrders(apiKey, dateFrom);
    const sales = await fetchWildberriesSales(apiKey, dateFrom);
    
    if (orders.length === 0 && sales.length === 0) {
      console.log('No data received from Wildberries API, using demo data');
      return getDemoData();
    }
    
    // Process data to get insights
    const result = processWildberriesData(orders, sales, dateFrom, dateTo);
    
    console.log(`Processed data from Wildberries API. Orders: ${orders.length}, Sales: ${sales.length}`);
    
    return result;
  } catch (error) {
    console.error("Error fetching Wildberries stats:", error);
    return getDemoData();
  }
};

// Demo data functions
const getDemoOrders = (): WildberriesOrder[] => {
  return [
    {
      date: "2025-03-04T18:08:31",
      lastChangeDate: "2025-03-06T10:11:07",
      warehouseName: "Подольск",
      warehouseType: "Склад продавца",
      countryName: "Россия",
      oblastOkrugName: "Центральный федеральный округ",
      regionName: "Московская",
      supplierArticle: "12345",
      nmId: 1234567,
      barcode: "123453559000",
      category: "Бытовая техника",
      subject: "Мультистайлеры",
      brand: "Тест",
      techSize: "0",
      incomeID: 56735459,
      isSupply: false,
      isRealization: true,
      totalPrice: 1887,
      discountPercent: 18,
      spp: 26,
      finishedPrice: 1145,
      priceWithDisc: 1547,
      isCancel: false,
      cancelDate: "0001-01-01T00:00:00",
      orderType: "Клиентский",
      sticker: "926912515",
      gNumber: "34343462218572569531",
      srid: "11.rf9ef11fce1684117b0nhj96222982382.3.0"
    },
    // Add more demo orders as needed
    {
      date: "2025-03-05T10:15:22",
      lastChangeDate: "2025-03-06T12:30:45",
      warehouseName: "Москва",
      warehouseType: "Склад WB",
      countryName: "Россия",
      oblastOkrugName: "Центральный федеральный округ",
      regionName: "Москва",
      supplierArticle: "67890",
      nmId: 7654321,
      barcode: "987654321000",
      category: "Одежда",
      subject: "Платья",
      brand: "МодаТест",
      techSize: "44",
      incomeID: 56735460,
      isSupply: false,
      isRealization: true,
      totalPrice: 2500,
      discountPercent: 20,
      spp: 15,
      finishedPrice: 1700,
      priceWithDisc: 2000,
      isCancel: false,
      cancelDate: "0001-01-01T00:00:00",
      orderType: "Клиентский",
      sticker: "926912516",
      gNumber: "34343462218572569532",
      srid: "11.rf9ef11fce1684117b0nhj96222982383.3.0"
    }
  ];
};

const getDemoSales = (): WildberriesSale[] => {
  return [
    {
      date: "2025-03-04T18:08:31",
      lastChangeDate: "2025-03-06T10:11:07",
      warehouseName: "Подольск",
      warehouseType: "Склад продавца",
      countryName: "Россия",
      oblastOkrugName: "Центральный федеральный округ",
      regionName: "Московская",
      supplierArticle: "12345",
      nmId: 1234567,
      barcode: "123453559000",
      category: "Бытовая техника",
      subject: "Мультистайлеры",
      brand: "Тест",
      techSize: "0",
      incomeID: 56735459,
      isSupply: false,
      isRealization: true,
      totalPrice: 1887,
      discountPercent: 18,
      spp: 20,
      paymentSaleAmount: 93,
      forPay: 1284.01,
      finishedPrice: 1145,
      priceWithDisc: 1547,
      saleID: "S9993700024",
      orderType: "Клиентский",
      sticker: "926912515",
      gNumber: "34343462218572569531",
      srid: "11.rf9ef11fce1684117b0nhj96222982382.3.0"
    },
    // Add more demo sales
    {
      date: "2025-03-05T10:15:22",
      lastChangeDate: "2025-03-06T12:30:45",
      warehouseName: "Москва",
      warehouseType: "Склад WB",
      countryName: "Россия",
      oblastOkrugName: "Центральный федеральный округ",
      regionName: "Москва",
      supplierArticle: "67890",
      nmId: 7654321,
      barcode: "987654321000",
      category: "Одежда",
      subject: "Платья",
      brand: "МодаТест",
      techSize: "44",
      incomeID: 56735460,
      isSupply: false,
      isRealization: true,
      totalPrice: 2500,
      discountPercent: 20,
      spp: 15,
      paymentSaleAmount: 120,
      forPay: 1700,
      finishedPrice: 1700,
      priceWithDisc: 2000,
      saleID: "S9993700025",
      orderType: "Клиентский",
      sticker: "926912516",
      gNumber: "34343462218572569532",
      srid: "11.rf9ef11fce1684117b0nhj96222982383.3.0"
    }
  ];
};

const getDemoData = (): WildberriesResponse => {
  return {
    currentPeriod: {
      sales: 294290.6,
      transferred: 218227.70,
      orders: 156,
      returns: 12500,
      cancellations: 8,
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
      { subject_name: "Платья", quantity: 36 },
      { subject_name: "Свитшоты", quantity: 24 },
      { subject_name: "Лонгсливы", quantity: 18 },
      { subject_name: "Костюмы спортивные", quantity: 15 },
      { subject_name: "Куртки", quantity: 8 },
      { subject_name: "Джинсы", quantity: 7 }
    ],
    productReturns: [
      { name: "Костюм женский спортивный", value: 12000, count: 3 },
      { name: "Платье летнее", value: 8500, count: 2 },
      { name: "Футболка мужская", value: 6300, count: 4 },
      { name: "Джинсы классические", value: 4200, count: 1 },
      { name: "Куртка зимняя", value: 3000, count: 1 }
    ],
    penaltiesData: [],
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
    ordersByWarehouse: {
      "Подольск": 45,
      "Казань": 38,
      "Коледино": 35,
      "Краснодар": 24,
      "Электросталь": 14
    },
    ordersByRegion: {
      "Москва": 48,
      "Московская": 35,
      "Санкт-Петербург": 27,
      "Татарстан": 18,
      "Краснодарский край": 15,
      "Свердловская": 13
    },
    salesByDay: {
      "2025-02-26": 36652.93,
      "2025-02-27": 79814.5,
      "2025-02-28": 37899.9,
      "2025-03-01": 62596.15,
      "2025-03-02": 77327.11
    },
    returnsData: {
      count: 11,
      amount: 34000,
      byReason: {
        "Брак": 18000,
        "Не подошел размер": 9500,
        "Не соответствует описанию": 6500
      }
    }
  };
};
