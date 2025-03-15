
import axios from 'axios';
import { format } from 'date-fns';

interface ProductSalesStats {
  nmId: number;
  dailySalesRate: number;  // Средняя продажа в день
  sellingPrice: number;    // Цена продажи
  storageCost: number;     // Стоимость хранения
  costPrice?: number;      // Себестоимость
  logisticsCost?: number;  // Стоимость логистики
  wbCommission?: number;   // Комиссия Wildberries
}

/**
 * Получение средней дневной продажи по nmId из сохраненных данных
 * @param nmId - ID товара в WB
 * @param storeId - ID магазина
 * @returns Средняя дневная продажа или undefined если данных нет
 */
export const getDailySalesRateByNmId = (nmId: number, storeId: string = 'default'): number | undefined => {
  try {
    // Пробуем найти данные в сохраненной аналитике
    const analyticsKey = `marketplace_analytics_${storeId}`;
    const analyticsData = localStorage.getItem(analyticsKey);
    
    if (analyticsData) {
      const parsed = JSON.parse(analyticsData);
      
      if (parsed?.data?.dailySales) {
        // Проходим по дням продаж и ищем товар с указанным nmId
        let totalSales = 0;
        let daysWithSales = 0;
        
        parsed.data.dailySales.forEach((day: any) => {
          if (day?.sales && Array.isArray(day.sales)) {
            const productSales = day.sales.filter((sale: any) => 
              (sale.nmId === nmId || sale.nm_id === nmId)
            );
            
            if (productSales.length > 0) {
              totalSales += productSales.reduce((sum: number, sale: any) => 
                sum + Math.abs(sale.quantity || 0), 0);
              daysWithSales++;
            }
          }
        });
        
        if (daysWithSales > 0) {
          return totalSales / daysWithSales;
        }
      }
    }
    
    // Если в аналитике не нашли, проверяем в localStorage
    const salesRatesKey = `product_sales_rates_${storeId}`;
    const storedSalesRates = localStorage.getItem(salesRatesKey);
    
    if (storedSalesRates) {
      const salesRates = JSON.parse(storedSalesRates);
      if (salesRates[nmId] !== undefined) {
        return salesRates[nmId];
      }
    }
    
    // Если нигде не нашли, возвращаем undefined
    return undefined;
  } catch (error) {
    console.error(`Ошибка при получении средней продажи для nmId ${nmId}:`, error);
    return undefined;
  }
};

/**
 * Получение стоимости хранения по nmId из сохраненных данных
 * @param nmId - ID товара в WB
 * @param storeId - ID магазина
 * @returns Стоимость хранения или undefined если данных нет
 */
export const getStorageCostByNmId = (nmId: number, storeId: string = 'default'): number | undefined => {
  try {
    // Сначала проверяем в сохраненных данных о платном хранении
    const storageCostsKey = `product_storage_costs_${storeId}`;
    const storedStorageCosts = localStorage.getItem(storageCostsKey);
    
    if (storedStorageCosts) {
      const storageCosts = JSON.parse(storedStorageCosts);
      if (storageCosts[nmId] !== undefined) {
        return storageCosts[nmId];
      }
    }
    
    // Затем проверяем в отчете о платном хранении
    const paidStorageKey = `paid_storage_report_${storeId}`;
    const paidStorageData = localStorage.getItem(paidStorageKey);
    
    if (paidStorageData) {
      const storageItems = JSON.parse(paidStorageData);
      const matchingItems = storageItems.filter((item: any) => item.nmId === nmId);
      
      if (matchingItems.length > 0) {
        const totalCost = matchingItems.reduce((sum: number, item: any) => 
          sum + (item.warehousePrice || 0), 0);
        return totalCost / matchingItems.length;
      }
    }
    
    // Если нигде не нашли, возвращаем дефолтное значение
    return 5; // Дефолтная стоимость хранения
  } catch (error) {
    console.error(`Ошибка при получении стоимости хранения для nmId ${nmId}:`, error);
    return 5; // Дефолтная стоимость хранения
  }
};

/**
 * Получение цены продажи по nmId
 * @param nmId - ID товара в WB
 * @param storeId - ID магазина
 * @returns Цена продажи или undefined если данных нет
 */
