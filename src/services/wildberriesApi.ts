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

const calculateMetrics = (data: any[], paidAcceptanceData: any[] = []) => {
  if (!data || data.length === 0) {
    return null;
  }

  let totalSales = 0;
  let totalForPay = 0;
  let totalDeliveryRub = 0;
  let totalRebillLogisticCost = 0;
  let totalStorageFee = 0;
  let totalReturns = 0;
  let totalPenalty = 0;
  let totalDeduction = 0;
  let totalToPay = 0;
  let totalReturnCount = 0;

  const returnsByProduct: Record<string, { value: number; count: number }> = {};
  const penaltiesByReason: Record<string, number> = {};
  const deductionsByReason: Record<string, number> = {}; // Добавляем учет удержаний
  const productProfitability: Record<string, { 
    name: string;
    price: number;
    sales: number;
    costs: number;
    profit: number;
    image: string;
    count: number;
    returnCount: number;
  }> = {};

  for (const record of data) {
    if (record.doc_type_name === 'Продажа') {
      totalSales += record.retail_price_withdisc_rub || 0;
      totalForPay += record.ppvz_for_pay || 0;
      
      if (record.sa_name) {
        const productName = record.sa_name;
        if (!productProfitability[productName]) {
          productProfitability[productName] = { 
            name: productName,
            price: record.retail_price || 0,
            sales: 0,
            costs: 0,
            profit: 0,
            image: record.pic_url || '',
            count: 0,
            returnCount: 0
          };
        }
        
        productProfitability[productName].sales += record.ppvz_for_pay || 0;
        productProfitability[productName].costs += (record.delivery_rub || 0) + 
                                                  (record.storage_fee || 0) + 
                                                  (record.penalty || 0) +
                                                  (record.deduction || 0);
        productProfitability[productName].price = record.retail_price || productProfitability[productName].price;
        if (record.pic_url && !productProfitability[productName].image) {
          productProfitability[productName].image = record.pic_url;
        }
        productProfitability[productName].count += 1;
      }
      
    } else if (record.doc_type_name === 'Возврат') {
      totalReturns += record.ppvz_for_pay || 0;
      totalReturnCount += 1;
      
      if (record.sa_name) {
        const productName = record.sa_name;
        if (!productProfitability[productName]) {
          productProfitability[productName] = { 
            name: productName,
            price: record.retail_price || 0,
            sales: 0,
            costs: 0,
            profit: 0,
            image: record.pic_url || '',
            count: 0,
            returnCount: 0
          };
        }
        
        productProfitability[productName].sales += record.ppvz_for_pay || 0;
        
        if (!returnsByProduct[productName]) {
          returnsByProduct[productName] = { value: 0, count: 0 };
        }
        returnsByProduct[productName].value += Math.abs(record.ppvz_for_pay || 0);
        returnsByProduct[productName].count += 1;
      }
    }
    
    if (record.penalty && record.penalty > 0) {
      const reason = record.penalty_reason || record.bonus_type_name || 'Другие причины';
      if (!penaltiesByReason[reason]) {
        penaltiesByReason[reason] = 0;
      }
      penaltiesByReason[reason] += record.penalty;
    }
    
    // Обработка удержаний (deduction)
    if (record.deduction && record.deduction > 0) {
      const reason = record.bonus_type_name || 'Прочие удержания';
      if (!deductionsByReason[reason]) {
        deductionsByReason[reason] = 0;
      }
      deductionsByReason[reason] += record.deduction;
      
      // Добавляем запись в таблицу штрафов для отображения удержаний
      if (!penaltiesByReason[reason]) {
        penaltiesByReason[reason] = 0;
      }
      penaltiesByReason[reason] += record.deduction;
    }
    
    totalDeliveryRub += record.delivery_rub || 0;
    totalRebillLogisticCost += record.rebill_logistic_cost || 0;
    totalStorageFee += record.storage_fee || 0;
    totalPenalty += record.penalty || 0;
    totalDeduction += record.deduction || 0;
  }

  const penaltiesData = Object.entries(penaltiesByReason).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100
  })).sort((a, b) => b.value - a.value);

  const totalAcceptance = paidAcceptanceData.reduce((sum, record) => sum + (record.total || 0), 0);

  totalToPay = totalForPay - totalDeliveryRub - totalStorageFee - totalReturns - totalPenalty - totalDeduction - totalAcceptance;

  for (const key in productProfitability) {
    productProfitability[key].profit = productProfitability[key].sales - productProfitability[key].costs;
  }

  const productProfitabilityArray = Object.values(productProfitability);

  const sortedByProfit = [...productProfitabilityArray].sort((a, b) => b.profit - a.profit);

  const topProfitableProducts = sortedByProfit.slice(0, 3).map(item => ({
    name: item.name,
    price: item.price.toString(),
    profit: item.profit.toString(),
    image: item.image || "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg",
    quantitySold: item.count || 0,
    margin: Math.round((item.profit / item.sales) * 100) || 0,
    returnCount: item.returnCount || 0,
    category: "Одежда"
  }));

  const sortedByLoss = [...productProfitabilityArray].sort((a, b) => a.profit - b.profit);

  const topUnprofitableProducts = sortedByLoss.slice(0, 3).map(item => ({
    name: item.name,
    price: item.price.toString(),
    profit: item.profit.toString(),
    image: item.image || "https://storage.googleapis.com/a1aa/image/OVMl1GnzKz6bgDAEJKScyzvR2diNKk-j6FoazEY-XRI.jpg",
    quantitySold: item.count || 0,
    margin: Math.round((item.profit / item.sales) * 100) || 0,
    returnCount: item.returnCount || 0,
    category: "Одежда"
  }));

  const productReturns = Object.entries(returnsByProduct)
    .map(([name, { value, count }]) => ({ name, value, count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  console.log(`Received and processed data. Total returns: ${Math.abs(totalReturns)}, Returned items count: ${totalReturnCount}, Returned products count: ${productReturns.length}`);
  console.log(`Calculated top profitable products: ${topProfitableProducts.length}, Top unprofitable products: ${topUnprofitableProducts.length}`);
  console.log(`Total deductions: ${totalDeduction}, Deduction reasons count: ${Object.keys(deductionsByReason).length}`);

  return {
    metrics: {
      total_sales: Math.round(totalSales * 100) / 100,
      total_for_pay: Math.round(totalForPay * 100) / 100,
      total_delivery_rub: Math.round(totalDeliveryRub * 100) / 100,
      total_rebill_logistic_cost: Math.round(totalRebillLogisticCost * 100) / 100,
      total_storage_fee: Math.round(totalStorageFee * 100) / 100,
      total_returns: Math.round(Math.abs(totalReturns) * 100) / 100,
      total_penalty: Math.round(totalPenalty * 100) / 100,
      total_deduction: Math.round(totalDeduction * 100) / 100,
      total_to_pay: Math.round(totalToPay * 100) / 100,
      total_acceptance: Math.round(totalAcceptance * 100) / 100,
      total_return_count: totalReturnCount
    },
    penaltiesData,
    productReturns,
    topProfitableProducts,
    topUnprofitableProducts,
    dailySales: []
  };
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

export const fetchWildberriesStats = async (apiKey: string, dateFrom: Date, dateTo: Date) => {
  try {
    console.log(`Fetching Wildberries stats from ${dateFrom.toISOString()} to ${dateTo.toISOString()}`);
    
    if (process.env.NODE_ENV === 'development' && !apiKey.startsWith('eyJ')) {
      console.log('Using demo data in development mode');
      return getDemoData();
    }
    
    const reportData = await fetchReportDetail(apiKey, dateFrom, dateTo);
    
    const paidAcceptanceData = await fetchPaidAcceptanceReport(apiKey, dateFrom, dateTo);
    
    const ordersData = await fetchWildberriesOrders(apiKey, dateFrom);
    const salesData = await fetchWildberriesSales(apiKey, dateFrom);
    
    if (!reportData || reportData.length === 0) {
      console.log('No data received from Wildberries API, using demo data');
      return getDemoData();
    }
    
    const result = calculateMetrics(reportData, paidAcceptanceData);
    
    if (!result || !result.metrics) {
      console.log('Failed to calculate metrics, using demo data');
      return getDemoData();
    }
    
    const { metrics, productReturns, penaltiesData } = result;
    
    const salesByCategory: Record<string, number> = {};
    for (const record of reportData) {
      if (record.doc_type_name === 'Продажа' && record.subject_name) {
        if (!salesByCategory[record.subject_name]) {
          salesByCategory[record.subject_name] = 0;
        }
        salesByCategory[record.subject_name]++;
      }
    }
    
    const productSales = Object.entries(salesByCategory)
      .map(([subject_name, quantity]) => ({ subject_name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
    
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
    
    const dailySales = Object.entries(salesByDay)
      .map(([date, { sales, previousSales }]) => ({ date, sales, previousSales }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const warehouseCounts: Record<string, number> = {};
    const totalOrders = ordersData.length;
    
    ordersData.forEach(order => {
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
    
    const regionCounts: Record<string, number> = {};
    
    ordersData.forEach(order => {
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
    
    const response: WildberriesResponse = {
      currentPeriod: {
        sales: metrics.total_sales,
        transferred: metrics.total_to_pay,
        expenses: {
          total: metrics.total_delivery_rub + metrics.total_storage_fee + metrics.total_penalty + metrics.total_acceptance + metrics.total_deduction,
          logistics: metrics.total_delivery_rub,
          storage: metrics.total_storage_fee,
          penalties: metrics.total_penalty,
          acceptance: metrics.total_acceptance,
          advertising: 0,
          deductions: metrics.total_deduction // Добавляем общую сумму удержаний
        },
        netProfit: metrics.total_to_pay,
        acceptance: metrics.total_acceptance
      },
      dailySales,
      productSales,
      productReturns,
      penaltiesData,
      topProfitableProducts: result.topProfitableProducts || [],
      topUnprofitableProducts: result.topUnprofitableProducts || [],
      orders: ordersData,
      sales: salesData,
      warehouseDistribution,
      regionDistribution
    };
    
    console.log(`Received and processed data from Wildberries API. Total returns: ${metrics.total_returns}, Return count: ${metrics.total_return_count}, Deductions: ${metrics.total_deduction}`);
    
    return response;
  } catch (error) {
    console.error("Error fetching Wildberries stats:", error);
    return getDemoData();
  }
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
      { name: "Прочие удержания", value: 7000 }, // Added deductions to penalties data
      { name: "Другие причины", value: 2500 }
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
    orders: [
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
      {
        date: "2025-03-03T14:22:45",
        lastChangeDate: "2025-03-05T09:43:21",
        warehouseName: "Коледино",
        warehouseType: "Склад WB",
        countryName: "Россия",
        oblastOkrugName: "Центральный федеральный округ",
        regionName: "Московская",
        supplierArticle: "67890",
        nmId: 7654321,
        barcode: "765432112000",
        category: "Одежда",
        subject: "Платья",
        brand: "Тест",
        techSize: "44",
        incomeID: 56735460,
        isSupply: false,
        isRealization: true,
        totalPrice: 2500,
        discountPercent: 15,
        spp: 20,
        finishedPrice: 1700,
        priceWithDisc: 2125,
        isCancel: false,
        cancelDate: "0001-01-01T00:00:00",
        orderType: "Клиентский",
        sticker: "926912516",
        gNumber: "34343462218572569532",
        srid: "11.rf9ef11fce1684117b0nhj96222982383.3.0"
      },
      {
        date: "2025-03-02T10:15:33",
        lastChangeDate: "2025-03-04T11:22:18",
        warehouseName: "Электросталь",
        warehouseType: "Склад WB",
        countryName: "Россия",
        oblastOkrugName: "Центральный федеральный округ",
        regionName: "Московская",
        supplierArticle: "11122",
        nmId: 2233445,
        barcode: "223344556000",
        category: "Аксессуары",
        subject: "Сумки",
        brand: "Тест",
        techSize: "0",
        incomeID: 56735461,
        isSupply: false,
        isRealization: true,
        totalPrice: 3200,
        discountPercent: 10,
        spp: 15,
        finishedPrice: 2448,
        priceWithDisc: 2880,
        isCancel: false,
        cancelDate: "0001-01-01T00:00:00",
        orderType: "Клиентский",
        sticker: "926912517",
        gNumber: "34343462218572569533",
        srid: "11.rf9ef11fce1684117b0nhj96222982384.3.0"
      }
    ],
    sales: [
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
      }
    ],
    warehouseDistribution: [
      {
