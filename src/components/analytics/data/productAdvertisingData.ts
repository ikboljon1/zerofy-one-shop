
// Product advertising data - showing which products have advertising expenses
export const productAdvertisingData = [
  {
    name: "Футболка 'Спортивная'",
    value: 12500,
    color: "#8b5cf6",
    id: 1234567
  },
  {
    name: "Джинсы классические",
    value: 8700,
    color: "#ec4899",
    id: 2345678
  },
  {
    name: "Кроссовки беговые",
    value: 7300,
    color: "#f59e0b",
    id: 3456789
  },
  {
    name: "Куртка зимняя",
    value: 5200,
    color: "#3b82f6",
    id: 4567890
  },
  {
    name: "Другие товары",
    value: 3100,
    color: "#10b981",
    id: 5678901
  }
];

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
