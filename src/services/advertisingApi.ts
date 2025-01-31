import { AxiosError } from 'axios';
import axios from 'axios';

const BASE_URL = "https://advert-api.wildberries.ru/adv";

interface AdvertCost {
  updNum: string;
  updTime: string;
  updSum: number;
  advertId: number;
  campName: string;
  advertType: string;
  paymentType: string;
  advertStatus: string;
}

interface AdvertStats {
  advertId: number;
  status: 'active' | 'paused' | 'archived' | 'ready';
  type: 'auction' | 'automatic';
  dates: string[];
  views: number;
  clicks: number;
  ctr: number;
  cpc: number;
  sum: number;
  atbs: number;
  orders: number;
  cr: number;
  shks: number;
  sum_price: number;
  days: Array<{
    date: string;
    views: number;
    clicks: number;
    ctr: number;
    cpc: number;
    sum: number;
    atbs: number;
    orders: number;
    cr: number;
    shks: number;
    sum_price: number;
  }>;
}

interface AdvertPayment {
  id: number;
  date: string;
  sum: number;
  type: string;
}

interface AdvertBalanceResponse {
  balance: number;
}

const createApiInstance = (apiKey: string) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey
    }
  });
};

const handleApiError = (error: unknown) => {
  if (error instanceof AxiosError) {
    if (error.response?.status === 401) {
      throw new Error("Ошибка авторизации. Пожалуйста, проверьте API ключ");
    }
    if (error.response?.status === 404) {
      return [];
    }
    throw new Error(error.response?.data?.message || "Произошла ошибка при запросе к API");
  }
  throw error;
};

export const getAdvertCosts = async (dateFrom: Date, dateTo: Date, apiKey: string): Promise<AdvertCost[]> => {
  try {
    const api = createApiInstance(apiKey);
    const params = {
      from: dateFrom.toISOString().split('T')[0],
      to: dateTo.toISOString().split('T')[0]
    };
    
    const response = await api.get(`/v1/upd`, { params });
    return response.data || [];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAdvertStats = async (
  dateFrom: Date,
  dateTo: Date,
  campaignIds: number[],
  apiKey: string
): Promise<AdvertStats[]> => {
  try {
    if (!campaignIds.length) {
      return [];
    }

    const api = createApiInstance(apiKey);
    const requestData = {
      id: campaignIds,
      dates: getDatesArray(dateFrom, dateTo)
    };
    
    const response = await api.post(`/v2/fullstats`, requestData);
    
    // Save to localStorage
    const cacheKey = `advert_stats_${campaignIds.join('_')}`;
    localStorage.setItem(cacheKey, JSON.stringify({
      timestamp: new Date().getTime(),
      data: response.data
    }));
    
    return response.data || [];
  } catch (error) {
    // Try to get cached data if request fails
    const cacheKey = `advert_stats_${campaignIds.join('_')}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      // Return cached data if it's less than 1 hour old
      if (new Date().getTime() - parsed.timestamp < 3600000) {
        return parsed.data;
      }
    }
    return handleApiError(error);
  }
};

export const getAdvertBalance = async (apiKey: string): Promise<AdvertBalanceResponse> => {
  try {
    const api = createApiInstance(apiKey);
    const response = await api.get('/v1/balance');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Helper function to generate array of dates between dateFrom and dateTo
const getDatesArray = (dateFrom: Date, dateTo: Date): string[] => {
  const dates: string[] = [];
  const currentDate = new Date(dateFrom);
  const endDate = new Date(dateTo);
  
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};