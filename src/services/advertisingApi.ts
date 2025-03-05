
import { format, formatISO } from "date-fns";

// Типы данных
export interface Campaign {
  advertId: number;
  nmID?: number;
  type: 'auction' | 'automatic';
  status: 'active' | 'paused' | 'archived' | 'ready' | 'completed';
  nmId?: number;
  autoParams?: any;
  description?: string;
  changeTime?: string;
  campName?: string;
  numericStatus?: number;
  numericType?: number;
}

export interface ProductStats {
  nmId: number;
  views: number;
  clicks: number;
  ctr: number;
  sum: number;
  atbs: number;
  orders: number;
  shks: number;
  cr: number;
  cpc: number;
  sum_price: number;
}

export interface KeywordStats {
  clicks: number;
  ctr: number;
  keyword: string;
  sum: number;
  views: number;
}

export interface DailyKeywordStats {
  date: string;
  stats: KeywordStats[];
}

export interface KeywordStatsResponse {
  keywords: DailyKeywordStats[];
}

export interface CampaignFullStats {
  clicks: number;
  ctr: number;
  sum: number;
  views: number;
  atbs: number;
  orders: number;
  shks: number;
  cr: number;
  cpc: number;
  sum_price: number;
  days?: any[];
}

// Список кампаний
export const getAllCampaigns = async (apiKey: string): Promise<Campaign[]> => {
  try {
    console.log("Fetching all campaigns...");
    
    const [auctionCampaigns, autoCampaigns] = await Promise.all([
      getAuctionCampaigns(apiKey),
      getAutoCampaigns(apiKey)
    ]);
    
    console.log("Auction campaigns:", auctionCampaigns);
    console.log("Auto campaigns:", autoCampaigns);
    
    // Объединить оба типа кампаний в один массив
    const allCampaigns = [
      ...auctionCampaigns.map(campaign => ({
        ...campaign,
        type: 'auction' as 'auction',
        numericType: 8,
        numericStatus: campaign.status
      })),
      ...autoCampaigns.map(campaign => ({
        ...campaign,
        type: 'automatic' as 'automatic',
        numericType: 9,
        numericStatus: campaign.status
      }))
    ];
    
    return allCampaigns;
  } catch (error) {
    console.error("Error in getAllCampaigns:", error);
    throw error;
  }
};

