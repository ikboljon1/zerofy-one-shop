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
  nm?: ProductStats[];
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

export interface CampaignStatsRequest {
  id: number;
  dates: string[];
}

export interface KeywordStatistics {
  keywords: KeywordStatisticsDay[];
}

export interface KeywordStatisticsDay {
  date: string;
  stats: KeywordStat[];
}

export interface KeywordStat {
  clicks: number;
  ctr: number;
  keyword: string;
  sum: number;
  views: number;
}

export interface KeywordSearchStat {
  advertId: number;
  keyword: string;
  advertName: string;
  campaignName: string;
  begin: string;
  end: string;
  views: number;
  clicks: number;
  frq: number;
  ctr: number;
  cpc: number;
  duration: number;
  sum: number;
}

export interface KeywordSearchResponse {
  words: {
    phrase: string[];
    strong: string[];
    excluded: string[];
    pluse: string[];
    keywords: Array<{
      keyword: string;
      count: number;
      fixed?: boolean;
    }>;
    fixed?: boolean;
  };
  stat: KeywordSearchStat[];
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

export const getCampaignFullStats = async (
  apiKey: string,
  campaignIds: number[], 
  dateFrom?: Date, 
  dateTo?: Date
): Promise<CampaignFullStats[]> => {
  try {
    const api = createApiInstance(apiKey);
    
    const payload: CampaignStatsRequest[] = campaignIds.map(id => {
      const request: CampaignStatsRequest = {
        id,
        dates: []
      };
      
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

export const getSearchKeywordStatistics = async (
  apiKey: string,
  campaignId: number
): Promise<KeywordSearchResponse> => {
  try {
    const api = createApiInstance(apiKey);
    
    console.log(`Fetching keyword stats for campaign ID: ${campaignId}`);
    const response = await api.get(`/v1/stat/words`, { 
      params: {
        id: campaignId
      }
    });
    
    console.log('Response data:', response.data);
    
    if (response.data) {
      return response.data;
    }
    
    return { 
      words: { 
        phrase: [], 
        strong: [], 
        excluded: [], 
        pluse: [], 
        keywords: [] 
      }, 
      stat: [] 
    };
  } catch (error) {
    console.error('Error fetching keyword statistics:', error);
    
    try {
      const api = createApiInstance(apiKey);
      console.log('Trying fallback endpoint for keywords');
      
      const response = await api.get(`/v0/stats/keywords`, { 
        params: {
          advert_id: campaignId
        }
      });
      
      console.log('Fallback response:', response.data);
      
      if (response.data) {
        return response.data;
      }
      
      return { 
        words: { 
          phrase: [], 
          strong: [], 
          excluded: [], 
          pluse: [], 
          keywords: [] 
        }, 
        stat: [] 
      };
    } catch (secondError) {
      console.error('Error with fallback keyword statistics fetch:', secondError);
      if (secondError instanceof AxiosError && secondError.response?.status === 401) {
        throw new Error("Ошибка авторизации. Пожалуйста, проверьте API ключ");
      }
      if (secondError instanceof AxiosError && secondError.response?.status === 429) {
        throw new Error("Превышен лимит запросов к API. Пожалуйста, повторите позже");
      }
      return { 
        words: { 
          phrase: [], 
          strong: [], 
          excluded: [], 
          pluse: [], 
          keywords: [] 
        }, 
        stat: [] 
      };
    }
  }
};

export interface Campaign {
  advertId: number;
  campName: string;
  status: 'active' | 'paused' | 'archived' | 'ready' | 'completed';
  type: 'auction' | 'automatic';
  numericStatus?: number;
  numericType?: number;
  changeTime?: string;
}

export const getAllCampaigns = async (apiKey: string): Promise<Campaign[]> => {
  try {
    const api = createApiInstance(apiKey);
    const response = await api.get<CampaignCountResponse>(`/v1/promotion/count`);
    
    if (!response.data?.adverts) {
      return [];
    }
    
    const campaigns: Campaign[] = [];
    
    response.data.adverts.forEach(group => {
      group.advert_list.forEach(campaign => {
        campaigns.push({
          advertId: campaign.advertId,
          campName: `Кампания ${campaign.advertId}`,
          status: getStatusString(group.status),
          type: getTypeString(group.type),
          numericStatus: group.status,
          numericType: group.type,
          changeTime: campaign.changeTime
        });
      });
    });
    
    return campaigns.sort((a, b) => 
      new Date(b.changeTime).getTime() - new Date(a.changeTime).getTime()
    );
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return handleApiError(error);
  }
};
