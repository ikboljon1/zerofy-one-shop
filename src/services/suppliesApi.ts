import axios from 'axios';
import { 
  WarehouseCoefficient,
  SupplyOptionsResponse,
  SupplyItem,
  Warehouse,
  WildberriesStock,
  StocksByCategory,
  StocksByWarehouse,
  PaidStorageItem
} from '@/types/supplies';

// Базовый URL для API поставок
const SUPPLIES_API_BASE_URL = 'https://supplies-api.wildberries.ru/api/v1';

// Функция для получения коэффициентов приемки
export const fetchAcceptanceCoefficients = async (
  apiKey: string,
  warehouseIDs?: number[]
): Promise<WarehouseCoefficient[]> => {
  try {
    // Формируем параметры запроса
    const params: Record<string, string> = {};
    if (warehouseIDs && warehouseIDs.length > 0) {
      params.warehouseIDs = warehouseIDs.join(',');
    }

    // В реальном приложении здесь был бы запрос к API
    // Сейчас используем моковые данные для демонстрации
    console.log(`Запрос коэффициентов приемки для складов: ${warehouseIDs?.join(', ') || 'всех'}`);
    
    // Имитация запроса
    const mockCoefficients: WarehouseCoefficient[] = [
      {
        date: new Date().toISOString(),
        coefficient: 0,
        warehouseID: 217081,
        warehouseName: "СЦ Брянск 2",
        allowUnload: true,
        boxTypeName: "Короба",
        boxTypeID: 2,
        storageCoef: "1.5",
        deliveryCoef: "2.0",
        deliveryBaseLiter: "10",
        deliveryAdditionalLiter: "5",
        storageBaseLiter: "10",
        storageAdditionalLiter: "3",
        isSortingCenter: true
      },
      {
        date: new Date().toISOString(),
        coefficient: 1,
        warehouseID: 205349,
        warehouseName: "Вёшки",
        allowUnload: true,
        boxTypeName: "Монопаллеты",
        boxTypeID: 5,
        storageCoef: "2.0",
        deliveryCoef: "3.0",
        deliveryBaseLiter: "15",
        deliveryAdditionalLiter: "7",
        storageBaseLiter: "20",
        storageAdditionalLiter: null,
        isSortingCenter: false
      },
      {
        date: new Date().toISOString(),
        coefficient: -1,
        warehouseID: 211622,
        warehouseName: "Подольск",
        allowUnload: false,
        boxTypeName: "Суперсейф",
        boxTypeID: 6,
        storageCoef: null,
        deliveryCoef: null,
        deliveryBaseLiter: null,
        deliveryAdditionalLiter: null,
        storageBaseLiter: null,
        storageAdditionalLiter: null,
        isSortingCenter: true
      }
    ];
    
    // В реальном приложении:
    // const response = await axios.get(`${SUPPLIES_API_BASE_URL}/acceptance/coefficients`, {
    //   headers: { Authorization: apiKey },
    //   params
    // });
    // return response.data;
    
    return mockCoefficients;
  } catch (error) {
    console.error('Ошибка при получении коэффициентов приемки:', error);
    throw error;
  }
};

