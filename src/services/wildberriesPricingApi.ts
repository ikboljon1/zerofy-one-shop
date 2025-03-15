
import axios from 'axios';
import { Product } from '@/types/product';

interface PriceResponse {
  nmId: number;
  price: number;
  discount: number;
  promoCode: number;
}

interface SalesResponse {
  nmId: number;
  quantity: number;
  totalPrice: number;
  date: string;
}

interface StorageCostResponse {
  nmId: number;
  storageCost: number;
  date: string;
}

// Получение цен товаров
export async function fetchProductPrices(apiKey: string, nmIds: number[]): Promise<Record<number, number>> {
  try {
    const response = await axios.get('https://suppliers-api.wildberries.ru/public/api/v1/info', {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      params: {
        quantity: 0
      }
    });

    // Преобразуем ответ в удобный формат
    const priceData: Record<number, number> = {};
    if (response.data && Array.isArray(response.data)) {
      response.data.forEach((item: any) => {
        if (item.nmId && nmIds.includes(item.nmId)) {
          priceData[item.nmId] = item.price / 100; // Цены обычно приходят в копейках
        }
      });
    }

    return priceData;
  } catch (error) {
    console.error('Ошибка при получении цен товаров:', error);
    return {};
  }
}

// Получение данных о продажах за период
export async function fetchSalesData(
  apiKey: string, 
  dateFrom: string, 
  dateTo: string
): Promise<Record<number, number>> {
  try {
    const response = await axios.get('https://statistics-api.wildberries.ru/api/v1/supplier/sales', {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      params: {
        dateFrom,
        dateTo
      }
    });

    // Рассчитываем среднее количество продаж в день по каждому товару
    const salesData: Record<number, { total: number, days: Set<string> }> = {};
    
    if (response.data && Array.isArray(response.data)) {
      response.data.forEach((item: any) => {
        if (item.nmId && item.date) {
          if (!salesData[item.nmId]) {
            salesData[item.nmId] = { total: 0, days: new Set() };
          }
          salesData[item.nmId].total += item.quantity || 1;
          salesData[item.nmId].days.add(item.date.split('T')[0]);
        }
      });
    }

    // Преобразуем в среднее количество продаж в день
    const dailySalesData: Record<number, number> = {};
    for (const [nmId, data] of Object.entries(salesData)) {
      const numDays = data.days.size || 1;
      dailySalesData[Number(nmId)] = data.total / numDays;
    }

    return dailySalesData;
  } catch (error) {
    console.error('Ошибка при получении данных о продажах:', error);
    return {};
  }
}

// Получение данных о стоимости хранения за период
export async function fetchStorageCostData(
  apiKey: string, 
  dateFrom: string, 
  dateTo: string
): Promise<Record<number, number>> {
  try {
    const response = await axios.get('https://suppliers-api.wildberries.ru/api/v3/warehouses/paid-storage/daily', {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      params: {
        dateFrom,
        dateTo
      }
    });

    // Рассчитываем среднюю стоимость хранения в день по каждому товару
    const storageCostData: Record<number, { total: number, count: number }> = {};
    
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      response.data.data.forEach((item: any) => {
        if (item.nmId && item.warehousePrice !== undefined) {
          if (!storageCostData[item.nmId]) {
            storageCostData[item.nmId] = { total: 0, count: 0 };
          }
          storageCostData[item.nmId].total += item.warehousePrice || 0;
          storageCostData[item.nmId].count += 1;
        }
      });
    }

    // Преобразуем в среднюю стоимость хранения в день
    const dailyStorageCostData: Record<number, number> = {};
    for (const [nmId, data] of Object.entries(storageCostData)) {
      dailyStorageCostData[Number(nmId)] = data.count > 0 ? data.total / data.count : 5; // По умолчанию 5 руб.
    }

    return dailyStorageCostData;
  } catch (error) {
    console.error('Ошибка при получении данных о стоимости хранения:', error);
    return {};
  }
}

// Получение данных о себестоимости товаров из карточек товаров
export async function fetchProductCostPrices(apiKey: string, nmIds: number[]): Promise<Record<number, number>> {
  try {
    // В API Wildberries нет прямого метода для получения себестоимости,
    // поэтому мы можем использовать карточки товаров, если в них указана себестоимость
    const response = await axios.get('https://suppliers-api.wildberries.ru/card/list', {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      data: {
        nmID: nmIds
      }
    });

    const costPrices: Record<number, number> = {};
    
    if (response.data && Array.isArray(response.data.data)) {
      response.data.data.forEach((item: any) => {
        if (item.nmID && item.costPrice) {
          costPrices[item.nmID] = item.costPrice;
        }
      });
    }

    return costPrices;
  } catch (error) {
    console.error('Ошибка при получении данных о себестоимости:', error);
    return {};
  }
}

// Получение данных о комиссии Wildberries
export async function fetchWbCommissions(apiKey: string, nmIds: number[]): Promise<Record<number, number>> {
  try {
    // В API Wildberries нет прямого метода для получения комиссии,
    // поэтому используем стандартное значение 15% или пытаемся получить из другого источника
    const commissions: Record<number, number> = {};
    
    // Можно запросить категории товаров и на основе категории определить комиссию
    const response = await axios.get('https://suppliers-api.wildberries.ru/public/api/v1/info', {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      params: {
        quantity: 0
      }
    });

    if (response.data && Array.isArray(response.data)) {
      response.data.forEach((item: any) => {
        if (item.nmId && nmIds.includes(item.nmId)) {
          // По умолчанию комиссия 15%, но может быть изменена в зависимости от категории
          commissions[item.nmId] = 15;
          
          // Здесь можно добавить логику определения комиссии на основе категории товара
          // if (item.subjectId === 123) {
          //   commissions[item.nmId] = 20;
          // }
        }
      });
    }

    // Для товаров, по которым не удалось определить комиссию, устанавливаем значение по умолчанию
    nmIds.forEach(nmId => {
      if (!commissions[nmId]) {
        commissions[nmId] = 15;
      }
    });

    return commissions;
  } catch (error) {
    console.error('Ошибка при получении данных о комиссии:', error);
    return {};
  }
}

// Получение всех необходимых данных для анализа рентабельности хранения
export async function fetchAllProductData(
  apiKey: string, 
  nmIds: number[],
  dateFrom: string, 
  dateTo: string
): Promise<{
  prices: Record<number, number>,
  costPrices: Record<number, number>,
  salesRates: Record<number, number>,
  storageCosts: Record<number, number>,
  commissions: Record<number, number>
}> {
  try {
    const [prices, costPrices, salesRates, storageCosts, commissions] = await Promise.all([
      fetchProductPrices(apiKey, nmIds),
      fetchProductCostPrices(apiKey, nmIds),
      fetchSalesData(apiKey, dateFrom, dateTo),
      fetchStorageCostData(apiKey, dateFrom, dateTo),
      fetchWbCommissions(apiKey, nmIds)
    ]);

    return {
      prices,
      costPrices,
      salesRates,
      storageCosts,
      commissions
    };
  } catch (error) {
    console.error('Ошибка при получении всех данных для анализа:', error);
    return {
      prices: {},
      costPrices: {},
      salesRates: {},
      storageCosts: {},
      commissions: {}
    };
  }
}
