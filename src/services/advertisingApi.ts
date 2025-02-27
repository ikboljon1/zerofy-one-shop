
import { AxiosError } from 'axios';
import axios from 'axios';
import { ExpenseStructure } from '@/types/store';

const BASE_URL = "https://advert-api.wildberries.ru/adv";

interface AdvertCampaign {
  advertId: number;
  name: string;
  type: number;
  status: string;
}

interface CampaignList {
  adverts: {
    type: number;
    advert_list: AdvertCampaign[];
  }[];
}

interface CampaignStats {
  advertId: number;
  views: number;
  clicks: number;
  ctr: number;
  orders: number;
  cr: number;
  sum: number;
}

export interface AdvertCost {
  updNum: string;
  updTime: string;
  updSum: number;
  advertId: number;
  campName: string;
  advertType: string;
  paymentType: string;
  advertStatus: string;
}

export interface AdvertBalance {
  balance: number;
}

interface AdvertPayment {
  id: number;
  date: string;
  sum: number;
  type: string;
}

export interface AdvertStat {
  advertId: number;
  type: 'auction' | 'automatic';
  status: 'active' | 'paused' | 'archived' | 'ready';
  views: number;
  clicks: number;
  ctr: number;
  orders: number;
  cr: number;
  sum: number;
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
  console.error('API error:', error);
  
  if (error instanceof AxiosError) {
    if (error.response?.status === 401) {
      throw new Error("Ошибка авторизации. Пожалуйста, проверьте API ключ");
    }
    throw new Error(error.response?.data?.message || "Произошла ошибка при запросе к API");
  }
  throw error;
};

