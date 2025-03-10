
export interface AIProvider {
  name: string;
  id: string;
  description: string;
  requiresApiKey: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  providerId: string;
  description?: string;
}

export interface AISettings {
  provider: string;
  model: string;
  apiKey: string;
  isEnabled: boolean;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'sales' | 'expenses' | 'products' | 'advertising' | 'general';
  importance: 'low' | 'medium' | 'high';
  timestamp: number;
  actionable?: boolean;
  action?: string;
}

export interface AIAnalysisRequest {
  context: {
    period: {
      from: string;
      to: string;
    };
    sales: {
      total: number;
      previousPeriod?: number;
      dailySales?: Array<{date: string; sales: number}>;
    };
    expenses: {
      total: number;
      logistics: number;
      storage: number;
      penalties: number;
      advertising: number;
      acceptance: number;
      deductions?: number;
    };
    products?: {
      topProfitable: Array<{
        name: string;
        profit: number;
        margin?: number;
        quantitySold?: number;
      }>;
      topUnprofitable: Array<{
        name: string;
        profit: number;
        margin?: number;
        quantitySold?: number;
      }>;
    };
    advertising?: {
      campaigns: Array<{
        name: string;
        cost: number;
        views?: number;
        clicks?: number;
        orders?: number;
      }>;
      keywords?: Array<{
        keyword: string;
        views: number;
        clicks: number;
        ctr: number;
        sum: number;
        orders?: number;
        efficiency?: number;
      }>;
    };
    returns?: Array<{
      name: string;
      value: number;
      count?: number;
    }>;
    // Данные для анализа рекламы
    campaignDetails?: {
      id: number;
      status: string;
      type: string;
      ctr: number;
      cr: number;
      dailyStats?: Array<{
        date: string;
        views: number;
        clicks: number;
        ctr: number;
        sum: number;
        orders: number;
      }>;
      productStats?: Array<{
        nmId: number;
        name: string;
        views: number;
        clicks: number;
        ctr: number;
        sum: number;
        orders: number;
        cr: number;
        efficiency: number;
      }>;
    };
    // Новые данные для анализа остатков
    warehouse?: {
      totalItems: number;
      remainsValue: number;
      remainsQuantity: number;
      warehouses: Array<{
        name: string;
        quantity: number;
        value: number;
      }>;
      products: Array<{
        name: string;
        quantity: number;
        value: number;
        daysInStock: number;
        turnoverRate?: number;
      }>;
    };
    // Новые данные для анализа поставок
    supplies?: {
      totalSupplies: number;
      totalItems: number;
      totalValue: number;
      supplies: Array<{
        date: string;
        items: number;
        value: number;
        status: string;
      }>;
      pendingItems: number;
      pendingValue: number;
    };
  };
  requestType: 'full_analysis' | 'sales_analysis' | 'expense_analysis' | 'product_recommendations' | 'advertising_analysis' | 'warehouse_analysis' | 'supply_analysis';
}