export const getSellingPriceByNmId = (nmId: number, storeId: string = 'default'): number | undefined => {
  try {
    // Сначала проверяем в сохраненных ценах продаж
    const sellingPricesKey = `product_selling_prices`;
    const storedSellingPrices = localStorage.getItem(sellingPricesKey);
    
    if (storedSellingPrices) {
      const sellingPrices = JSON.parse(storedSellingPrices);
      if (sellingPrices[nmId] !== undefined && sellingPrices[nmId] !== null) {
        return sellingPrices[nmId];
      }
    }
    
    // Затем проверяем в продуктах
    const productsKey = `products_${storeId}`;
    const productsData = localStorage.getItem(productsKey);
    
    if (productsData) {
      const products = JSON.parse(productsData);
      const product = products.find((p: any) => p.nmId === nmId || p.nmID === nmId);
      
      if (product && product.price) {
        return product.price;
      }
    }
    
    // Затем проверяем в данных склада
    const warehouseKey = `warehouse_remains_${storeId}`;
    const warehouseData = localStorage.getItem(warehouseKey);
    
    if (warehouseData) {
      const remains = JSON.parse(warehouseData);
      const item = remains.find((r: any) => r.nmId === nmId);
      
      if (item && item.price) {
        return item.price;
      }
    }
    
    // Если нигде не нашли, возвращаем undefined
    return undefined;
  } catch (error) {
    console.error(`Ошибка при получении цены продажи для nmId ${nmId}:`, error);
    return undefined;
  }
};

/**
 * Получение себестоимости по nmId
 * @param nmId - ID товара в WB
 * @param storeId - ID магазина
 * @returns Себестоимость или undefined если данных нет
 */
export const getCostPriceByNmId = (nmId: number, storeId: string = 'default'): number | undefined => {
  try {
    // Сначала проверяем в сохраненных себестоимостях
    const costPricesKey = `product_cost_prices`;
    const storedCostPrices = localStorage.getItem(costPricesKey);
    
    if (storedCostPrices) {
      const costPrices = JSON.parse(storedCostPrices);
      if (costPrices[nmId] !== undefined && costPrices[nmId] !== null) {
        return costPrices[nmId];
      }
    }
    
    // Затем проверяем в costPrices, которые хранятся для магазина
    const storeSpecificKey = `costPrices_${storeId}`;
    const storeSpecificPrices = localStorage.getItem(storeSpecificKey);
    
    if (storeSpecificPrices) {
      const costPrices = JSON.parse(storeSpecificPrices);
      if (costPrices[nmId] !== undefined) {
        return costPrices[nmId];
      }
    }
    
    // Затем проверяем в продуктах
    const productsKey = `products_${storeId}`;
    const productsData = localStorage.getItem(productsKey);
    
    if (productsData) {
      const products = JSON.parse(productsData);
      const product = products.find((p: any) => p.nmId === nmId || p.nmID === nmId);
      
      if (product && product.costPrice) {
        return product.costPrice;
      }
    }
    
    // Если нигде не нашли, возвращаем undefined
    return undefined;
  } catch (error) {
    console.error(`Ошибка при получении себестоимости для nmId ${nmId}:`, error);
    return undefined;
  }
};

/**
 * Получение комплексной статистики по товару
 * @param nmId - ID товара в WB
 * @param storeId - ID магазина
 * @returns Объект со статистикой товара
 */
export const getProductStats = (nmId: number, storeId: string = 'default'): ProductSalesStats => {
  const dailySalesRate = getDailySalesRateByNmId(nmId, storeId) || 0.1;
  const storageCost = getStorageCostByNmId(nmId, storeId) || 5;
  const sellingPrice = getSellingPriceByNmId(nmId, storeId) || 0;
  const costPrice = getCostPriceByNmId(nmId, storeId);
  
  // Получаем дополнительные параметры из localStorage
  let logisticsCost: number | undefined;
  let wbCommission: number | undefined;
  
  try {
    const logisticsCostsKey = `product_logistics_costs`;
    const storedLogisticsCosts = localStorage.getItem(logisticsCostsKey);
    
    if (storedLogisticsCosts) {
      const logisticsCosts = JSON.parse(storedLogisticsCosts);
      if (logisticsCosts[nmId] !== undefined && logisticsCosts[nmId] !== null) {
        logisticsCost = logisticsCosts[nmId];
      }
    }
    
    const wbCommissionsKey = `product_wb_commissions`;
    const storedWbCommissions = localStorage.getItem(wbCommissionsKey);
    
    if (storedWbCommissions) {
      const wbCommissions = JSON.parse(storedWbCommissions);
      if (wbCommissions[nmId] !== undefined && wbCommissions[nmId] !== null) {
        wbCommission = wbCommissions[nmId];
      }
    }
  } catch (error) {
    console.error(`Ошибка при получении дополнительных параметров для nmId ${nmId}:`, error);
  }
  
  return {
    nmId,
    dailySalesRate,
    storageCost,
    sellingPrice,
    costPrice,
    logisticsCost,
    wbCommission
  };
};

/**
 * Сохранение данных о статистике по товару
 * @param nmId - ID товара в WB
 * @param stats - Обновленная статистика товара
 * @param storeId - ID магазина
 */
