import axios from "axios";

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
      deductions: number;
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
    count: number;
  }>;
  penaltiesData: Array<{
    name: string;
    value: number;
    isNegative?: boolean;
  }>;
  deductionsData: Array<{
    name: string;
    value: number;
    isNegative?: boolean;
  }>;
  topProfitableProducts: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
    quantitySold: number;
    margin: number;
    returnCount: number;
    category: string;
  }>;
  topUnprofitableProducts: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
    quantitySold: number;
    margin: number;
    returnCount: number;
    category: string;
  }>;
  orders: any[];
  sales: any[];
  warehouseDistribution: any[];
  regionDistribution: any[];
}

// Helper function to generate realistic Wildberries API response
const generateMockWildberriesResponse = (): WildberriesResponse => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  return {
    currentPeriod: {
      sales: Math.floor(Math.random() * 100000),
      transferred: Math.floor(Math.random() * 80000),
      expenses: {
        total: Math.floor(Math.random() * 20000),
        logistics: Math.floor(Math.random() * 5000),
        storage: Math.floor(Math.random() * 2000),
        penalties: Math.floor(Math.random() * 1000),
        acceptance: Math.floor(Math.random() * 500),
        advertising: Math.floor(Math.random() * 3000),
        deductions: Math.floor(Math.random() * 1500),
      },
      netProfit: Math.floor(Math.random() * 60000),
      acceptance: Math.floor(Math.random() * 500),
    },
    dailySales: Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 15000),
        previousSales: Math.floor(Math.random() * 12000),
      };
    }),
    productSales: Array.from({ length: 5 }, (_, i) => ({
      subject_name: `Product ${i + 1}`,
      quantity: Math.floor(Math.random() * 50),
    })),
    productReturns: Array.from({ length: 3 }, (_, i) => ({
      name: `Return Reason ${i + 1}`,
      value: Math.floor(Math.random() * 1000),
      count: Math.floor(Math.random() * 10),
    })),
    penaltiesData: Array.from({ length: 2 }, (_, i) => ({
      name: `Penalty ${i + 1}`,
      value: Math.floor(Math.random() * 500),
      isNegative: true,
    })),
    deductionsData: Array.from({ length: 2 }, (_, i) => ({
      name: `Deduction ${i + 1}`,
      value: Math.floor(Math.random() * 700),
      isNegative: true,
    })),
    topProfitableProducts: Array.from({ length: 3 }, (_, i) => ({
      name: `Profitable Product ${i + 1}`,
      price: String(Math.floor(Math.random() * 2000)),
      profit: String(Math.floor(Math.random() * 800)),
      image: 'https://via.placeholder.com/50',
      quantitySold: Math.floor(Math.random() * 30),
      margin: Math.floor(Math.random() * 20),
      returnCount: Math.floor(Math.random() * 5),
      category: `Category ${i + 1}`,
    })),
    topUnprofitableProducts: Array.from({ length: 3 }, (_, i) => ({
      name: `Unprofitable Product ${i + 1}`,
      price: String(Math.floor(Math.random() * 1500)),
      profit: String(Math.floor(Math.random() * -300)),
      image: 'https://via.placeholder.com/50',
      quantitySold: Math.floor(Math.random() * 15),
      margin: Math.floor(Math.random() * -10),
      returnCount: Math.floor(Math.random() * 8),
      category: `Category ${i + 1}`,
    })),
    orders: [],
    sales: [],
    warehouseDistribution: [],
    regionDistribution: [],
  };
};

export const fetchWildberriesStats = async (
  apiKey: string,
  from: Date,
  to: Date,
  signal?: AbortSignal
): Promise<WildberriesResponse | null> => {
  try {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API Key is required');
    }

    // In a real application, this would make a real API call to Wildberries
    // For the purposes of this demo, we'll check if the API key is valid
    // based on some simple rules and return mock data
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Production implementation would call the actual Wildberries API
    /*
    const response = await axios.get(
      'https://statistics-api.wildberries.ru/api/v1/supplier/sales',
      {
        params: {
          dateFrom: from.toISOString().split('T')[0],
          dateTo: to.toISOString().split('T')[0],
        },
        headers: {
          'Authorization': apiKey,
        },
        signal: signal,
        timeout: 10000, // 10 second timeout
      }
    );
    
    if (response.status !== 200) {
      console.error('API call failed with status:', response.status);
      return null;
    }
    
    return processWildberriesResponse(response.data);
    */
    
    // For demo purposes, check if the API key has a valid format
    // In production, this check would be replaced with the real API call above
    const isValidFormatApiKey = /^[a-zA-Z0-9]{20,50}$/.test(apiKey);
    
    if (!isValidFormatApiKey) {
      console.log('Invalid API key format:', apiKey);
      return null;
    }
    
    // Return mock data
    return generateMockWildberriesResponse();
  } catch (error) {
    console.error('Error fetching Wildberries stats:', error);
    return null;
  }
};

export const fetchWildberriesOrders = async (apiKey: string, from: Date): Promise<any[]> => {
  try {
    const response = await axios.get(
      'https://statistics-api.wildberries.ru/api/v1/supplier/orders',
      {
        params: {
          dateFrom: from.toISOString().split('T')[0],
        },
        headers: {
          'Authorization': apiKey,
        },
        timeout: 10000, // 10 second timeout
      }
    );

    if (response.status !== 200) {
      console.error('API call failed with status:', response.status);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching Wildberries orders:', error);
    return [];
  }
};

export const fetchWildberriesSales = async (apiKey: string, from: Date): Promise<any[]> => {
  try {
    const response = await axios.get(
      'https://statistics-api.wildberries.ru/api/v1/supplier/sales',
      {
        params: {
          dateFrom: from.toISOString().split('T')[0],
        },
        headers: {
          'Authorization': apiKey,
        },
        timeout: 10000, // 10 second timeout
      }
    );

    if (response.status !== 200) {
      console.error('API call failed with status:', response.status);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching Wildberries sales:', error);
    return [];
  }
};
