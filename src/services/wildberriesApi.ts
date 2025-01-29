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

export interface WildberriesResponse {
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
    url.searchParams.append('dateFrom', dateFrom.toISOString().split('T')[0]);
    url.searchParams.append('dateTo', dateTo.toISOString().split('T')[0]);
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
    
    // Filter only sales
    const salesData = data.filter(item => item.quantity > 0);

    // Calculate total expenses according to the specified formula
    const totalExpenses = salesData.reduce((sum, item) => {
      return sum + 
        (item.acceptance || 0) +
        (item.delivery_rub || 0) +
        (item.storage_fee || 0) +
        (item.penalty || 0) +
        (item.additional_payment || 0) +
        (item.deduction || 0);
    }, 0);

    // Calculate other metrics
    const totalSales = salesData.reduce((sum, item) => 
      sum + (item.retail_price * item.quantity), 0);
    
    const totalTransferred = salesData.reduce((sum, item) => 
      sum + (item.ppvz_for_pay || 0), 0);

    const totalCommission = salesData.reduce((sum, item) => 
      sum + (item.ppvz_sales_commission || 0), 0);

    const totalLogistics = salesData.reduce((sum, item) => 
      sum + (item.delivery_rub || 0), 0);

    const totalStorage = salesData.reduce((sum, item) => 
      sum + (item.storage_fee || 0), 0);

    const totalPenalties = salesData.reduce((sum, item) => 
      sum + (item.penalty || 0), 0);

    const totalAdditional = salesData.reduce((sum, item) => 
      sum + (item.additional_payment || 0), 0);

    const totalAcquiring = salesData.reduce((sum, item) => 
      sum + (item.acquiring_fee || 0), 0);

    const totalDeductions = salesData.reduce((sum, item) => 
      sum + (item.deduction || 0), 0);

    const totalAcceptance = salesData.reduce((sum, item) => 
      sum + (item.acceptance || 0), 0);

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