export const saveProductStats = (
  nmId: number, 
  stats: Partial<ProductSalesStats>, 
  storeId: string = 'default'
): void => {
  try {
    // Сохраняем данные о продажах
    if (stats.dailySalesRate !== undefined) {
      const salesRatesKey = `product_sales_rates_${storeId}`;
      const storedSalesRates = localStorage.getItem(salesRatesKey) || '{}';
      const salesRates = JSON.parse(storedSalesRates);
      
      salesRates[nmId] = stats.dailySalesRate;
      localStorage.setItem(salesRatesKey, JSON.stringify(salesRates));
    }
    
    // Сохраняем данные о стоимости хранения
    if (stats.storageCost !== undefined) {
      const storageCostsKey = `product_storage_costs_${storeId}`;
      const storedStorageCosts = localStorage.getItem(storageCostsKey) || '{}';
      const storageCosts = JSON.parse(storedStorageCosts);
      
      storageCosts[nmId] = stats.storageCost;
      localStorage.setItem(storageCostsKey, JSON.stringify(storageCosts));
    }
    
    // Сохраняем данные о цене продажи
    if (stats.sellingPrice !== undefined) {
      const sellingPricesKey = `product_selling_prices`;
      const storedSellingPrices = localStorage.getItem(sellingPricesKey) || '{}';
      const sellingPrices = JSON.parse(storedSellingPrices);
      
      sellingPrices[nmId] = stats.sellingPrice;
      localStorage.setItem(sellingPricesKey, JSON.stringify(sellingPrices));
    }
    
    // Сохраняем данные о себестоимости
    if (stats.costPrice !== undefined) {
      const costPricesKey = `product_cost_prices`;
      const storedCostPrices = localStorage.getItem(costPricesKey) || '{}';
      const costPrices = JSON.parse(storedCostPrices);
      
      costPrices[nmId] = stats.costPrice;
      localStorage.setItem(costPricesKey, JSON.stringify(costPrices));
    }
    
    // Сохраняем данные о стоимости логистики
    if (stats.logisticsCost !== undefined) {
      const logisticsCostsKey = `product_logistics_costs`;
      const storedLogisticsCosts = localStorage.getItem(logisticsCostsKey) || '{}';
      const logisticsCosts = JSON.parse(storedLogisticsCosts);
      
      logisticsCosts[nmId] = stats.logisticsCost;
      localStorage.setItem(logisticsCostsKey, JSON.stringify(logisticsCosts));
    }
    
    // Сохраняем данные о комиссии WB
    if (stats.wbCommission !== undefined) {
      const wbCommissionsKey = `product_wb_commissions`;
      const storedWbCommissions = localStorage.getItem(wbCommissionsKey) || '{}';
      const wbCommissions = JSON.parse(storedWbCommissions);
      
      wbCommissions[nmId] = stats.wbCommission;
      localStorage.setItem(wbCommissionsKey, JSON.stringify(wbCommissions));
    }
  } catch (error) {
    console.error(`Ошибка при сохранении статистики для nmId ${nmId}:`, error);
  }
};

/**
 * Получение данных о продажах из Wildberries API
 * @param apiKey - API ключ Wildberries
 * @param dateFrom - Начальная дата периода
 * @param dateTo - Конечная дата периода
 * @returns Объект с данными о продажах и хранении
 */
