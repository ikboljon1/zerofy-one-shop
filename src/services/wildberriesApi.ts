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
  expenses: number;
  netProfit: number;
}

export const fetchWildberriesStats = async (apiKey: string): Promise<WildberriesResponse> => {
  try {
    const dateFrom = new Date();
    dateFrom.setMonth(dateFrom.getMonth() - 1);
    const dateTo = new Date();

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

    // Рассчитываем общие показатели
    const sales = salesData.reduce((sum, item) => sum + (item.retail_amount || 0), 0);
    const transferred = salesData.reduce((sum, item) => sum + (item.ppvz_for_pay || 0), 0);
    
    // Суммируем все расходы
    const expenses = salesData.reduce((sum, item) => {
      return sum + 
        (item.ppvz_sales_commission || 0) +
        (item.delivery_rub || 0) +
        (item.storage_fee || 0) +
        (item.penalty || 0) +
        (item.additional_payment || 0) +
        (item.acquiring_fee || 0) +
        (item.deduction || 0);
    }, 0);

    // Рассчитываем чистую прибыль
    const netProfit = transferred - expenses;

    return {
      sales,
      transferred,
      expenses,
      netProfit
    };
  } catch (error) {
    console.error('Error fetching Wildberries stats:', error);
    throw new Error('Failed to fetch Wildberries statistics');
  }
};