// Получение кампаний аукционного типа
const getAuctionCampaigns = async (apiKey: string): Promise<Campaign[]> => {
  const url = 'https://advert-api.wildberries.ru/adv/v2/search/list';
  
  try {
    const response = await fetch(url, {
      headers: {
        "Authorization": apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch auction campaigns: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Преобразование полученных данных в нужный формат
    const campaigns: Campaign[] = data.adverts.map((adv: any) => {
      // Преобразование статуса из числа в строку
      let status: Campaign['status'] = 'active';
      
      switch (adv.status) {
        case 7:
          status = 'active';
          break;
        case 9:
          status = 'paused';
          break;
        case 11:
          status = 'archived';
          break;
        default:
          status = 'active';
      }
      
      return {
        advertId: adv.advertId,
        status,
        type: 'auction',
        nmID: adv.nms?.[0] || null,
        campName: adv.name || `Аукционная кампания ${adv.advertId}`,
        changeTime: adv.changeTime,
        numericStatus: adv.status
      };
    });
    
    return campaigns;
  } catch (error) {
    console.error('Error fetching auction campaigns:', error);
    throw error;
  }
};

// Получение автоматических кампаний
const getAutoCampaigns = async (apiKey: string): Promise<Campaign[]> => {
  const url = 'https://advert-api.wildberries.ru/adv/v1/auto/list';
  
  try {
    const response = await fetch(url, {
      headers: {
        "Authorization": apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch auto campaigns: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Преобразование полученных данных в нужный формат
    const campaigns: Campaign[] = data.adverts.map((adv: any) => {
      // Преобразование статуса из числа в строку
      let status: Campaign['status'] = 'active';
      
      switch (adv.status) {
        case 7:
          status = 'active';
          break;
        case 9:
          status = 'paused';
          break;
        case 11:
          status = 'archived';
          break;
        case 4:
          status = 'ready';
          break;  
        case 5:
          status = 'completed';
          break;
        default:
          status = 'active';
      }
      
      return {
        advertId: adv.advertId,
        status,
        type: 'automatic',
        nmID: adv.nms?.[0]?.nmId || null,
        autoParams: adv.autoParams,
        description: adv.description,
        campName: adv.name || `Автоматическая кампания ${adv.advertId}`,
        changeTime: adv.changeTime,
        numericStatus: adv.status
      };
    });
    
    return campaigns;
  } catch (error) {
    console.error('Error fetching auto campaigns:', error);
    throw error;
  }
};

// Получение расходов
export const getAdvertCosts = async (dateFrom: Date, dateTo: Date, apiKey: string) => {
  const url = new URL('https://advert-api.wildberries.ru/adv/v2/upd');
  
  const params = {
    from: format(dateFrom, 'yyyy-MM-dd'),
    to: format(dateTo, 'yyyy-MM-dd')
  };
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  
  try {
    const response = await fetch(url.toString(), {
      headers: {
        "Authorization": apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch advert costs: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.costs || [];
  } catch (error) {
    console.error('Error fetching advert costs:', error);
    throw error;
  }
};

// Получение статистики
export const getAdvertStats = async (dateFrom: Date, dateTo: Date, advertIds: number[], apiKey: string) => {
  const url = new URL('https://advert-api.wildberries.ru/adv/v2/fullstats');
  
  const params = {
    from: format(dateFrom, 'yyyy-MM-dd'),
    to: format(dateTo, 'yyyy-MM-dd'),
    id: advertIds.join(',')
  };
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  
  try {
    const response = await fetch(url.toString(), {
      headers: {
        "Authorization": apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch advert stats: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching advert stats:', error);
    throw error;
  }
};

// Получение данных о пополнениях
export const getAdvertPayments = async (dateFrom: Date, dateTo: Date, apiKey: string) => {
  const url = new URL('https://advert-api.wildberries.ru/adv/v1/payment/history');
  
  const params = {
    from: format(dateFrom, 'yyyy-MM-dd'),
    to: format(dateTo, 'yyyy-MM-dd')
  };
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  
  try {
    const response = await fetch(url.toString(), {
      headers: {
        "Authorization": apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch advert payments: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.payments || [];
  } catch (error) {
    console.error('Error fetching advert payments:', error);
    throw error;
  }
};

// Получение баланса по рекламе
export const getAdvertBalance = async (apiKey: string) => {
  const url = 'https://advert-api.wildberries.ru/adv/v1/balance';
  
  try {
    const response = await fetch(url, {
      headers: {
        "Authorization": apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch advert balance: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching advert balance:', error);
    throw error;
  }
};

// Подробная статистика по кампании
export const getCampaignFullStats = async (apiKey: string, campaignIds: number[], dateFrom: Date, dateTo: Date): Promise<CampaignFullStats[]> => {
  const url = new URL('https://advert-api.wildberries.ru/adv/v1/fullstat');
  
  const params = {
    id: campaignIds.join(','),
    from: format(dateFrom, 'yyyy-MM-dd'),
    to: format(dateTo, 'yyyy-MM-dd')
  };
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  
  try {
    const response = await fetch(url.toString(), {
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch campaign full stats: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching campaign full stats:', error);
    throw error;
  }
};

// Получение статистики по ключевым фразам
export const getKeywordStats = async (apiKey: string, advertId: number, dateFrom: Date, dateTo: Date): Promise<KeywordStatsResponse> => {
  const url = new URL('https://advert-api.wildberries.ru/adv/v0/stats/keywords');
  
  const params = {
    advert_id: advertId.toString(),
    from: format(dateFrom, 'yyyy-MM-dd'),
    to: format(dateTo, 'yyyy-MM-dd')
  };
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  
  try {
    const response = await fetch(url.toString(), {
      headers: {
        "Authorization": apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch keyword stats: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching keyword stats:', error);
    throw error;
  }
};

// Установка/удаление минус-фраз в поиске для аукционных кампаний
export const setSearchExcludedKeywords = async (apiKey: string, campaignId: number, excludedKeywords: string[]) => {
  const url = new URL(`https://advert-api.wildberries.ru/adv/v1/search/set-excluded?id=${campaignId}`);
  
  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        excluded: excludedKeywords
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to set excluded keywords for search: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error setting excluded keywords for search:', error);
    throw error;
  }
};

// Установка/удаление минус-фраз для автоматических кампаний
export const setAutoExcludedKeywords = async (apiKey: string, campaignId: number, excludedKeywords: string[]) => {
  const url = new URL(`https://advert-api.wildberries.ru/adv/v1/auto/set-excluded?id=${campaignId}`);
  
  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        excluded: excludedKeywords
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to set excluded keywords for auto campaign: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error setting excluded keywords for auto campaign:', error);
    throw error;
  }
};

// Получение минус-фраз для кампании
export const getExcludedKeywords = async (apiKey: string, campaignId: number, campaignType: 'auction' | 'automatic'): Promise<string[]> => {
  const endpoint = campaignType === 'auction' 
    ? `https://advert-api.wildberries.ru/adv/v1/search/excluded?id=${campaignId}` 
    : `https://advert-api.wildberries.ru/adv/v1/auto/excluded?id=${campaignId}`;
  
  try {
    const response = await fetch(endpoint, {
      headers: {
        "Authorization": apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch excluded keywords: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.excluded || [];
  } catch (error) {
    console.error('Error fetching excluded keywords:', error);
    throw error;
  }
};
