import { AxiosError } from 'axios';
import { api } from './api';

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

export const getAdvertCosts = async (dateFrom: Date, dateTo: Date): Promise<AdvertCost[]> => {
  try {
    const params = {
      from: dateFrom.toISOString().split('T')[0],
      to: dateTo.toISOString().split('T')[0]
    };
    
    const response = await api.get<AdvertCost[]>(`${BASE_URL}/v1/upd`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching advert costs:', error);
    if (error instanceof AxiosError) {
      throw new Error(`Failed to fetch advert costs: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
};

export const getAdvertFullStats = async (dateFrom: Date, dateTo: Date, campaignIds: number[]): Promise<AdvertStats[]> => {
  try {
    const payload = campaignIds.map(id => ({
      id,
      dates: [
        dateFrom.toISOString().split('T')[0],
        dateTo.toISOString().split('T')[0]
      ]
    }));

    const response = await api.post<AdvertStats[]>(`${BASE_URL}/v2/fullstats`, payload);
    return response.data;
  } catch (error) {
    console.error('Error fetching advert stats:', error);
    if (error instanceof AxiosError) {
      throw new Error(`Failed to fetch advert stats: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
};

export const getAdvertPayments = async (dateFrom: Date, dateTo: Date): Promise<AdvertPayment[]> => {
  try {
    const params = {
      from: dateFrom.toISOString().split('T')[0],
      to: dateTo.toISOString().split('T')[0]
    };
    
    const response = await api.get<AdvertPayment[]>(`${BASE_URL}/v1/payments`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching advert payments:', error);
    if (error instanceof AxiosError) {
      throw new Error(`Failed to fetch advert payments: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
};