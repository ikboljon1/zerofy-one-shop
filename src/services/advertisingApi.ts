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
}

interface AdvertBalance {
  balance: number;
}

interface AdvertPayment {
  id: number;
  date: string;
  sum: number;
  type: string;
}

// New interfaces for the fullstats API
export interface CampaignFullStats {
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
  dates: string[];
  days: DayStats[];
  boosterStats?: BoosterStats[];
  advertId: number;
}

interface DayStats {
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
  apps: AppStats[];
  nm?: ProductStats[]; // Добавляем информацию о товарах
}

interface AppStats {
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
  appType?: number;
}

// Новый интерфейс для статистики по товарам
export interface ProductStats {
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
  name: string;
  nmId: number;
}

interface BoosterStats {
  date: string;
  nm: number;
  avg_position: number;
}

// Campaign statistics request
export interface CampaignStatsRequest {
  id: number;
  dates: string[];
}

// New interface for campaign list
export interface CampaignListResponse {
  adverts: Array<{
    type: number;
    status: number;
    count: number;
    advert_list: Array<{
      advertId: number;
      changeTime: string;
    }>;
  }> | null;
  all: number;
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
      // Возвращаем пустой массив вместо ошибки, если данные не найдены
      return [];
    }
    if (error.response?.status === 429) {
      throw new Error("Превышен лимит запросов к API. Пожалуйста, повторите позже");
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
    const params = {
      from: dateFrom.toISOString().split('T')[0],
      to: dateTo.toISOString().split('T')[0],
      campaignIds: campaignIds.join(',')
    };
    
    const response = await api.get(`/v1/stats`, { params });
    return response.data || [];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAdvertBalance = async (apiKey: string): Promise<AdvertBalance> => {
  try {
    const api = createApiInstance(apiKey);
    const response = await api.get(`/v1/balance`);
    return response.data || { balance: 0 };
  } catch (error) {
    console.error('Error fetching balance:', error);
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
    return handleApiError(error);
  }
};

// New function to get full campaign statistics
export const getCampaignFullStats = async (
  apiKey: string,
  campaignIds: number[], 
  dateFrom?: Date, 
  dateTo?: Date
): Promise<CampaignFullStats[]> => {
  try {
    const api = createApiInstance(apiKey);
    
    // Prepare request payload
    const payload: CampaignStatsRequest[] = campaignIds.map(id => {
      const request: CampaignStatsRequest = {
        id,
        dates: []
      };
      
      // Add date range if provided
      if (dateFrom && dateTo) {
        const dates: string[] = [];
        const currentDate = new Date(dateFrom);
        const endDate = new Date(dateTo);
        
        while (currentDate <= endDate) {
          dates.push(currentDate.toISOString().split('T')[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        request.dates = dates;
      }
      
      return request;
    });
    
    const response = await api.post(`/v2/fullstats`, payload);
    return response.data || [];
  } catch (error) {
    return handleApiError(error);
  }
};

// Updated function to get all campaign IDs without filtering out archived ones
export const getActiveCampaignIds = async (apiKey: string): Promise<number[]> => {
  try {
    const api = createApiInstance(apiKey);
    const response = await api.get<CampaignListResponse>(`/v1/promotion/count`);
    
    console.log('Campaign list response:', response.data);
    
    // Extract all campaign IDs without filtering by status
    const campaignIds: number[] = [];
    
    if (response.data.adverts) {
      response.data.adverts.forEach(advertGroup => {
        advertGroup.advert_list.forEach(advert => {
          campaignIds.push(advert.advertId);
        });
      });
    }
    
    console.log('All campaign IDs:', campaignIds);
    return campaignIds;
  } catch (error) {
    console.error('Error fetching campaign IDs:', error);
    return [];
  }
};
