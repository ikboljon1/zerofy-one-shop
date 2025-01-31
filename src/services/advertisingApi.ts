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
}

interface AdvertBalance {
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

export const getAdvertStats = async (campaignId: number, apiKey: string): Promise<AdvertStats> => {
  try {
    const api = createApiInstance(apiKey);
    const response = await api.get(`/v1/campaign/${campaignId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching advert stats:', error);
    if (error instanceof AxiosError) {
      throw new Error(`Failed to fetch advert stats: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
};

export const getAdvertBalance = async (apiKey: string): Promise<AdvertBalance> => {
  try {
    const api = createApiInstance(apiKey);
    const response = await api.get(`/v1/balance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching advert balance:', error);
    if (error instanceof AxiosError) {
      throw new Error(`Failed to fetch advert balance: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
};