// Функция для получения опций приемки
export const fetchAcceptanceOptions = async (
  apiKey: string,
  items: SupplyItem[],
  warehouseID?: number
): Promise<SupplyOptionsResponse> => {
  try {
    // Формируем параметры запроса
    const params: Record<string, string> = {};
    if (warehouseID) {
      params.warehouseID = warehouseID.toString();
    }

    console.log(`Запрос опций приемки для ${items.length} товаров`);
    
    // Моковый ответ
    const mockResponse: SupplyOptionsResponse = {
      result: items.map(item => ({
        barcode: item.barcode,
        warehouses: item.barcode.length < 5 ? null : [
          {
            warehouseID: 205349,
            canBox: true,
            canMonopallet: false,
            canSupersafe: false
          },
          {
            warehouseID: 211622,
            canBox: false,
            canMonopallet: true,
            canSupersafe: false
          }
        ],
        error: item.barcode.length < 5 ? {
          title: "barcode validation error",
          detail: `barcode ${item.barcode} is not found`
        } : undefined,
        isError: item.barcode.length < 5
      })),
      requestId: "kr53d2bRKYmkK2N6zaNKHs"
    };
    
    // В реальном приложении:
    // const response = await axios.post(`${SUPPLIES_API_BASE_URL}/acceptance/options`, items, {
    //   headers: { Authorization: apiKey },
    //   params
    // });
    // return response.data;
    
    return mockResponse;
  } catch (error) {
    console.error('Ошибка при получении опций приемки:', error);
    throw error;
  }
};

// Функция для получения списка складов
export const fetchWarehouses = async (apiKey: string): Promise<Warehouse[]> => {
  try {
    console.log('Запрос списка складов');
    
    // Моковый ответ для демонстрации
    const mockWarehouses: Warehouse[] = [
      {
        ID: 210515,
        name: "Вёшки",
        address: "Липкинское шоссе, 2-й километр, вл1с1, посёлок Вёшки, городской округ Мытищи, Московская область",
        workTime: "24/7",
        acceptsQR: false
      },
      {
        ID: 205349,
        name: "Коледино",
        address: "ул. Коледино, стр. 1, д. Коледино, Подольский р-н, Московская область",
        workTime: "24/7",
        acceptsQR: true
      },
      {
        ID: 211622,
        name: "Подольск",
        address: "ул. Поклонная, д. 3А, г. Подольск, Московская область",
        workTime: "Пн-Пт: 9:00-18:00",
        acceptsQR: true
      },
      {
        ID: 217081,
        name: "СЦ Брянск 2",
        address: "ул. Промышленная, д. 3, г. Брянск",
        workTime: "24/7",
        acceptsQR: false
      }
    ];
    
    // В реальном приложении:
    // const response = await axios.get(`${SUPPLIES_API_BASE_URL}/warehouses`, {
    //   headers: { Authorization: apiKey }
    // });
    // return response.data;
    
    return mockWarehouses;
  } catch (error) {
    console.error('Ошибка при получении списка складов:', error);
    throw error;
  }
};