export const getCampaignsList = async (apiKey: string): Promise<CampaignList> => {
  try {
    console.log("Запрашиваем список рекламных кампаний");
    const api = createApiInstance(apiKey);
    const response = await api.get(`/v1/promotion/count`);
    console.log("Получен список кампаний:", response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getCampaignsStats = async (
  campaignIds: number[],
  dates: string[],
  apiKey: string
): Promise<CampaignStats[]> => {
  try {
    console.log("Запрашиваем статистику по кампаниям:", campaignIds);
    const api = createApiInstance(apiKey);
    
    const payload = campaignIds.map(id => ({
      id,
      dates
    }));
    
    const response = await api.post(`/v2/fullstats`, payload);
    console.log("Получена статистика по кампаниям:", response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
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
    console.error('Error fetching costs:', error);
    return [];
  }
};

export const getAdvertStats = async (dateFrom: Date, dateTo: Date, campaignIds: number[], apiKey: string): Promise<AdvertStat[]> => {
  try {
    console.log("Получаем детальную статистику по кампаниям:", campaignIds);
    const dates = getDatesArray(dateFrom, dateTo);
    
    if (dates.length === 0 || campaignIds.length === 0) {
      console.log("Нет дат или кампаний для получения статистики");
      return [];
    }
    
    const api = createApiInstance(apiKey);
    
    const payload = campaignIds.map(id => ({
      id,
      dates
    }));
    
    const response = await api.post(`/v2/fullstats`, payload);
    console.log("Получена полная статистика кампаний:", response.data);
    
    // Преобразуем и добавляем информацию о типе и статусе
    const campaignsList = await getCampaignsList(apiKey);
    const campaignsInfo: Record<number, { type: string; status: string }> = {};
    
    for (const advertType of campaignsList.adverts || []) {
      for (const campaign of advertType.advert_list || []) {
        campaignsInfo[campaign.advertId] = {
          type: advertType.type === 9 ? 'automatic' : 'auction',
          status: mapStatusString(campaign.status)
        };
      }
    }
    
    // Добавляем тип и статус к каждой кампании
    return response.data.map((stat: any) => ({
      ...stat,
      type: campaignsInfo[stat.advertId]?.type || 'auction',
      status: campaignsInfo[stat.advertId]?.status || 'active'
    }));
  } catch (error) {
    console.error('Error fetching advert stats:', error);
    return [];
  }
};

const mapStatusString = (status: string): 'active' | 'paused' | 'archived' | 'ready' => {
  const statusMap: Record<string, 'active' | 'paused' | 'archived' | 'ready'> = {
    "active": "active",
    "paused": "paused",
    "archived": "archived",
    "ready": "ready",
    "1": "active",
    "2": "paused",
    "3": "archived",
    "4": "ready"
  };
  
  return statusMap[status] || "active";
};

const getDatesArray = (from: Date, to: Date): string[] => {
  const dates: string[] = [];
  const currentDate = new Date(from);
  const endDate = new Date(to);
  
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
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
    console.error('Error fetching payments:', error);
    return [];
  }
};

export const getAdvertisingExpenseStructure = async (
  apiKey: string,
  days: number = 7
): Promise<ExpenseStructure> => {
  try {
    console.log("Получаем структуру расходов на рекламу за", days, "дней");
    
    // Определяем даты для запроса
    const today = new Date();
    const dates = Array.from({ length: days }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return date.toISOString().split('T')[0];
    });
    
    // Получаем список кампаний
    const campaignData = await getCampaignsList(apiKey);
    
    if (!campaignData || !campaignData.adverts) {
      console.error("Не удалось получить список кампаний");
      return { searchAds: 0, bannerAds: 0, cardAds: 0, autoAds: 0, otherAds: 0, total: 0 };
    }
    
    // Обрабатываем список кампаний и формируем список ID
    const allCampaignIds: number[] = [];
    const campaignTypes: Record<number, number> = {}; // Словарь для хранения типа кампании по ID
    
    for (const advertType of campaignData.adverts) {
      if (advertType.advert_list) {
        for (const campaign of advertType.advert_list) {
          allCampaignIds.push(campaign.advertId);
          campaignTypes[campaign.advertId] = advertType.type; // Запоминаем тип кампании
        }
      }
    }
    
    if (allCampaignIds.length === 0) {
      console.log("Не найдено активных рекламных кампаний");
      return { searchAds: 0, bannerAds: 0, cardAds: 0, autoAds: 0, otherAds: 0, total: 0 };
    }
    
    // Получаем статистику по всем кампаниям
    const stats = await getCampaignsStats(allCampaignIds, dates, apiKey);
    
    if (!stats || stats.length === 0) {
      console.error("Не удалось получить статистику");
      return { searchAds: 0, bannerAds: 0, cardAds: 0, autoAds: 0, otherAds: 0, total: 0 };
    }
    
    // Обрабатываем результаты
    let searchAds = 0;
    let bannerAds = 0;
    let cardAds = 0;
    let autoAds = 0;
    let otherAds = 0;
    
    for (const campaign of stats) {
      const campaignId = campaign.advertId;
      const campaignType = campaignTypes[campaignId];
      const campaignSum = campaign.sum || 0;
      
      // Определяем тип кампании и добавляем затраты в соответствующую категорию
      switch (campaignType) {
        case 1: // Реклама в поиске
          searchAds += campaignSum;
          break;
        case 4: // Баннерная реклама
          bannerAds += campaignSum;
          break;
        case 8: // Реклама в карточках
          cardAds += campaignSum;
          break;
        case 9: // Автоматическая реклама
          autoAds += campaignSum;
          break;
        default:
          otherAds += campaignSum;
          break;
      }
    }
    
    const total = searchAds + bannerAds + cardAds + autoAds + otherAds;
    
    console.log("Структура расходов на рекламу:");
    console.log("Реклама в поиске:", searchAds.toFixed(2), "₽");
    console.log("Баннерная реклама:", bannerAds.toFixed(2), "₽");
    console.log("Реклама в карточках:", cardAds.toFixed(2), "₽");
    console.log("Автоматическая реклама:", autoAds.toFixed(2), "₽");
    console.log("Другие форматы:", otherAds.toFixed(2), "₽");
    
    return {
      searchAds,
      bannerAds,
      cardAds,
      autoAds,
      otherAds,
      total
    };
  } catch (error) {
    console.error("Ошибка при получении структуры расходов на рекламу:", error);
    return { searchAds: 0, bannerAds: 0, cardAds: 0, autoAds: 0, otherAds: 0, total: 0 };
  }
};
