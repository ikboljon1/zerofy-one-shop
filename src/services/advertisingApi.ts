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
  views: number;
  clicks: number;
  ctr: number;
  orders: number;
  cr: number;
  sum: number;
  atbs?: number;
  shks?: number;
  sum_price?: number;
}

interface AdvertBalanceResponse {
  balance: number;
}

interface AdvertPayment {
  id: number;
  date: string;
  sum: number;
  type: string;
}

interface FullStatsResponse {
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
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
  }
  throw new Error("Произошла ошибка при запросе к API. Пожалуйста, попробуйте позже");
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
    console.error('Error in getAdvertCosts:', error);
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
    const params = {
      from: dateFrom.toISOString().split('T')[0],
      to: dateTo.toISOString().split('T')[0],
      campaignIds: campaignIds.join(',')
    };
    
    const response = await api.get(`/v2/fullstats`, { params });
    const data: FullStatsResponse = response.data;

    if (!data) {
      console.warn('No data received from fullstats endpoint');
      return campaignIds.map(id => ({
        advertId: id,
        status: 'active',
        type: 'auction',
        views: 0,
        clicks: 0,
        ctr: 0,
        orders: 0,
        cr: 0,
        sum: 0
      }));
    }

    return campaignIds.map(id => ({
      advertId: id,
      status: 'active',
      type: 'auction',
      views: data.views || 0,
      clicks: data.clicks || 0,
      ctr: data.ctr || 0,
      orders: data.orders || 0,
      cr: data.cr || 0,
      sum: data.sum || 0,
      atbs: data.atbs,
      shks: data.shks,
      sum_price: data.sum_price
    }));
  } catch (error) {
    console.error('Error in getAdvertStats:', error);
    return handleApiError(error);
  }
};

export const getAdvertBalance = async (apiKey: string): Promise<AdvertBalanceResponse> => {
  try {
    const api = createApiInstance(apiKey);
    const response = await api.get(`/v1/balance`);
    return { balance: response.data?.balance || 0 };
  } catch (error) {
    console.error('Error in getAdvertBalance:', error);
    return { balance: 0 };
  }
};

export const getAdvertPayments = async (dateFrom: Date, dateTo: Date, apiKey: string): Promise<AdvertPayment[]> => {
  try {
    const api = createApiInstance(apiKey);
    const params = {
      from: dateFrom.toISOString().split('T')[0],
      to: dateTo.toISOString().split('T')[0]
    };
    
    const response = await api.get(`/v1/payments`, { params });
    return response.data || [];
  } catch (error) {
    console.error('Error in getAdvertPayments:', error);
    return handleApiError(error);
  }
};