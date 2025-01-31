interface AdvertisingStats {
  dates: string[];
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
    cpc: number;
    sum: number;
    atbs: number;
    orders: number;
    cr: number;
    shks: number;
    sum_price: number;
  }>;
  boosterStats: Array<{
    date: string;
    position: number;
    articleId: number;
  }>;
  advertId: number;
}

interface AdvertisingRequest {
  id: number;
  dates?: string[];
}

const ADVERTISING_API_URL = 'https://advert-api.wildberries.ru/adv/v2/fullstats';

export const fetchAdvertisingStats = async (
  apiKey: string,
  campaignIds: number[],
  dateFrom: Date,
  dateTo: Date
): Promise<AdvertisingStats[]> => {
  try {
    const dates = [];
    const currentDate = new Date(dateFrom);
    
    while (currentDate <= dateTo) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const requests: AdvertisingRequest[] = campaignIds.map(id => ({
      id,
      dates
    }));

    const response = await fetch(ADVERTISING_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requests)
    });

    if (!response.ok) {
      throw new Error('Failed to fetch advertising stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching advertising stats:', error);
    throw error;
  }
};

export interface Campaign {
  id: number;
  name: string;
  status: number;
}

export const fetchCampaignsList = async (apiKey: string): Promise<Campaign[]> => {
  try {
    const response = await fetch('https://advert-api.wildberries.ru/adv/v2/list', {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch campaigns list');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching campaigns list:', error);
    throw error;
  }
};