export const fetchSalesAndStorageData = async (
  apiKey: string,
  dateFrom: Date,
  dateTo: Date
): Promise<{
  sales: Record<number, number>,
  storage: Record<number, number>
}> => {
  try {
    const formattedStartDate = format(dateFrom, 'yyyy-MM-dd');
    const formattedEndDate = format(dateTo, 'yyyy-MM-dd');
    
    // Получение данных о продажах
    const salesDataUrl = "https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod";
    const headers = {
      "Authorization": apiKey,
    };
    
    let allSalesData: any[] = [];
    let next_rrdid = 0;
    
    while (true) {
      const params = {
        dateFrom: formattedStartDate,
        dateTo: formattedEndDate,
        rrdid: next_rrdid.toString(),
        limit: "100000", // Максимальное значение лимита
      };
      
      const response = await axios.get(salesDataUrl, { 
        headers, 
        params 
      });
      
      if (response.status !== 200) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      const data = response.data;
      if (data && Array.isArray(data)) {
        allSalesData = allSalesData.concat(data);
        if (data.length > 0) {
          const lastRecord = data[data.length - 1];
          next_rrdid = lastRecord.rrd_id || 0;
        } else {
          break; // Нет больше данных
        }
        
        if (!next_rrdid) {
          break; // Нет next_rrdid, завершаем пагинацию
        }
      } else {
        break; // Нет данных или данные не в ожидаемом формате
      }
    }
    
    // Получение данных о стоимости хранения
    const createReportUrl = "https://seller-analytics-api.wildberries.ru/api/v1/paid_storage";
    const downloadReportUrl = "https://seller-analytics-api.wildberries.ru/api/v1/paid_storage/tasks";
    const storageHeaders = {
      "Authorization": apiKey,
      "Content-Type": "application/json"
    };
    
    const formattedStartDateStorage = format(dateFrom, "yyyy-MM-dd'T'HH:mm:ss");
    const formattedEndDateStorage = format(dateTo, "yyyy-MM-dd'T'HH:mm:ss");
    
    // Создание задачи на отчет
    const createReportResponse = await axios.get(createReportUrl, { 
      headers: storageHeaders, 
      params: {
        dateFrom: formattedStartDateStorage,
        dateTo: formattedEndDateStorage
      }
    });
    
    if (createReportResponse.status !== 200) {
      throw new Error(`Ошибка создания отчета о хранении HTTP: ${createReportResponse.status}`);
    }
    
    const createReportJson = createReportResponse.data;
    const taskId = createReportJson.data?.taskId;
    
    if (!taskId) {
      throw new Error("Не удалось получить taskId для отчета о хранении");
    }
    
    // Ожидание и проверка статуса отчета
    let status = null;
    let attempts = 0;
    const maxAttempts = 20;
    
    while (status !== "done" && attempts < maxAttempts) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 5000)); // Ждем 5 секунд
      
      const statusResponse = await axios.get(`${downloadReportUrl}/${taskId}/status`, { headers: storageHeaders });
      
      if (statusResponse.status !== 200) {
        throw new Error(`Ошибка проверки статуса отчета HTTP: ${statusResponse.status}`);
      }
      
      const statusJson = statusResponse.data;
      status = statusJson.data?.status;
      
      if (status === "done") {
        break;
      } else if (status === "canceled" || status === "purged") {
        throw new Error(`Отчет о хранении отменен или удален. Статус: ${status}`);
      } else if (status !== "processing" && status !== "new") {
        throw new Error(`Неожиданный статус отчета о хранении: ${status}`);
      }
    }
    
    if (status !== "done") {
      throw new Error("Время ожидания отчета о хранении истекло или отчет не готов.");
    }
    
    // Скачивание отчета
    const downloadResponse = await axios.get(`${downloadReportUrl}/${taskId}/download`, { headers: storageHeaders });
    
    if (downloadResponse.status !== 200) {
      throw new Error(`Ошибка скачивания отчета HTTP: ${downloadResponse.status}`);
    }
    
    const storageReportData = downloadResponse.data;
    
    // Обработка данных о продажах и преобразование в нужный формат
    const processedSalesData: Record<number, number> = {};
    
    if (allSalesData && Array.isArray(allSalesData)) {
      const salesByNmId: Record<number, { totalQuantity: number }> = {};
      
      for (const record of allSalesData) {
        const nmId = record.nm_id;
        
        if (record.doc_type_name === 'Продажа') {
          salesByNmId[nmId] = salesByNmId[nmId] || { totalQuantity: 0 };
          salesByNmId[nmId].totalQuantity += record.quantity;
        }
      }
      
      const daysInPeriod = (dateTo.getTime() - dateFrom.getTime()) / (1000 * 3600 * 24) + 1;
      
      for (const nmId in salesByNmId) {
        processedSalesData[Number(nmId)] = salesByNmId[nmId].totalQuantity / daysInPeriod;
      }
    }
    
    // Обработка данных о стоимости хранения и преобразование
    const processedStorageCosts: Record<number, number> = {};
    
    if (storageReportData && Array.isArray(storageReportData)) {
      const storageCostsByNmId: Record<number, { totalCost: number, dayCount: number }> = {};
      
      for (const record of storageReportData) {
        const nmId = record.nmId;
        const warehousePrice = record.warehousePrice;
        
        if (nmId && warehousePrice !== undefined && warehousePrice !== null) {
          storageCostsByNmId[nmId] = storageCostsByNmId[nmId] || { totalCost: 0, dayCount: 0 };
          storageCostsByNmId[nmId].totalCost += warehousePrice;
          storageCostsByNmId[nmId].dayCount++;
        }
      }
      
      for (const nmId in storageCostsByNmId) {
        const data = storageCostsByNmId[nmId];
        processedStorageCosts[Number(nmId)] = data.dayCount > 0 ? data.totalCost / data.dayCount : 0;
      }
    }
    
    return {
      sales: processedSalesData,
      storage: processedStorageCosts
    };
  } catch (error) {
    console.error("Ошибка при получении данных о продажах и хранении:", error);
    throw error;
  }
};
