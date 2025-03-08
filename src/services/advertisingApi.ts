
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

const aggregateAdvertCosts = (costs: AdvertCost[]) => {
  const campaignCosts: Record<string, number> = {};
  
  costs.forEach(cost => {
    if (!campaignCosts[cost.campName]) {
      campaignCosts[cost.campName] = 0;
    }
    campaignCosts[cost.campName] += cost.updSum;
  });
  
  return Object.entries(campaignCosts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

// New function to get product advertising costs for a specific date range
export const getProductAdvertisingCostsForPeriod = async (
  dateFrom: Date,
  dateTo: Date,
  apiKey: string
): Promise<{ totalCost: number; productCosts: {name: string, value: number}[] }> => {
  try {
    // First, get all campaigns to get their IDs
    const campaigns = await getAllCampaigns(apiKey);
    
    if (!campaigns || campaigns.length === 0) {
      return { totalCost: 0, productCosts: [] };
    }
    
    // Fetch full stats for each campaign, which includes daily statistics
    const campaignStatsPromises = campaigns.map(campaign => 
      getCampaignFullStats(apiKey, [campaign.advertId], dateFrom, dateTo)
    );
    
    const campaignStatsResults = await Promise.all(campaignStatsPromises);
    
    // Flatten the results
    const campaignStats = campaignStatsResults.flat();
    
    if (!campaignStats || campaignStats.length === 0) {
      return { totalCost: 0, productCosts: [] };
    }
    
    // Calculate total cost and costs per product
    let totalCost = 0;
    const productCosts: Record<string, number> = {};
    
    // Process each campaign's daily stats
    campaignStats.forEach(campaign => {
      // Get the campaign name from the campaign list
      const campaignInfo = campaigns.find(c => c.advertId === campaign.advertId);
      const campaignName = campaignInfo ? campaignInfo.campName : `Campaign ${campaign.advertId}`;
      
      // Process daily stats
      if (campaign.days && campaign.days.length > 0) {
        campaign.days.forEach(day => {
          // Check if the day is within our date range
          const dayDate = new Date(day.date);
          if (dayDate >= dateFrom && dayDate <= dateTo) {
            // Add to total cost
            totalCost += day.sum;
            
            // Add to product costs
            if (!productCosts[campaignName]) {
              productCosts[campaignName] = 0;
            }
            productCosts[campaignName] += day.sum;
          }
        });
      }
    });
    
    // Convert product costs to array format
    const productCostsArray = Object.entries(productCosts)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
    
    // Limit to top products
    let topProducts = productCostsArray.slice(0, 4);
    const otherProducts = productCostsArray.slice(4);
    
    // Group "other" products
    if (otherProducts.length > 0) {
      const otherSum = parseFloat(otherProducts.reduce((sum, item) => sum + item.value, 0).toFixed(2));
      topProducts.push({ name: "Другие товары", value: otherSum });
    }
    
    return { 
      totalCost: parseFloat(totalCost.toFixed(2)), 
      productCosts: topProducts.length > 0 ? topProducts : []
    };
  } catch (error) {
    console.error('Error fetching product advertising costs for period:', error);
    return { totalCost: 0, productCosts: [] };
  }
};

export const getAdvertCosts = async (dateFrom: Date, dateTo: Date, apiKey: string): Promise<AdvertCost[]> => {
  try {
    const api = createApiInstance(apiKey);
    const params = {
      from: dateFrom.toISOString().split('T')[0],
      to: dateTo.toISOString().split('T')[0]
    };
    
    console.log(`Fetching advertising costs from ${params.from} to ${params.to}`);
    
    const response = await api.get(`/v1/upd`, { params });
    
    let costs = response.data || [];
    
    const fromTime = new Date(params.from).getTime();
    const toTime = new Date(params.to).getTime() + 86400000;
    
    costs = costs.filter((cost: AdvertCost) => {
      const costTime = new Date(cost.updTime.split('T')[0]).getTime();
      return costTime >= fromTime && costTime <= toTime;
    });
    
    console.log(`Received ${costs.length} advertising costs records`);
    
    return costs;
  } catch (error) {
    console.error('Error fetching advertising costs:', error);
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

export const getKeywordStatistics = async (
  apiKey: string,
  campaignId: number, 
  dateFrom: Date, 
  dateTo: Date
): Promise<KeywordStatistics> => {
  try {
    const diffTime = Math.abs(dateTo.getTime() - dateFrom.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 7) {
      const limitedDateFrom = new Date(dateTo);
      limitedDateFrom.setDate(limitedDateFrom.getDate() - 6);
      dateFrom = limitedDateFrom;
    }
    
    const api = createApiInstance(apiKey);
    
    const fromFormatted = dateFrom.toISOString().split('T')[0];
    const toFormatted = dateTo.toISOString().split('T')[0];
    
    const params = {
      advert_id: campaignId,
      from: fromFormatted,
      to: toFormatted
    };
    
    const response = await api.get(`/v0/stats/keywords`, { params });
    return response.data || { keywords: [] };
  } catch (error) {
    console.error('Error fetching keyword statistics:', error);
    return { keywords: [] };
  }
};

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

export interface Campaign {
  advertId: number;
  campName: string;
  status: 'active' | 'paused' | 'archived' | 'ready' | 'completed';
  type: 'auction' | 'automatic';
  numericStatus?: number;
  numericType?: number;
  changeTime?: string;
}
