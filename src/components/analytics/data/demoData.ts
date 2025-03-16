import axios from 'axios';

interface SalesData {
  [nmId: number]: number;
}

// Получение средних продаж за день из API Wildberries
export const fetchAverageDailySalesFromAPI = async (
  apiKey: string, 
  dateFrom: string, 
  dateTo: string
): Promise<SalesData> => {
  try {
    // Формируем ключ для периода в формате "YYYY-MM-DD_to_YYYY-MM-DD"
    const periodKey = `${dateFrom}_to_${dateTo}`;
    
    // Демо-данные для тестирования без реального API
    console.log(`Запрошены данные продаж за период: ${dateFrom} - ${dateTo}`);
    
    // В реальном приложении здесь будет запрос к API Wildberries
    // Для демонстрации создаем случайные данные
    const demoData: SalesData = {};
    const productIds = [1615121324, 1615121325, 1615121326, 1615121327, 1615121328, 1615121329];
    
    productIds.forEach(id => {
      // Генерируем случайное значение от 0.1 до 5 с одним знаком после запятой
      demoData[id] = parseFloat((Math.random() * 4.9 + 0.1).toFixed(1));
    });
    
    // Сохраняем данные в localStorage с ключом, привязанным к периоду
    saveSalesDataForPeriod(demoData, periodKey);
    
    // Оповещаем другие компоненты о получении новых данных
    dispatchSalesDataUpdatedEvent(demoData);
    
    return demoData;
  } catch (error) {
    console.error('Ошибка при получении данных о средних продажах:', error);
    throw error;
  }
};

// Функция для сохранения данных о продажах в localStorage для конкретного периода
const saveSalesDataForPeriod = (salesData: SalesData, periodKey: string) => {
  try {
    // Получаем существующие данные по всем периодам
    const existingDataJson = localStorage.getItem('average_daily_sales_by_period');
    const existingData = existingDataJson ? JSON.parse(existingDataJson) : {};
    
    // Добавляем или обновляем данные для указанного периода
    existingData[periodKey] = salesData;
    
    // Сохраняем обновленные данные в localStorage
    localStorage.setItem('average_daily_sales_by_period', JSON.stringify(existingData));
    
    // Также сохраняем последние данные в старый формат для обратной совместимости
    localStorage.setItem('average_daily_sales', JSON.stringify(salesData));
    
    console.log(`Данные о продажах для периода ${periodKey} сохранены`);
  } catch (error) {
    console.error('Ошибка при сохранении данных о продажах:', error);
  }
};

// Получение сохраненных данных о продажах для указанного периода
export const getAverageDailySalesForPeriod = (dateFrom: string, dateTo: string): SalesData | null => {
  try {
    const periodKey = `${dateFrom}_to_${dateTo}`;
    const savedDataJson = localStorage.getItem('average_daily_sales_by_period');
    
    if (savedDataJson) {
      const allPeriodsData = JSON.parse(savedDataJson);
      return allPeriodsData[periodKey] || null;
    }
    
    return null;
  } catch (error) {
    console.error('Ошибка при получении сохраненных данных о продажах:', error);
    return null;
  }
};

// Получение последних сохраненных данных о продажах
export const getAverageDailySales = (): SalesData | null => {
  try {
    const savedDataJson = localStorage.getItem('average_daily_sales');
    return savedDataJson ? JSON.parse(savedDataJson) : null;
  } catch (error) {
    console.error('Ошибка при получении сохраненных данных о продажах:', error);
    return null;
  }
};

// Функция для отправки события об обновлении данных о продажах
const dispatchSalesDataUpdatedEvent = (salesData: SalesData) => {
  try {
    const event = new CustomEvent('salesDataUpdated', {
      detail: {
        averageSalesPerDay: salesData
      }
    });
    
    window.dispatchEvent(event);
  } catch (error) {
    console.error('Ошибка при отправке события об обновлении данных о продажах:', error);
  }
};
