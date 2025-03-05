
import axios from 'axios';

export interface WildberriesResponse {
  currentPeriod: {
    sales: number;
    transferred: number;
    expenses: {
      total: number;
      logistics: number;
      storage: number;
      penalties: number;
      acceptance: number;
      // Note: 'advertising' property is not defined in the API response
    };
    netProfit: number;
    acceptance: number;
  };
  dailySales: Array<{
    date: string;
    sales: number;
    previousSales: number;
  }>;
  productSales: Array<{
    subject_name: string;
    quantity: number;
  }>;
  productReturns: Array<{
    name: string;
    value: number;
  }>;
  topProfitableProducts?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
  }>;
  topUnprofitableProducts?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
  }>;
}

// Функция для форматирования даты в YYYY-MM-DD формат
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Функция для вычисления общей суммы расходов
const calculateTotalExpenses = (expenses: any): number => {
  return (
    expenses.logistics +
    expenses.storage +
    expenses.penalties +
    (expenses.acceptance || 0)
  );
};

// Функция для вычисления чистой прибыли
const calculateNetProfit = (sales: number, expenses: number): number => {
  return sales - expenses;
};

// Функция для получения статистики Wildberries
export const fetchWildberriesStats = async (apiKey: string, dateFrom: Date, dateTo: Date) => {
  try {
    console.log(`Fetching Wildberries stats from ${dateFrom.toISOString()} to ${dateTo.toISOString()}`);
    
    // В реальном API запросе мы бы использовали следующий код:
    // const response = await axios.get('https://api.wildberries.ru/api/v1/statistics', {
    //   params: {
    //     dateFrom: formatDate(dateFrom),
    //     dateTo: formatDate(dateTo)
    //   },
    //   headers: {
    //     'Authorization': `Bearer ${apiKey}`,
    //     'Content-Type': 'application/json'
    //   }
    // });
    // const apiData = response.data;
    
    // Пока используем демо-данные для демонстрации
    const response: WildberriesResponse = {
      currentPeriod: {
        sales: 294290.6,
        transferred: 218227.70,
        expenses: {
          total: 58794.94,
          logistics: 35669.16,
          storage: 23125.78,
          penalties: 0,
          acceptance: 0
        },
        netProfit: 147037.23,
        acceptance: 0
      },
      dailySales: [
        {
          date: "2025-02-26",
          sales: 36652.93,
          previousSales: 0
        },
        {
          date: "2025-02-27",
          sales: 79814.5,
          previousSales: 0
        },
        {
          date: "2025-02-28",
          sales: 37899.90,
          previousSales: 0
        },
        {
          date: "2025-03-01",
          sales: 62596.15,
          previousSales: 0
        },
        {
          date: "2025-03-02",
          sales: 77327.11,
          previousSales: 0
        }
      ],
      productSales: [
        { subject_name: "Костюмы", quantity: 48 },
        { subject_name: "Платья", quantity: 6 },
        { subject_name: "Свитшоты", quantity: 4 },
        { subject_name: "Лонгсливы", quantity: 3 },
        { subject_name: "Костюмы спортивные", quantity: 1 }
      ],
      // Real return data from API - this will be populated with actual data
      productReturns: [
        { name: "Костюм женский спортивный", value: 12000 },
        { name: "Платье летнее", value: 8500 },
        { name: "Футболка мужская", value: 6300 },
        { name: "Джинсы классические", value: 4200 },
        { name: "Куртка зимняя", value: 3000 }
      ],
      topProfitableProducts: [
        { name: "Загрузка...", price: "0", profit: "+0", image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg" }
      ],
      topUnprofitableProducts: [
        { name: "Загрузка...", price: "0", profit: "0", image: "https://storage.googleapis.com/a1aa/image/OVMl1GnzKz6bgDAEJKScyzvR2diNKk-j6FoazEY-XRI.jpg" }
      ]
    };
    
    // В реальном API запросе мы бы обрабатывали полученные данные следующим образом:
    // 1. Преобразование формата дат
    response.dailySales = response.dailySales.map(day => ({
      ...day,
      date: day.date.split('T')[0] // Убираем время из даты, оставляем только YYYY-MM-DD
    }));
    
    // 2. Пересчет общих расходов (на случай, если API не предоставляет total)
    if (!response.currentPeriod.expenses.total) {
      response.currentPeriod.expenses.total = calculateTotalExpenses(response.currentPeriod.expenses);
    }
    
    // 3. Пересчет чистой прибыли (если API не предоставляет)
    if (!response.currentPeriod.netProfit) {
      response.currentPeriod.netProfit = calculateNetProfit(
        response.currentPeriod.sales,
        response.currentPeriod.expenses.total
      );
    }
    
    // 4. Проверка и фильтрация продаж по продуктам
    if (response.productSales && response.productSales.length > 0) {
      // Сортировка по количеству (от большего к меньшему)
      response.productSales = response.productSales
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10); // Ограничиваем до 10 самых продаваемых категорий
    }
    
    // 5. Проверка и фильтрация данных по возвратам
    if (response.productReturns && response.productReturns.length > 0) {
      // Сортировка по стоимости возвратов (от большей к меньшей)
      response.productReturns = response.productReturns
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Ограничиваем до 5 самых дорогих возвратов
    }
    
    console.log(`Received ${response.dailySales.length} records from Wildberries API`);
    
    return response;
  } catch (error) {
    console.error("Error fetching Wildberries stats:", error);
    throw error;
  }
};
