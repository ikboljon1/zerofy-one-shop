import axios from 'axios';

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
}

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const formatDateRFC3339 = (date: Date, isEnd: boolean = false): string => {
  const formattedDate = date.toISOString().split('T')[0];
  return isEnd ? `${formattedDate}T23:59:59` : `${formattedDate}T00:00:00`;
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

  let totalSales = 0;          // Продажа
  let totalForPay = 0;         // К перечислению за товар
  let totalDeliveryRub = 0;    // Стоимость логистики
  let totalRebillLogisticCost = 0; // Логистика (возмещение издержек)
  let totalStorageFee = 0;     // Стоимость хранения
  let totalReturns = 0;        // Возврат
  let totalPenalty = 0;        // Штрафы
  let totalDeduction = 0;      // Удержания
  let totalToPay = 0;          // Итого к оплате
  let totalReturnCount = 0;    // Количество возвратов
  
  const returnsByProduct: Record<string, { value: number; count: number }> = {};
  
  const productProfitability: Record<string, { 
    name: string;
    price: number;
    sales: number;
    costs: number;
    profit: number;
    image: string;
    count: number;
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
            count: 0
          };
        }
        
        productProfitability[productName].sales += record.ppvz_for_pay || 0;
        productProfitability[productName].costs += (record.delivery_rub || 0) + 
                                                  (record.storage_fee || 0) + 
                                                  (record.penalty || 0);
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
            count: 0
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
    
    totalDeliveryRub += record.delivery_rub || 0;
    totalRebillLogisticCost += record.rebill_logistic_cost || 0;
    totalStorageFee += record.storage_fee || 0;
    totalPenalty += record.penalty || 0;
    totalDeduction += record.deduction || 0;
  }
  
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
    image: item.image || "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg"
  }));
  
  const sortedByLoss = [...productProfitabilityArray].sort((a, b) => a.profit - b.profit);
  
  const topUnprofitableProducts = sortedByLoss.slice(0, 3).map(item => ({
    name: item.name,
    price: item.price.toString(),
    profit: item.profit.toString(),
    image: item.image || "https://storage.googleapis.com/a1aa/image/OVMl1GnzKz6bgDAEJKScyzvR2diNKk-j6FoazEY-XRI.jpg"
  }));
  
  const productReturns = Object.entries(returnsByProduct)
    .map(([name, { value, count }]) => ({ name, value, count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  
  console.log(`Received and processed data. Total returns: ${Math.abs(totalReturns)}, Returned items count: ${totalReturnCount}, Returned products count: ${productReturns.length}`);
  console.log(`Calculated top profitable products: ${topProfitableProducts.length}, Top unprofitable products: ${topUnprofitableProducts.length}`);
  
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
    productReturns,
    topProfitableProducts,
    topUnprofitableProducts,
    dailySales: []
  };
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
    
    if (!reportData || reportData.length === 0) {
      console.log('No data received from Wildberries API, using demo data');
      return getDemoData();
    }
    
    const result = calculateMetrics(reportData, paidAcceptanceData);
    
    if (!result || !result.metrics) {
      console.log('Failed to calculate metrics, using demo data');
      return getDemoData();
    }
    
    const { metrics, productReturns } = result;
    
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
    
    const response: WildberriesResponse = {
      currentPeriod: {
        sales: metrics.total_sales,
        transferred: metrics.total_to_pay,
        expenses: {
          total: metrics.total_delivery_rub + metrics.total_storage_fee + metrics.total_penalty + metrics.total_acceptance,
          logistics: metrics.total_delivery_rub,
          storage: metrics.total_storage_fee,
          penalties: metrics.total_penalty,
          acceptance: metrics.total_acceptance,
          advertising: 0
        },
        netProfit: metrics.total_to_pay,
        acceptance: metrics.total_acceptance
      },
      dailySales,
      productSales,
      productReturns,
      topProfitableProducts: [],
      topUnprofitableProducts: []
    };
    
    console.log(`Received and processed data from Wildberries API. Total returns: ${metrics.total_returns}, Return count: ${metrics.total_return_count}`);
    
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
      { subject_name: "Платья", quantity: 6 },
      { subject_name: "Свитшоты", quantity: 4 },
      { subject_name: "Лонгсливы", quantity: 3 },
      { subject_name: "Костюмы спортивные", quantity: 1 }
    ],
    productReturns: [
      { name: "Костюм женский спортивный", value: 12000 },
      { name: "Платье летнее", value: 8500 },
      { name: "Футболка мужская", value: 6300 },
      { name: "Джинсы классические", value: 4200 },
      { name: "Куртка зимняя", value: 3000 }
    ],
    topProfitableProducts: [
      { name: "Костюм женский спортивный", price: "3200", profit: "25000", image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg" },
      { name: "Платье летнее", price: "1200", profit: "18000", image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg" },
      { name: "Джинсы классические", price: "2800", profit: "15500", image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg" }
    ],
    topUnprofitableProducts: [
      { name: "Шарф зимний", price: "800", profit: "-5200", image: "https://storage.googleapis.com/a1aa/image/OVMl1GnzKz6bgDAEJKScyzvR2diNKk-j6FoazEY-XRI.jpg" },
      { name: "Рубашка офисная", price: "1500", profit: "-3800", image: "https://storage.googleapis.com/a1aa/image/OVMl1GnzKz6bgDAEJKScyzvR2diNKk-j6FoazEY-XRI.jpg" },
      { name: "Перчатки кожаные", price: "1200", profit: "-2900", image: "https://storage.googleapis.com/a1aa/image/OVMl1GnzKz6bgDAEJKScyzvR2diNKk-j6FoazEY-XRI.jpg" }
    ]
  };
};
