
import { AxiosError } from 'axios';
import axios from 'axios';
import { getStatusString, getTypeString } from '@/components/analytics/data/productAdvertisingData';

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
  status: 'active' | 'paused' | 'archived' | 'ready' | 'completed';
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

// Campaign Count API Response
interface CampaignCountResponse {
  adverts: CampaignGroup[];
  all: number;
}

interface CampaignGroup {
  type: number;
  status: number;
  count: number;
  advert_list: CampaignInfo[];
}

interface CampaignInfo {
  advertId: number;
  changeTime: string;
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

// Fetch all campaigns with their statuses and types
export const getAllCampaigns = async (apiKey: string): Promise<Campaign[]> => {
  try {
    const api = createApiInstance(apiKey);
    const response = await api.get<CampaignCountResponse>(`/v1/promotion/count`);
    
    // If no data, return empty array
    if (!response.data?.adverts) {
      return [];
    }
    
    // Flatten the groups and map to our Campaign interface
    const campaigns: Campaign[] = [];
    
    response.data.adverts.forEach(group => {
      group.advert_list.forEach(campaign => {
        campaigns.push({
          advertId: campaign.advertId,
          campName: `Кампания ${campaign.advertId}`, // Default name, will be updated later
          status: getStatusString(group.status),
          type: getTypeString(group.type),
          numericStatus: group.status,
          numericType: group.type,
          changeTime: campaign.changeTime
        });
      });
    });
    
    // Sort by change time (newest first)
    return campaigns.sort((a, b) => 
      new Date(b.changeTime).getTime() - new Date(a.changeTime).getTime()
    );
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return handleApiError(error);
  }
};

// Campaign interface used throughout the application
export interface Campaign {
  advertId: number;
  campName: string;
  status: 'active' | 'paused' | 'archived' | 'ready' | 'completed';
  type: 'auction' | 'automatic';
  numericStatus?: number; // Original numeric status from API
  numericType?: number;   // Original numeric type from API
  changeTime?: string;    // Last change time
}