// Функция для получения списка складов
export const fetchStocks = async (apiKey: string, dateFrom: string = '2020-01-01'): Promise<WildberriesStock[]> => {
  // In real environment, this would make an API call to the Wildberries API
  // For demonstration purposes, we'll return mock data
  console.log(`Fetching stocks with API key: ${apiKey} from date: ${dateFrom}`);
  
  // Mock data based on the example response
  const mockStocks: WildberriesStock[] = [
    {
      lastChangeDate: "2023-07-05T11:13:35",
      warehouseName: "Краснодар",
      supplierArticle: "443284",
      nmId: 1439871458,
      barcode: "2037401340280",
      quantity: 33,
      inWayToClient: 1,
      inWayFromClient: 0,
      quantityFull: 34,
      category: "Посуда и инвентарь",
      subject: "Формы для запекания",
      brand: "X",
      techSize: "0",
      Price: 185,
      Discount: 0,
      isSupply: true,
      isRealization: false,
      SCCode: "Tech"
    },
    {
      lastChangeDate: "2023-07-05T12:15:30",
      warehouseName: "Коледино",
      supplierArticle: "T-159",
      nmId: 2539871459,
      barcode: "2037401340281",
      quantity: 42,
      inWayToClient: 5,
      inWayFromClient: 2,
      quantityFull: 49,
      category: "Одежда",
      subject: "Футболки",
      brand: "BrandX",
      techSize: "44",
      Price: 1200,
      Discount: 15,
      isSupply: true,
      isRealization: false,
      SCCode: "Fashion"
    },
    {
      lastChangeDate: "2023-07-06T09:23:41",
      warehouseName: "Электросталь",
      supplierArticle: "J-220",
      nmId: 1439871460,
      barcode: "2037401340282",
      quantity: 18,
      inWayToClient: 2,
      inWayFromClient: 1,
      quantityFull: 21,
      category: "Одежда",
      subject: "Джинсы",
      brand: "JeansCo",
      techSize: "46",
      Price: 2300,
      Discount: 10,
      isSupply: true,
      isRealization: false,
      SCCode: "Fashion"
    },
    {
      lastChangeDate: "2023-07-06T10:45:12",
      warehouseName: "Подольск",
      supplierArticle: "SH-105",
      nmId: 1439871461,
      barcode: "2037401340283",
      quantity: 27,
      inWayToClient: 3,
      inWayFromClient: 0,
      quantityFull: 30,
      category: "Обувь",
      subject: "Кроссовки",
      brand: "SportWear",
      techSize: "42",
      Price: 3500,
      Discount: 20,
      isSupply: true,
      isRealization: false,
      SCCode: "Shoes"
    },
    {
      lastChangeDate: "2023-07-06T11:30:55",
      warehouseName: "Краснодар",
      supplierArticle: "D-310",
      nmId: 1439871462,
      barcode: "2037401340284",
      quantity: 15,
      inWayToClient: 2,
      inWayFromClient: 1,
      quantityFull: 18,
      category: "Одежда",
      subject: "Платья",
      brand: "FashionLady",
      techSize: "42",
      Price: 2800,
      Discount: 15,
      isSupply: true,
      isRealization: false,
      SCCode: "Fashion"
    },
    {
      lastChangeDate: "2023-07-07T09:15:22",
      warehouseName: "Коледино",
      supplierArticle: "JK-75",
      nmId: 1439871463,
      barcode: "2037401340285",
      quantity: 20,
      inWayToClient: 1,
      inWayFromClient: 0,
      quantityFull: 21,
      category: "Одежда",
      subject: "Куртки",
      brand: "OutdoorStyle",
      techSize: "48",
      Price: 4500,
      Discount: 10,
      isSupply: true,
      isRealization: false,
      SCCode: "Fashion"
    },
    {
      lastChangeDate: "2023-07-07T10:20:18",
      warehouseName: "Электросталь",
      supplierArticle: "SW-42",
      nmId: 1439871464,
      barcode: "2037401340286",
      quantity: 30,
      inWayToClient: 4,
      inWayFromClient: 2,
      quantityFull: 36,
      category: "Одежда",
      subject: "Свитера",
      brand: "WarmWear",
      techSize: "46",
      Price: 2100,
      Discount: 5,
      isSupply: true,
      isRealization: false,
      SCCode: "Fashion"
    },
    {
      lastChangeDate: "2023-07-07T14:35:42",
      warehouseName: "Подольск",
      supplierArticle: "BG-18",
      nmId: 1439871465,
      barcode: "2037401340287",
      quantity: 25,
      inWayToClient: 2,
      inWayFromClient: 1,
      quantityFull: 28,
      category: "Аксессуары",
      subject: "Сумки",
      brand: "BagStyle",
      techSize: "0",
      Price: 1800,
      Discount: 10,
      isSupply: true,
      isRealization: false,
      SCCode: "Accessories"
    },
    {
      lastChangeDate: "2023-07-08T08:10:33",
      warehouseName: "Краснодар",
      supplierArticle: "TS-220",
      nmId: 1439871466,
      barcode: "2037401340288",
      quantity: 40,
      inWayToClient: 5,
      inWayFromClient: 2,
      quantityFull: 47,
      category: "Электроника",
      subject: "Наушники",
      brand: "SoundMax",
      techSize: "0",
      Price: 1500,
      Discount: 20,
      isSupply: true,
      isRealization: false,
      SCCode: "Electronics"
    },
    {
      lastChangeDate: "2023-07-08T09:25:17",
      warehouseName: "Коледино",
      supplierArticle: "BS-77",
      nmId: 1439871467,
      barcode: "2037401340289",
      quantity: 22,
      inWayToClient: 3,
      inWayFromClient: 1,
      quantityFull: 26,
      category: "Одежда",
      subject: "Рубашки",
      brand: "BusinessStyle",
      techSize: "44",
      Price: 1900,
      Discount: 15,
      isSupply: true,
      isRealization: false,
      SCCode: "Fashion"
    }
  ];
  
  return mockStocks;
};

