
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
