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

export interface Campaign {
  id: number;
  name: string;
  status: number;
}

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

interface AdvertPayment {
  id: number;
  date: string;
  sum: number;
  type: string;
  statusId: number;
  cardStatus: string;
}

// API endpoints
const BASE_URL = 'https://advert-api.wildberries.ru/adv';
const ADVERTISING_API_URL = `${BASE_URL}/v2/fullstats`;
const CAMPAIGNS_API_URL = `${BASE_URL}/v2/adverts`;
const COSTS_API_URL = `${BASE_URL}/v1/upd`;
const PAYMENTS_API_URL = `${BASE_URL}/v1/payments`;

export const fetchAdvertisingStats = async (
  apiKey: string,
  campaignIds: number[],
  dateFrom: Date,
  dateTo: Date
): Promise<AdvertisingStats[]> => {
  try {
    const payload = campaignIds.map(id => ({
      id,
      dates: [
        dateFrom.toISOString().split('T')[0],
        dateTo.toISOString().split('T')[0]
      ]
    }));

    console.log('Fetching advertising stats:', {
      url: ADVERTISING_API_URL,
      payload
    });

    const response = await fetch(ADVERTISING_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
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

export const fetchAdvertCosts = async (
  apiKey: string,
  dateFrom: Date,
  dateTo: Date
): Promise<AdvertCost[]> => {
  try {
    const params = new URLSearchParams({
      from: dateFrom.toISOString().split('T')[0],
      to: dateTo.toISOString().split('T')[0]
    });

    const response = await fetch(`${COSTS_API_URL}?${params}`, {
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
      throw new Error(`Failed to fetch advert costs: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching advert costs:', error);
    throw error;
  }
};

export const fetchAdvertPayments = async (
  apiKey: string,
  dateFrom: Date,
  dateTo: Date
): Promise<AdvertPayment[]> => {
  try {
    const params = new URLSearchParams({
      from: dateFrom.toISOString().split('T')[0],
      to: dateTo.toISOString().split('T')[0]
    });

    const response = await fetch(`${PAYMENTS_API_URL}?${params}`, {
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
      throw new Error(`Failed to fetch advert payments: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching advert payments:', error);
    throw error;
  }
};