// Transform raw stocks data into category-based summary
export const processStocksByCategory = (stocks: WildberriesStock[]): StocksByCategory[] => {
  const categoriesMap: Record<string, StocksByCategory> = {};
  
  stocks.forEach(stock => {
    if (!categoriesMap[stock.category]) {
      categoriesMap[stock.category] = {
        category: stock.category,
        totalItems: 0,
        valueRub: 0,
        topSellingItem: '',
        averageTurnover: '7 дней',
        returns: 0,
        inTransit: 0
      };
    }
    
    const category = categoriesMap[stock.category];
    category.totalItems += stock.quantity;
    category.valueRub += stock.quantity * (stock.Price * (1 - stock.Discount / 100));
    category.inTransit += stock.inWayToClient;
    
    // Just for demo purposes, set the top selling item to be the most expensive one
    if (!category.topSellingItem || stock.Price > 0) {
      category.topSellingItem = stock.subject;
    }
    
    // Random returns for demo
    category.returns = Math.floor(category.totalItems * 0.03);
  });
  
  return Object.values(categoriesMap);
};

// Transform raw stocks data into warehouse-based summary
export const processStocksByWarehouse = (stocks: WildberriesStock[]): StocksByWarehouse[] => {
  const warehousesMap: Record<string, StocksByWarehouse> = {};
  
  stocks.forEach(stock => {
    if (!warehousesMap[stock.warehouseName]) {
      warehousesMap[stock.warehouseName] = {
        warehouseName: stock.warehouseName,
        totalItems: 0,
        categories: {}
      };
    }
    
    const warehouse = warehousesMap[stock.warehouseName];
    warehouse.totalItems += stock.quantity;
    
    if (!warehouse.categories[stock.category]) {
      warehouse.categories[stock.category] = 0;
    }
    
    warehouse.categories[stock.category] += stock.quantity;
  });
  
  return Object.values(warehousesMap);
};

// Функция для создания задания на отчет о платном хранении
export const createPaidStorageReport = async (
  apiKey: string,
  dateFrom: string,
  dateTo: string
): Promise<string> => {
  try {
    console.log(`Создание отчета о платном хранении с ${dateFrom} по ${dateTo}`);
    
    // В реальном приложении:
    // const response = await axios.get(
    //   "https://seller-analytics-api.wildberries.ru/api/v1/paid_storage",
    //   {
    //     headers: { Authorization: apiKey },
    //     params: { dateFrom, dateTo }
    //   }
    // );
    // return response.data.data.taskId;
    
    // Для демонстрации возвращаем фиктивный taskId
    return "mock-task-id-" + Date.now();
  } catch (error) {
    console.error('Ошибка при создании отчета о платном хранении:', error);
    throw error;
  }
};

// Функция для проверки статуса задания
export const getPaidStorageReportStatus = async (
  apiKey: string,
  taskId: string
): Promise<string> => {
  try {
    console.log(`Проверка статуса отчета: ${taskId}`);
    
    // В реальном приложении:
    // const response = await axios.get(
    //   `https://seller-analytics-api.wildberries.ru/api/v1/paid_storage/tasks/${taskId}/status`,
    //   {
    //     headers: { Authorization: apiKey }
    //   }
    // );
    // return response.data.data.status;
    
    // Для демонстрации сразу возвращаем статус "done"
    return "done";
  } catch (error) {
    console.error('Ошибка при проверке статуса отчета:', error);
    throw error;
  }
};

