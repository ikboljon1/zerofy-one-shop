
/**
 * Получает статистику по ключевым словам для рекламной кампании
 */
export interface KeywordStatistics {
  keywords: Array<{
    date: string;
    stats: KeywordStat[];
  }>;
}

/**
 * Описывает статистику по одному ключевому слову
 */
export interface KeywordStat {
  keyword: string;
  views: number;
  clicks: number;
  ctr: number;
  sum: number;
}

/**
 * Описывает рекламную кампанию
 */
export interface Campaign {
  advertId: number;
  name?: string;
  campName: string;
  type: 'auction' | 'automatic';
  status: 'active' | 'paused' | 'archived' | 'ready' | 'completed';
  changeTime?: string;
  numericStatus?: number;
  numericType?: number;
}

/**
 * Описывает полную статистику рекламной кампании
 */
export interface CampaignFullStats {
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
  days: Array<{
    date: string;
    views: number;
    clicks: number;
    ctr: number;
    sum: number;
    orders: number;
    nm?: ProductStats[];
  }>;
}

/**
 * Описывает статистику по товару в рекламе
 */
export interface ProductStats {
  nmId: number;
  name: string;
  views: number;
  clicks: number;
  ctr: number;
  sum: number;
  cpc: number;
  atbs: number;
  orders: number;
  cr: number;
  shks: number;
  sum_price: number;
}

/**
 * Загружает статистику по ключевым словам из API
 * @param apiKey API ключ
 * @param campaignId ID кампании
 * @param dateFrom Начальная дата
 * @param dateTo Конечная дата
 * @returns Promise<KeywordStatistics>
 */
export const getKeywordStatistics = async (
  apiKey: string,
  campaignId: number,
  dateFrom: Date,
  dateTo: Date
): Promise<KeywordStatistics> => {
  const formattedDateFrom = dateFrom.toISOString().split('T')[0];
  const formattedDateTo = dateTo.toISOString().split('T')[0];

  try {
    const url = `https://advert-api.wildberries.ru/adv/v1/keyword/statistics?campaignId=${campaignId}&dateFrom=${formattedDateFrom}&dateTo=${formattedDateTo}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка загрузки статистики: ${response.status}`);
    }

    const data: KeywordStatistics = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка при загрузке статистики:', error);
    throw error;
  }
};

/**
 * Исключает ключевые слова из рекламной кампании
 * @param apiKey API ключ
 * @param campaignId ID кампании
 * @param excludedKeywords Массив ключевых слов для исключения
 * @returns Promise<boolean> Успешность операции
 */
export const setExcludedKeywords = async (
  apiKey: string,
  campaignId: number,
  excludedKeywords: string[]
): Promise<boolean> => {
  try {
    const url = `https://advert-api.wildberries.ru/adv/v1/auto/set-excluded`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey
      },
      body: JSON.stringify({
        advertId: campaignId,
        excluded: excludedKeywords
      })
    });
    
    if (!response.ok) {
      console.error(`Ошибка исключения ключевых слов: ${response.status} ${response.statusText}`);
      const errorData = await response.json().catch(() => ({}));
      console.error('Данные ошибки:', errorData);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Ошибка при исключении ключевых слов:', error);
    return false;
  }
};

/**
 * Получает список всех рекламных кампаний
 * @param apiKey API ключ
 * @returns Promise<Campaign[]>
 */
export const getAllCampaigns = async (apiKey: string): Promise<Campaign[]> => {
  try {
    const url = 'https://advert-api.wildberries.ru/adv/v1/adverts';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка получения кампаний: ${response.status}`);
    }

    const data = await response.json();
    return data.adverts || [];
  } catch (error) {
    console.error('Ошибка при получении кампаний:', error);
    throw error;
  }
};

/**
 * Получает затраты на рекламу
 * @param dateFrom Начальная дата
 * @param dateTo Конечная дата
 * @param apiKey API ключ
 * @returns Promise<any[]>
 */
export const getAdvertCosts = async (
  dateFrom: Date,
  dateTo: Date,
  apiKey: string
): Promise<any[]> => {
  try {
    const formattedDateFrom = dateFrom.toISOString().split('T')[0];
    const formattedDateTo = dateTo.toISOString().split('T')[0];
    
    const url = `https://advert-api.wildberries.ru/adv/v1/upd?dateFrom=${formattedDateFrom}&dateTo=${formattedDateTo}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка получения затрат: ${response.status}`);
    }

    const data = await response.json();
    return data.upds || [];
  } catch (error) {
    console.error('Ошибка при получении затрат:', error);
    return [];
  }
};

