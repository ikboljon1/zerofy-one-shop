import { demoData, demoReportData, demoOrdersData, demoSalesData } from "./demoData";

// Export WildberriesResponse type for use in other files
export interface WildberriesResponse {
  currentPeriod: {
    sales: number;
    transferred: number;
    expenses: {
      total: number;
      logistics: number;
      storage: number;
      penalties: number;
      advertising: number;
      acceptance: number;
      deductions?: number;
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
  deductionsData?: Array<{
    name: string;
    value: number;
    count?: number;
    isNegative?: boolean;
    items?: Array<{
      nm_id?: string | number;
      bonus_type_name?: string;
      value: number;
    }>;
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
  orders?: Array<any>;
  sales?: Array<any>;
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

// Fetch Wildberries statistics
export const fetchWildberriesStats = async (apiKey: string, dateFrom: Date, dateTo: Date): Promise<WildberriesResponse> => {
  console.log('Fetching Wildberries statistics for period:', { 
    dateFrom: dateFrom.toISOString(), 
    dateTo: dateTo.toISOString() 
  });
  
  try {
    const formattedDateFrom = dateFrom.toISOString().split('T')[0];
    const formattedDateTo = dateTo.toISOString().split('T')[0];
    
    // Fetch report data with pagination - similar to the Python code
    let allData = [];
    let nextRrdId = 0;
    let hasMoreData = true;
    
    while (hasMoreData) {
      console.log(`Fetching report data with rrdid=${nextRrdId}`);
      
      const url = new URL("https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod");
      url.searchParams.append("dateFrom", formattedDateFrom);
      url.searchParams.append("dateTo", formattedDateTo);
      url.searchParams.append("limit", "100000");
      if (nextRrdId > 0) {
        url.searchParams.append("rrdid", nextRrdId.toString());
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          "Authorization": apiKey
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching report data:', errorText);
        throw new Error(`API Error: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        console.log('No more data to fetch');
        hasMoreData = false;
      } else {
        console.log(`Fetched ${data.length} records`);
        allData = [...allData, ...data];
        
        // Get the next rrd_id for pagination from the last record
        const lastRecord = data[data.length - 1];
        nextRrdId = lastRecord?.rrd_id || 0;
        
        if (nextRrdId === 0) {
          console.log('No more pages (rrd_id is 0)');
          hasMoreData = false;
        } else {
          console.log(`Next rrd_id: ${nextRrdId}`);
        }
      }
    }
    
    console.log(`Total records fetched: ${allData.length}`);
    
    if (allData.length === 0) {
      console.warn('No data returned from Wildberries API, using demo data');
      return getDemoData();
    }
    
    // Process the data
    const processedData = processReportData(allData);
    return processedData;
  } catch (error) {
    console.error('Error fetching Wildberries statistics:', error);
    return getDemoData();
  }
};

// Process report data to extract useful statistics
const processReportData = (reportData: any[]): WildberriesResponse => {
  console.log(`Processing ${reportData.length} records from Wildberries API`);
  
  // Initialize metrics
  let totalSales = 0;
  let totalDelivery = 0;
  let totalCommission = 0;
  let totalStorageFee = 0;
  let totalTax = 0;
  let totalReturns = 0;
  let totalPenalty = 0;
  let totalDeduction = 0;
  let totalToPay = 0;
  let totalAcceptance = 0;
  let totalReturnCount = 0;
  
  // Tracking records by type
  let salesRecordsCount = 0;
  let returnRecordsCount = 0;
  let penaltyRecordsCount = 0;
  let deductionRecordsCount = 0;
  
  // Daily sales data
  const salesByDay: Record<string, { sales: number; previousSales: number }> = {};
  
  // Product data
  const salesByProduct: Record<string, number> = {};
  const returnsByProduct: Record<string, { value: number; count: number }> = {};
  const penaltiesByReason: Record<string, number> = {};
  
  // Structure for deductions - similar to the Python code
  const deductionsByReason: Record<string, { 
    total: number; 
    items: Array<{
      nm_id?: string | number; 
      bonus_type_name?: string;
      value: number
    }> 
  }> = {};

  const productProfitability: Record<string, { 
    quantity: number;
    sales: number;
    profit: number;
    returns: number;
    price: number;
    name: string;
    image: string;
  }> = {};
  
  // Process each record
  reportData.forEach(record => {
    // Append to total payment
    if (record.ppvz_for_pay !== undefined) {
      totalToPay += record.ppvz_for_pay;
    }
    
    // Process sales records
    if (record.doc_type_name === 'Продажа') {
      salesRecordsCount++;
      
      // Update sales totals
      totalSales += record.retail_price_withdisc_rub || 0;
      totalDelivery += record.delivery_rub || 0;
      totalCommission += record.commission_fee || 0;
      
      // Format date for daily sales chart
      const saleDate = record.date_from.split('T')[0];
      if (!salesByDay[saleDate]) {
        salesByDay[saleDate] = { sales: 0, previousSales: 0 };
      }
      salesByDay[saleDate].sales += record.retail_price_withdisc_rub || 0;
      
      // Update product sales
      const productName = record.subject_name || 'Unknown';
      if (!salesByProduct[productName]) {
        salesByProduct[productName] = 0;
      }
      salesByProduct[productName] += 1;
      
      // Track product profitability
      const productKey = record.sa_name || record.subject_name || record.nm_id.toString();
      if (!productProfitability[productKey]) {
        productProfitability[productKey] = {
          quantity: 0,
          sales: 0,
          profit: 0,
          returns: 0,
          price: 0,
          name: record.sa_name || record.subject_name || `Артикул ${record.nm_id}`,
          image: record.wb_image || ''
        };
      }
      
      productProfitability[productKey].quantity += 1;
      productProfitability[productKey].sales += record.retail_price_withdisc_rub || 0;
      productProfitability[productKey].profit += record.ppvz_for_pay || 0;
      productProfitability[productKey].price = record.retail_price || 0;
    }
    
    // Process returns
    if (record.doc_type_name === 'Возврат' || record.quantity < 0) {
      returnRecordsCount++;
      totalReturns += record.retail_price_withdisc_rub || 0;
      totalReturnCount++;
      
      const productName = record.subject_name || record.sa_name || `Артикул ${record.nm_id}`;
      if (!returnsByProduct[productName]) {
        returnsByProduct[productName] = { value: 0, count: 0 };
      }
      returnsByProduct[productName].value += Math.abs(record.retail_price_withdisc_rub || 0);
      returnsByProduct[productName].count += 1;
      
      // Update profitability with returns
      const productKey = record.sa_name || record.subject_name || record.nm_id.toString();
      if (productProfitability[productKey]) {
        productProfitability[productKey].returns += 1;
      }
    }
    
    // Process storage fees
    if (record.storage_fee && record.storage_fee !== 0) {
      totalStorageFee += record.storage_fee;
    }
    
    // Process store acceptance fees
    if (record.acceptance_fee && record.acceptance_fee !== 0) {
      totalAcceptance += record.acceptance_fee;
    }
    
    // Process penalties
    if (record.penalty && record.penalty !== 0) {
      penaltyRecordsCount++;
      const reason = record.penalty_reason || 'Прочие штрафы';
      
      if (!penaltiesByReason[reason]) {
        penaltiesByReason[reason] = 0;
      }
      penaltiesByReason[reason] += record.penalty;
      totalPenalty += record.penalty;
    }
    
    // Process deductions - improved to match Python example
    if (record.deduction !== undefined && record.deduction !== null) {
      deductionRecordsCount++;
      
      const reason = record.bonus_type_name || 'Прочие удержания';
      
      if (!deductionsByReason[reason]) {
        deductionsByReason[reason] = { total: 0, items: [] };
      }
      
      deductionsByReason[reason].total += record.deduction;
      
      deductionsByReason[reason].items.push({
        nm_id: record.nm_id || record.shk || '',
        bonus_type_name: record.bonus_type_name || 'Неизвестно',
        value: record.deduction
      });
      
      totalDeduction += record.deduction;
      
      console.log(`Deduction record: bonus_type_name=${reason}, nm_id=${record.nm_id || 'N/A'}, value=${record.deduction}`);
    }
  });
  
  console.log("Sales records processed:", salesRecordsCount);
  console.log("Return records processed:", returnRecordsCount);
  console.log("Penalty records processed:", penaltyRecordsCount);
  console.log("Deduction records processed:", deductionRecordsCount);
  console.log("Deduction types detected:", Object.keys(deductionsByReason));
  console.log("Total deduction amount:", totalDeduction);

  // Convert deductions data for display
  const deductionsData = Object.entries(deductionsByReason).map(([name, data]) => ({
    name,
    value: Math.round(Math.abs(data.total) * 100) / 100,
    count: data.items.length,
    isNegative: data.total < 0,
    // Include itemized deductions for detailed view
    items: data.items.map(item => ({
      nm_id: item.nm_id,
      bonus_type_name: item.bonus_type_name,
      value: Math.round(item.value * 100) / 100
    }))
  })).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  console.log("Deductions data processed:", deductionsData);

  // Format daily sales data for chart
  const dailySalesData = Object.entries(salesByDay).map(([date, data]) => ({
    date,
    sales: Math.round(data.sales * 100) / 100,
    previousSales: Math.round(data.previousSales * 100) / 100
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Format product sales data
  const productSalesData = Object.entries(salesByProduct).map(([name, quantity]) => ({
    subject_name: name,
    quantity
  })).sort((a, b) => b.quantity - a.quantity);
  
  // Format return data
  const returnsData = Object.entries(returnsByProduct).map(([name, data]) => ({
    name,
    value: Math.round(data.value * 100) / 100,
    count: data.count
  })).sort((a, b) => b.value - a.value);
  
  // Format penalties data
  const penaltiesData = Object.entries(penaltiesByReason).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100
  })).sort((a, b) => b.value - a.value);
  
  // Calculate top profitable and unprofitable products
  const profitabilityData = Object.values(productProfitability)
    .filter(product => product.quantity > 0)
    .map(product => {
      const grossProfit = product.profit;
      const costPerItem = 0; // This would need to be sourced from somewhere
      const netProfit = grossProfit - (product.quantity * costPerItem);
      const margin = product.sales > 0 ? (netProfit / product.sales) * 100 : 0;
      
      return {
        name: product.name,
        price: `${Math.round(product.price * 100) / 100} ₽`,
        profit: `${Math.round(grossProfit * 100) / 100} ₽`,
        margin: Math.round(margin * 10) / 10,
        quantitySold: product.quantity,
        returnCount: product.returns,
        image: product.image || 'https://via.placeholder.com/150'
      };
    });
  
  const topProfitable = profitabilityData
    .sort((a, b) => parseFloat(b.profit.replace('₽', '').trim()) - parseFloat(a.profit.replace('₽', '').trim()))
    .slice(0, 5);
  
  const topUnprofitable = profitabilityData
    .sort((a, b) => parseFloat(a.profit.replace('₽', '').trim()) - parseFloat(b.profit.replace('₽', '').trim()))
    .slice(0, 5);
  
  return {
    currentPeriod: {
      sales: Math.round(totalSales * 100) / 100,
      transferred: Math.round(totalToPay * 100) / 100,
      expenses: {
        total: Math.round((totalDelivery + totalStorageFee + totalPenalty + totalAcceptance + Math.abs(totalDeduction)) * 100) / 100,
        logistics: Math.round(totalDelivery * 100) / 100,
        storage: Math.round(totalStorageFee * 100) / 100,
        penalties: Math.round(totalPenalty * 100) / 100,
        acceptance: Math.round(totalAcceptance * 100) / 100,
        deductions: Math.round(Math.abs(totalDeduction) * 100) / 100,
        advertising: 0 // Will be filled later
      },
      netProfit: Math.round((totalToPay - totalDelivery - totalStorageFee - totalPenalty - totalAcceptance - Math.abs(totalDeduction)) * 100) / 100,
      acceptance: Math.round(totalAcceptance * 100) / 100
    },
    dailySales: dailySalesData,
    productSales: productSalesData,
    productReturns: returnsData,
    topProfitableProducts: topProfitable,
    topUnprofitableProducts: topUnprofitable,
    penaltiesData: penaltiesData,
    deductionsData: deductionsData
  };
};

// Fetch Wildberries Orders
export const fetchWildberriesOrders = async (apiKey: string, dateFrom: Date): Promise<any[]> => {
  console.log('Fetching Wildberries orders for period starting:', dateFrom.toISOString());
  try {
    // Implementation would be similar to fetchWildberriesStats
    // For now, return demo data
    return demoOrdersData;
  } catch (error) {
    console.error('Error fetching Wildberries orders:', error);
    return demoOrdersData;
  }
};

// Fetch Wildberries Sales
export const fetchWildberriesSales = async (apiKey: string, dateFrom: Date): Promise<any[]> => {
  console.log('Fetching Wildberries sales for period starting:', dateFrom.toISOString());
  try {
    // Implementation would be similar to fetchWildberriesStats
    // For now, return demo data
    return demoSalesData;
  } catch (error) {
    console.error('Error fetching Wildberries sales:', error);
    return demoSalesData;
  }
};

// Dummy function to get demo data
const getDemoData = (): WildberriesResponse => {
  console.log('Using demo data');
  return demoData;
};
