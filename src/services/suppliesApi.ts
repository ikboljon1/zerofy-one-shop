
import axios from 'axios';
import { 
  WarehouseCoefficient as ApiWarehouseCoefficient,
  SupplyOptionsResponse as ApiSupplyOptionsResponse,
  SupplyItem as ApiSupplyItem,
  Warehouse as ApiWarehouse,
  WildberriesStock as ApiWildberriesStock,
  StocksByCategory as ApiStocksByCategory,
  StocksByWarehouse as ApiStocksByWarehouse,
  SupplyFormData as ApiSupplyFormData,
  SupplyItemResponse as ApiSupplyItemResponse
} from '@/types/supplies';

// Define component interfaces to match the actual component usage
export interface WarehouseCoefficient {
  warehouse_id: string;
  warehouse_name: string;
  coefficients: {
    [key: string]: number;
  };
}

export interface Warehouse {
  ID: string;
  name: string;
  address: string;
  workTime: string;
  acceptsQR: boolean;
}

export interface WarehouseData {
  id?: string;
  ID?: string;
  name: string;
  address?: string;
  coordinates?: string;
  workTime?: string;
  acceptsQR?: boolean;
}

export interface SupplyItem {
  article: string;
  quantity: number;
}

export interface WildberriesStock {
  id: string;
  name: string;
  article: string;
  barcode: string;
  category: string;
  warehouse: string;
  quantity: number;
  dateUpdate: string;
}

export interface StocksByCategory {
  name: string;
  count: number;
}

export interface StocksByWarehouse {
  name: string;
  count: number;
}

export interface SupplyOptionsResponse {
  result: Array<{
    article: string;
    isError: boolean;
    errorText?: string;
    sizes?: any[];
  }>;
  warehouse: {
    id: string;
    name: string;
  };
}

export interface SupplyFormData {
  selectedWarehouse: string;
  items: SupplyItem[];
}

// Базовый URL для API поставок
const SUPPLIES_API_BASE_URL = 'https://supplies-api.wildberries.ru/api/v1';

// Helper functions to convert between API types and component types
const convertToComponentWarehouseCoefficient = (data: ApiWarehouseCoefficient[]): WarehouseCoefficient[] => {
  return data.map(coef => ({
    warehouse_id: String(coef.warehouseID),
    warehouse_name: coef.warehouseName,
    coefficients: {
      [coef.boxTypeName]: coef.coefficient
    }
  }));
};

const convertToComponentWildberriesStock = (data: ApiWildberriesStock[]): WildberriesStock[] => {
  return data.map(stock => ({
    id: String(stock.nmId),
    name: stock.subject,
    article: stock.supplierArticle,
    barcode: stock.barcode,
    category: stock.category,
    warehouse: stock.warehouseName,
    quantity: stock.quantity,
    dateUpdate: stock.lastChangeDate
  }));
};

const convertToComponentStocksByCategory = (data: ApiStocksByCategory[]): StocksByCategory[] => {
  return data.map(cat => ({
    name: cat.category,
    count: cat.totalItems
  }));
};

const convertToComponentStocksByWarehouse = (data: ApiStocksByWarehouse[]): StocksByWarehouse[] => {
  return data.map(wh => ({
    name: wh.warehouseName,
    count: wh.totalItems
  }));
};

const convertApiToComponentWarehouse = (data: ApiWarehouse[]): Warehouse[] => {
  return data.map(wh => ({
    ID: String(wh.ID), // Convert number to string for component compatibility
    name: wh.name,
    address: wh.address,
    workTime: wh.workTime,
    acceptsQR: wh.acceptsQR
  }));
};

const convertComponentToApiSupplyItem = (items: SupplyItem[]): ApiSupplyItem[] => {
  return items.map(item => ({
    barcode: item.article, // use article as barcode
    quantity: item.quantity
  }));
};

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

    console.log(`Запрос коэффициентов приемки для складов: ${warehouseIDs?.join(', ') || 'всех'}`);
    
    // Имитация запроса
    const mockCoefficients: ApiWarehouseCoefficient[] = [
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
    
    return convertToComponentWarehouseCoefficient(mockCoefficients);
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
    
    // Mock response with the needed structure
    const mockResponse: SupplyOptionsResponse = {
      result: items.map(item => ({
        article: item.article,
        isError: item.article.length < 5,
        errorText: item.article.length < 5 ? `barcode ${item.article} is not found` : undefined,
      })),
      warehouse: {
        id: warehouseID ? String(warehouseID) : "205349",
        name: "Коледино"
      }
    };
    
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
        ID: "210515",
        name: "Вёшки",
        address: "Липкинское шоссе, 2-й километр, вл1с1, посёлок Вёшки, городской округ Мытищи, Московская область",
        workTime: "24/7",
        acceptsQR: false
      },
      {
        ID: "205349",
        name: "Коледино",
        address: "ул. Коледино, стр. 1, д. Коледино, Подольский р-н, Московская область",
        workTime: "24/7",
        acceptsQR: true
      },
      {
        ID: "211622",
        name: "Подольск",
        address: "ул. Поклонная, д. 3А, г. Подольск, Московская область",
        workTime: "Пн-Пт: 9:00-18:00",
        acceptsQR: true
      },
      {
        ID: "217081",
        name: "СЦ Брянск 2",
        address: "ул. Промышленная, д. 3, г. Брянск",
        workTime: "24/7",
        acceptsQR: false
      }
    ];
    
    return mockWarehouses;
  } catch (error) {
    console.error('Ошибка при получении списка складов:', error);
    throw error;
  }
};

// Функция для получения списка товаров на складах
export const fetchStocks = async (apiKey: string, dateFrom: string = '2020-01-01'): Promise<WildberriesStock[]> => {
  // In real environment, this would make an API call to the Wildberries API
  // For demonstration purposes, we'll return mock data
  console.log(`Fetching stocks with API key: ${apiKey} from date: ${dateFrom}`);
  
  // Mock data based on the example response
  const mockStocks: ApiWildberriesStock[] = [
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
  
  return convertToComponentWildberriesStock(mockStocks);
};

// Transform raw stocks data into category-based summary
export const processStocksByCategory = (stocks: WildberriesStock[]): StocksByCategory[] => {
  const categoriesMap: Record<string, StocksByCategory> = {};
  
  stocks.forEach(stock => {
    if (!categoriesMap[stock.category]) {
      categoriesMap[stock.category] = {
        name: stock.category,
        count: 0
      };
    }
    
    categoriesMap[stock.category].count += stock.quantity;
  });
  
  return Object.values(categoriesMap);
};

// Transform raw stocks data into warehouse-based summary
export const processStocksByWarehouse = (stocks: WildberriesStock[]): StocksByWarehouse[] => {
  const warehousesMap: Record<string, StocksByWarehouse> = {};
  
  stocks.forEach(stock => {
    if (!warehousesMap[stock.warehouse]) {
      warehousesMap[stock.warehouse] = {
        name: stock.warehouse,
        count: 0
      };
    }
    
    warehousesMap[stock.warehouse].count += stock.quantity;
  });
  
  return Object.values(warehousesMap);
};
