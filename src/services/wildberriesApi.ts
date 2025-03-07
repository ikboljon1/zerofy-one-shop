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

/**
 * Функция для получения детального отчета по периоду от API Wildberries
 * @param apiKey API ключ пользователя
 * @param dateFrom Начальная дата в формате Date
 * @param dateTo Конечная дата в формате Date
 * @param rrdid ID для пагинации, по умолчанию 0
 * @returns Данные отчета и ID для следующей страницы или null в случае ошибки
 */
export const fetchReportDetailByPeriod = async (
  apiKey: string,
  dateFrom: Date,
  dateTo: Date,
  rrdid: number = 0
) => {
  try {
    // Форматируем даты в строки YYYY-MM-DD
    const formattedDateFrom = dateFrom.toISOString().split('T')[0];
    const formattedDateTo = dateTo.toISOString().split('T')[0];
    
    const url = "https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod";
    const headers = {
      "Authorization": apiKey,
    };
    const params = {
      "dateFrom": formattedDateFrom,
      "dateTo": formattedDateTo,
      "rrdid": rrdid,
      "limit": 100000,
    };
    
    console.log(`Запрос отчета о продажах с ${formattedDateFrom} по ${formattedDateTo}, rrdid: ${rrdid}`);
    
    // Здесь должен быть реальный запрос к API, но для демонстрации используем mock
    const response = await fetch(`${url}?dateFrom=${params.dateFrom}&dateTo=${params.dateTo}&rrdid=${params.rrdid}&limit=${params.limit}`, {
      headers: headers
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    let nextRrdid = 0;
    
    if (data && data.length > 0) {
      const lastRecord = data[data.length - 1];
      nextRrdid = lastRecord.rrd_id || 0;
    }
    
    return { data, nextRrdid };
  } catch (error) {
    console.error('Ошибка при запросе к API:', error);
    return { data: null, nextRrdid: 0 };
  }
};

/**
 * Функция для получения отчета о платной приемке
 * @param apiKey API ключ пользователя
 * @param dateFrom Начальная дата в формате Date
 * @param dateTo Конечная дата в формате Date
 * @returns Данные отчета о платной приемке или null в случае ошибки
 */
export const fetchPaidAcceptanceReport = async (
  apiKey: string,
  dateFrom: Date,
  dateTo: Date
) => {
  try {
    // Форматируем даты в строки YYYY-MM-DD
    const formattedDateFrom = dateFrom.toISOString().split('T')[0];
    const formattedDateTo = dateTo.toISOString().split('T')[0];
    
    const url = "https://seller-analytics-api.wildberries.ru/api/v1/analytics/acceptance-report";
    const headers = {
      "Authorization": apiKey,
    };
    const params = {
      "dateFrom": formattedDateFrom,
      "dateTo": formattedDateTo,
    };
    
    console.log(`Запрос отчета о платной приемке с ${formattedDateFrom} по ${formattedDateTo}`);
    
    // Здесь должен быть реальный запрос к API, но для демонстрации используем mock
    const response = await fetch(`${url}?dateFrom=${params.dateFrom}&dateTo=${params.dateTo}`, {
      headers: headers
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.report || [];
  } catch (error) {
    console.error('Ошибка при запросе к API платной приемки:', error);
    return null;
  }
};

/**
 * Функция для расчета метрик на основе данных отчета
 * @param data Данные отчета о продажах
 * @returns Объект с расчитанными метриками или null, если данных нет
 */
export const calculateMetrics = (data: any[]) => {
  if (!data || data.length === 0) {
    return null;
  }
  
  let totalSales = 0; // Продажа
  let totalForPay = 0; // К перечислению за товар
  let totalDeliveryRub = 0; // Стоимость логистики
  let totalRebillLogisticCost = 0; // Логистика (возмещение издержек)
  let totalStorageFee = 0; // Стоимость хранения
  let totalReturns = 0; // Возврат
  let totalToPay = 0; // Итого к оплате
  let totalReturnCount = 0; // Кол-во возвратов
  let returnsByNmId: Record<string, number> = {}; // Словарь для хранения информации о возвратах по nmId
  
  for (const record of data) {
    if (record.doc_type_name === 'Продажа') {
      totalSales += record.retail_price_withdisc_rub || 0;
      totalForPay += record.ppvz_for_pay || 0;
    } else if (record.doc_type_name === 'Возврат') {
      totalReturns += record.ppvz_for_pay || 0;
      totalReturnCount += 1;
      const nmId = record.nm_id;
      if (nmId) {
        if (!returnsByNmId[nmId]) {
          returnsByNmId[nmId] = 0;
        }
        returnsByNmId[nmId] += 1;
      }
    }
    
    // Учитываем расходы и доходы (для всех операций)
    totalDeliveryRub += record.delivery_rub || 0;
    totalRebillLogisticCost += record.rebill_logistic_cost || 0;
    totalStorageFee += record.storage_fee || 0;
  }
  
  // Рассчитываем итого к оплате (чистая прибыль)
  totalToPay = totalForPay - totalDeliveryRub - totalStorageFee - totalReturns;
  
  return {
    totalSales: roundToTwoDecimals(totalSales),
    totalForPay: roundToTwoDecimals(totalForPay),
    totalDeliveryRub: roundToTwoDecimals(totalDeliveryRub),
    totalRebillLogisticCost: roundToTwoDecimals(totalRebillLogisticCost),
    totalStorageFee: roundToTwoDecimals(totalStorageFee),
    totalReturns: roundToTwoDecimals(totalReturns),
    totalToPay: roundToTwoDecimals(totalToPay),
    totalReturnCount,
    returnsByNmId
  };
};

/**
 * Функция для получения всех данных отчета с пагинацией
 * @param apiKey API ключ пользователя
 * @param dateFrom Начальная дата в формате Date
 * @param dateTo Конечная дата в формате Date
 * @returns Все данные отчета или пустой массив в случае ошибки
 */
export const fetchAllReportData = async (
  apiKey: string,
  dateFrom: Date,
  dateTo: Date
) => {
  let allData: any[] = [];
  let nextRrdid = 0;
  
  while (true) {
    const { data, nextRrdid: newRrdid } = await fetchReportDetailByPeriod(apiKey, dateFrom, dateTo, nextRrdid);
    
    if (!data) {
      console.error("Ошибка при загрузке данных отчета.");
      break;
    }
    
    allData = allData.concat(data);
    
    if (data.length === 0 || !newRrdid) {
      console.log("Загрузка завершена. Больше данных нет.");
      break;
    }
    
    nextRrdid = newRrdid;
    console.log(`Загружено ${data.length} строк. Следующий rrd_id: ${nextRrdid}`);
  }
  
  return allData;
};

export const fetchWildberriesStats = async (apiKey: string, dateFrom: Date, dateTo: Date) => {
  
  try {
    // Запрашиваем все данные отчета с использованием новой логики
    const allReportData = await fetchAllReportData(apiKey, dateFrom, dateTo);
    
    // Получаем данные о платной приемке
    const paidAcceptanceData = await fetchPaidAcceptanceReport(apiKey, dateFrom, dateTo);
    
    // Рассчитываем метрики на основе данных отчета
    const metrics = calculateMetrics(allReportData);
    
    // Расчет общей суммы платной приемки
    let totalAcceptance = 0;
    if (paidAcceptanceData && paidAcceptanceData.length > 0) {
      totalAcceptance = paidAcceptanceData.reduce((sum, record) => sum + (record.total || 0), 0);
    }
    
    // Используем расчитанные метрики для формирования ответа
    let currentPeriodData = {
      sales: metrics ? metrics.totalSales : 0,
      transferred: metrics ? metrics.totalForPay : 0,
      expenses: {
        total: 0, // Будет рассчитано ниже
        logistics: metrics ? metrics.totalDeliveryRub : 0,
        storage: metrics ? metrics.totalStorageFee : 0,
        penalties: 0, // Штрафы отдельно считаем
        advertising: 0, // Реклама отдельно считаем
        acceptance: roundToTwoDecimals(totalAcceptance)
      },
      netProfit: 0, // Будет рассчитано ниже
      acceptance: roundToTwoDecimals(totalAcceptance)
    };
    
    // Расчет чистой прибыли по новой логике
    currentPeriodData.netProfit = metrics ? metrics.totalToPay : 0;
    
    // Рассчитываем общую сумму расходов
    currentPeriodData.expenses.total = roundToTwoDecimals(
      currentPeriodData.expenses.logistics +
      currentPeriodData.expenses.storage +
      currentPeriodData.expenses.penalties +
      currentPeriodData.expenses.advertising +
      currentPeriodData.expenses.acceptance
    );
    
    // Подготовка данных о возвратах
    let productReturnsData = [];
    
    if (metrics && metrics.returnsByNmId) {
      const returnEntries = Object.entries(metrics.returnsByNmId);
      if (returnEntries.length > 0) {
        productReturnsData = returnEntries.map(([nmId, count]) => {
          // Находим запись о возврате в отчете для получения суммы
          const returnRecords = allReportData.filter(record => 
            record.doc_type_name === 'Возврат' && record.nm_id === parseInt(nmId)
          );
          
          let returnValue = 0;
          if (returnRecords.length > 0) {
            returnValue = returnRecords.reduce((sum, record) => sum + (record.ppvz_for_pay || 0), 0);
          }
          
          // Находим имя товара, если есть в отчете
          let productName = `Товар ID: ${nmId}`;
          const productRecord = allReportData.find(record => record.nm_id === parseInt(nmId));
          if (productRecord && productRecord.subject_name) {
            productName = productRecord.subject_name;
          }
          
          return {
            name: productName,
            value: roundToTwoDecimals(Math.abs(returnValue)), // Используем абсолютное значение
            count,
            isNegative: true // Маркируем возвраты как отрицательные для отображения в интерфейсе
          };
        });
      }
    }
    
    // Формирование финального объекта ответа
    const response = {
      currentPeriod: currentPeriodData,
      previousPeriod: null, // Опционально, можно добавить расчет для предыдущего периода
      dailySales: [], // Данные для графиков по дням
      productSales: [], // Данные о продажах по товарам
      productReturns: productReturnsData, // Данные о возвратах
      penaltiesData: [], // Данные о штрафах - можно добавить отдельную логику для их расчета
      deductionsData: [] // Данные об удержаниях - можно добавить отдельную логику для их расчета
    };
    
    // Дополнительная логика для заполнения графиков и других данных может быть реализована здесь
    
    console.info(`Received and processed data from Wildberries API. Total returns: ${metrics ? metrics.totalReturns : 0}, Return count: ${metrics ? metrics.totalReturnCount : 0}`);
    
    return response;
  } catch (error) {
    console.error('Error in fetchWildberriesStats:', error);
    return null;
  }
};

// Добавление вспомогательной функции для округления чисел
const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100;
};
