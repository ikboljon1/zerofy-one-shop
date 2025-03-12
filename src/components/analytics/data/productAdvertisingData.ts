
// Product advertising data - showing which products have advertising expenses
// Note: This file is only used as a reference, actual data comes from the API or cache

// Campaign status mapping
export const campaignStatusMap = {
  "-1": "Удаляется",
  "4": "ready",
  "7": "completed",
  "8": "archived",
  "9": "active",
  "11": "paused"
};

// Campaign type mapping
export const campaignTypeMap = {
  "4": "Каталог",
  "5": "Карточка товара",
  "6": "Поиск",
  "7": "Рекомендации"
};

// Convert numeric status to string status for filtering
export const getStatusString = (numericStatus: number): 'active' | 'paused' | 'archived' | 'ready' | 'completed' => {
  const statusString = campaignStatusMap[numericStatus.toString()];
  switch(statusString) {
    case "active": return "active";
    case "paused": return "paused";
    case "archived": return "archived";
    case "ready": return "ready";
    case "completed": return "completed";
    default: return "archived"; // Default case for unsupported status codes
  }
};

// Convert numeric type to auction/automatic for filtering
export const getTypeString = (numericType: number): 'auction' | 'automatic' => {
  // For simplicity, we'll map all legacy campaign types (4, 5, 6, 7) to 'auction'
  // and any other types to 'automatic'
  return [4, 5, 6, 7].includes(numericType) ? 'auction' : 'automatic';
};

// API для получения и сохранения данных о рекламе в БД
export async function saveProductAdvertisingData(storeId: string, data: any) {
  try {
    // Получаем текущего пользователя
    const userData = localStorage.getItem('user');
    const userId = userData ? JSON.parse(userData).id : null;
    
    const advertisingData = {
      storeId,
      userId, // Добавляем ID пользователя
      productAdvertisingData: data
    };
    
    // Сохраняем в БД через API
    const response = await fetch('/api/product-advertising', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(advertisingData),
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving product advertising data:', error);
    throw error;
  }
}

export async function getProductAdvertisingData(storeId: string) {
  try {
    // Получаем текущего пользователя
    const userData = localStorage.getItem('user');
    const userId = userData ? JSON.parse(userData).id : null;
    
    // Если у нас есть userId, добавляем его в запрос
    const url = userId 
      ? `/api/product-advertising/${storeId}?userId=${userId}`
      : `/api/product-advertising/${storeId}`;
    
    // Получаем из БД через API
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch product advertising data');
    }
    
    const data = await response.json();
    return data.productAdvertisingData;
  } catch (error) {
    console.error('Error getting product advertising data:', error);
    // Если данных нет в БД, возвращаем null
    return null;
  }
}
