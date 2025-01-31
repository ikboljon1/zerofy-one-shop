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
  dates: string[];
}

export interface Campaign {
  id: number;
  name: string;
  status: number;
}

// API endpoints
const BASE_URL = 'https://advert-api.wildberries.ru';
const ADVERTISING_API_URL = `${BASE_URL}/adv/v2/fullstats`;
const CAMPAIGNS_API_URL = `${BASE_URL}/adv/v0/adverts`;

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

    console.log('Sending request to WB API:', {
      url: ADVERTISING_API_URL,
      body: JSON.stringify(requests)
    });

    const response = await fetch(ADVERTISING_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requests)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WB API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch advertising stats: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching advertising stats:', error);
    throw error;
  }
};

export const fetchCampaignsList = async (apiKey: string): Promise<Campaign[]> => {
  try {
    console.log('Fetching campaigns list from:', CAMPAIGNS_API_URL);
    
    const response = await fetch(CAMPAIGNS_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WB API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch campaigns list: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching campaigns list:', error);
    throw error;
  }
};