// Функция для получения отчета о платном хранении
export const downloadPaidStorageReport = async (
  apiKey: string,
  taskId: string
): Promise<PaidStorageItem[]> => {
  try {
    console.log(`Загрузка отчета: ${taskId}`);
    
    // В реальном приложении:
    // const response = await axios.get(
    //   `https://seller-analytics-api.wildberries.ru/api/v1/paid_storage/tasks/${taskId}/download`,
    //   {
    //     headers: { Authorization: apiKey }
    //   }
    // );
    // return response.data;
    
    // Моковые данные отчета
    const mockData: PaidStorageItem[] = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      logWarehouseCoef: Math.random() * 0.5 + 1, // 1.0 - 1.5
      officeId: [507, 686, 1193, 1699][Math.floor(Math.random() * 4)],
      warehouse: ["Коледино", "Подольск", "Электросталь", "Казань"][Math.floor(Math.random() * 4)],
      warehouseCoef: Math.random() * 1 + 1.2, // 1.2 - 2.2
      giId: 123456 + i,
      chrtId: 1234567 + i,
      size: ["42", "44", "46", "48", "0"][Math.floor(Math.random() * 5)],
      barcode: `2000${Math.floor(Math.random() * 1000000000)}`,
      subject: ["Футболки", "Джинсы", "Куртки", "Платья", "Обувь"][Math.floor(Math.random() * 5)],
      brand: ["BrandX", "FashionY", "SportZ", "CasualA", "TrendB"][Math.floor(Math.random() * 5)],
      vendorCode: `ART-${1000 + i}`,
      nmId: 1000000 + i,
      volume: Math.random() * 30 + 5, // 5 - 35
      calcType: ["короба: без габаритов", "короба: с габаритами", "монопаллеты"][Math.floor(Math.random() * 3)],
      warehousePrice: Math.random() * 20 + 5, // 5 - 25 рублей
      barcodesCount: Math.floor(Math.random() * 10) + 1, // 1-10 единиц
      palletPlaceCode: Math.floor(Math.random() * 10),
      palletCount: Math.random() * 0.5,
      originalDate: new Date(Date.now() - (i + 10) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      loyaltyDiscount: Math.random() * 15, // 0-15 рублей скидки
      tariffFixDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tariffLowerDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));
    
    return mockData;
  } catch (error) {
    console.error('Ошибка при загрузке отчета о платном хранении:', error);
    throw error;
  }
};

// Функция для получения полного отчета (workflow)
export const fetchFullPaidStorageReport = async (
  apiKey: string,
  dateFrom: string = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  dateTo: string = new Date().toISOString().split('T')[0]
): Promise<PaidStorageItem[]> => {
  try {
    // 1. Создать отчет
    const taskId = await createPaidStorageReport(apiKey, dateFrom, dateTo);
    
    // 2. Проверять статус отчета, пока он не будет готов
    let status = "";
    let attempts = 0;
    const maxAttempts = 10;
    
    while (status !== "done" && attempts < maxAttempts) {
      attempts++;
      status = await getPaidStorageReportStatus(apiKey, taskId);
      
      if (status === "done") {
        break;
      } else if (status === "processing" || status === "new") {
        // В реальном приложении здесь стоит добавить паузу
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        throw new Error(`Неожиданный статус отчета: ${status}`);
      }
    }
    
    if (status !== "done") {
      throw new Error(`Отчет не был готов после ${maxAttempts} попыток`);
    }
    
    // 3. Загрузить отчет
    const reportData = await downloadPaidStorageReport(apiKey, taskId);
    return reportData;
  } catch (error) {
    console.error('Ошибка при получении отчета о платном хранении:', error);
    throw error;
  }
};
