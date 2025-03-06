
import axios from 'axios';
import { 
  WarehouseCoefficient,
  SupplyOptionsResponse,
  SupplyItem,
  Warehouse
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
