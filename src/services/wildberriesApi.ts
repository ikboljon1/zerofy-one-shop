interface WildberriesResponse {
  sales: number;
  transferred: number;
  expenses: number;
  netProfit: number;
}

export const fetchWildberriesStats = async (apiKey: string): Promise<WildberriesResponse> => {
  try {
    // В реальном приложении здесь будет реальный API запрос
    // Сейчас возвращаем моковые данные для демонстрации
    console.log('Fetching data with API key:', apiKey);
    
    // Имитация задержки API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      sales: 12345,
      transferred: 10234,
      expenses: 2345,
      netProfit: 8000
    };
  } catch (error) {
    console.error('Error fetching Wildberries stats:', error);
    throw new Error('Failed to fetch Wildberries statistics');
  }
};