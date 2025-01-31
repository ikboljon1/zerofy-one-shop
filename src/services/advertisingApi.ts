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
}

interface AdvertPayment {
  id: number;
  date: string;
  sum: number;
  type: string;
  statusId: number;
  cardStatus: string;
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

export const getAdvertCosts = async (dateFrom: Date, dateTo: Date, apiKey: string): Promise<AdvertCost[]> => {
  try {
    const api = createApiInstance(apiKey);
    const params = {
      from: dateFrom.toISOString().split('T')[0],
      to: dateTo.toISOString().split('T')[0]
    };
    
    const response = await api.get(`/v1/upd`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching advert costs:', error);
    if (error instanceof AxiosError) {
      throw new Error(`Failed to fetch advert costs: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
};

export const getAdvertFullStats = async (dateFrom: Date, dateTo: Date, campaignIds: number[], apiKey: string): Promise<AdvertStats[]> => {
  try {
    const api = createApiInstance(apiKey);
    const payload = campaignIds.map(id => ({
      id,
      dates: [
        dateFrom.toISOString().split('T')[0],
        dateTo.toISOString().split('T')[0]
      ]
    }));

    const response = await api.post(`/v2/fullstats`, payload);
    return response.data;
  } catch (error) {
    console.error('Error fetching advert stats:', error);
    if (error instanceof AxiosError) {
      throw new Error(`Failed to fetch advert stats: ${error.response?.data?.message || error.message}`);
    }
    throw error;
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
    return response.data;
  } catch (error) {
    console.error('Error fetching advert payments:', error);
    if (error instanceof AxiosError) {
      throw new Error(`Failed to fetch advert payments: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
};