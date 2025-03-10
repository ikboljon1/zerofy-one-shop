
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
    };
    returns?: Array<{
      name: string;
      value: number;
      count?: number;
    }>;
  };
  requestType: 'full_analysis' | 'sales_analysis' | 'expense_analysis' | 'product_recommendations';
}
