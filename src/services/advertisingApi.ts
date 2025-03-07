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
