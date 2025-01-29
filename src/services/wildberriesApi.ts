interface WildberriesReportItem {
  realizationreport_id: number;
  date_from: string;
  date_to: string;
  nm_id: number;
  quantity: number;
  retail_price: number;
  retail_amount: number;
  ppvz_for_pay: number;
  ppvz_sales_commission: number;
  delivery_rub: number;
  penalty: number;
  storage_fee: number;
  additional_payment: number;
  acquiring_fee: number;
  deduction: number;
  acceptance: number;
}

interface WildberriesResponse {
  sales: number;
  transferred: number;
  expenses: {
    total: number;
    commission: number;
    logistics: number;
    storage: number;
    penalties: number;
    additional: number;
    acquiring: number;
    deductions: number;
  };
  netProfit: number;
  acceptance: number;
}

export const fetchWildberriesStats = async (
  apiKey: string, 
  dateFrom: Date, 
  dateTo: Date
): Promise<WildberriesResponse> => {
  try {
    const url = new URL('https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod');
    url.searchParams.append('dateFrom', dateFrom.toISOString());
    url.searchParams.append('dateTo', dateTo.toISOString());
    url.searchParams.append('limit', '100000');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': apiKey
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Wildberries statistics');
    }

    const data: WildberriesReportItem[] = await response.json();

    // Фильтруем только продажи
    const salesData = data.filter(item => item.quantity > 0);

    // Группируем данные по товарам для правильного расчета
    const groupedData = salesData.reduce((acc, item) => {
      if (!acc[item.nm_id]) {
        acc[item.nm_id] = [];
      }
      acc[item.nm_id].push(item);
      return acc;
    }, {} as Record<number, WildberriesReportItem[]>);

    let totalSales = 0;
    let totalTransferred = 0;
    let totalCommission = 0;
    let totalLogistics = 0;
    let totalStorage = 0;
    let totalPenalties = 0;
    let totalAdditional = 0;
    let totalAcquiring = 0;
    let totalDeductions = 0;
    let totalAcceptance = 0;

    // Обрабатываем каждую группу товаров
    Object.values(groupedData).forEach(group => {
      const calculatedSales = group.reduce((sum, item) => 
        sum + (item.retail_price * item.quantity), 0);
      
      totalSales += calculatedSales;
      totalTransferred += group.reduce((sum, item) => sum + (item.ppvz_for_pay || 0), 0);
      totalCommission += group.reduce((sum, item) => sum + (item.ppvz_sales_commission || 0), 0);
      totalLogistics += group.reduce((sum, item) => sum + (item.delivery_rub || 0), 0);
      totalStorage += group.reduce((sum, item) => sum + (item.storage_fee || 0), 0);
      totalPenalties += group.reduce((sum, item) => sum + (item.penalty || 0), 0);
      totalAdditional += group.reduce((sum, item) => sum + (item.additional_payment || 0), 0);
      totalAcquiring += group.reduce((sum, item) => sum + (item.acquiring_fee || 0), 0);
      totalDeductions += group.reduce((sum, item) => sum + (item.deduction || 0), 0);
      totalAcceptance += group.reduce((sum, item) => sum + (item.acceptance || 0), 0);
    });

    const totalExpenses = totalCommission + totalLogistics + totalStorage + 
                         totalPenalties + totalAdditional + totalAcquiring + 
                         totalDeductions;

    return {
      sales: totalSales,
      transferred: totalTransferred,
      expenses: {
        total: totalExpenses,
        commission: totalCommission,
        logistics: totalLogistics,
        storage: totalStorage,
        penalties: totalPenalties,
        additional: totalAdditional,
        acquiring: totalAcquiring,
        deductions: totalDeductions
      },
      netProfit: totalTransferred - totalExpenses + totalAcceptance,
      acceptance: totalAcceptance
    };
  } catch (error) {
    console.error('Error fetching Wildberries stats:', error);
    throw new Error('Failed to fetch Wildberries statistics');
  }
};