/**
 * Получает статистику рекламных кампаний
 * @param dateFrom Начальная дата
 * @param dateTo Конечная дата
 * @param advertIds Массив ID кампаний
 * @param apiKey API ключ
 * @returns Promise<any[]>
 */
export const getAdvertStats = async (
  dateFrom: Date,
  dateTo: Date,
  advertIds: number[],
  apiKey: string
): Promise<any[]> => {
  try {
    const formattedDateFrom = dateFrom.toISOString().split('T')[0];
    const formattedDateTo = dateTo.toISOString().split('T')[0];
    
    const url = `https://advert-api.wildberries.ru/adv/v1/stat?dateFrom=${formattedDateFrom}&dateTo=${formattedDateTo}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey
      },
      body: JSON.stringify({
        advertIds
      })
    });

    if (!response.ok) {
      throw new Error(`Ошибка получения статистики: ${response.status}`);
    }

    const data = await response.json();
    return data.stats || [];
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    return [];
  }
};

/**
 * Получает историю пополнений рекламного счета
 * @param dateFrom Начальная дата
 * @param dateTo Конечная дата
 * @param apiKey API ключ
 * @returns Promise<any[]>
 */
export const getAdvertPayments = async (
  dateFrom: Date,
  dateTo: Date,
  apiKey: string
): Promise<any[]> => {
  try {
    const formattedDateFrom = dateFrom.toISOString().split('T')[0];
    const formattedDateTo = dateTo.toISOString().split('T')[0];
    
    const url = `https://advert-api.wildberries.ru/adv/v1/payment-history?dateFrom=${formattedDateFrom}&dateTo=${formattedDateTo}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка получения истории платежей: ${response.status}`);
    }

    const data = await response.json();
    return data.payments || [];
  } catch (error) {
    console.error('Ошибка при получении истории платежей:', error);
    return [];
  }
};

/**
 * Получает баланс рекламного счета
 * @param apiKey API ключ
 * @returns Promise<{balance: number}>
 */
export const getAdvertBalance = async (apiKey: string): Promise<{balance: number}> => {
  try {
    const url = 'https://advert-api.wildberries.ru/adv/v1/balance';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка получения баланса: ${response.status}`);
    }

    const data = await response.json();
    return { balance: data.balance || 0 };
  } catch (error) {
    console.error('Ошибка при получении баланса:', error);
    return { balance: 0 };
  }
};

/**
 * Получает полную статистику кампании, включая товары
 * @param apiKey API ключ
 * @param advertIds Массив ID кампаний
 * @param dateFrom Начальная дата
 * @param dateTo Конечная дата
 * @returns Promise<CampaignFullStats[]>
 */
export const getCampaignFullStats = async (
  apiKey: string,
  advertIds: number[],
  dateFrom: Date,
  dateTo: Date
): Promise<CampaignFullStats[]> => {
  try {
    const formattedDateFrom = dateFrom.toISOString().split('T')[0];
    const formattedDateTo = dateTo.toISOString().split('T')[0];
    
    const url = `https://advert-api.wildberries.ru/adv/v2/fullstat?dateFrom=${formattedDateFrom}&dateTo=${formattedDateTo}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey
      },
      body: JSON.stringify({
        advertIds
      })
    });

    if (!response.ok) {
      throw new Error(`Ошибка получения полной статистики: ${response.status}`);
    }

    const data = await response.json();
    return data.fullstats || [];
  } catch (error) {
    console.error('Ошибка при получении полной статистики:', error);
    return [];
  }
};
