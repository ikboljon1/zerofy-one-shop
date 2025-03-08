
// Цвета для диаграмм
export const COLORS = [
  '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', 
  '#3B82F6', '#6366F1', '#EF4444', '#14B8A6'
];

// Данные для аналитики склада
export const warehouseAnalyticsData = {
  utilizationByWarehouse: [
    { name: "Подольск", value: 78 },
    { name: "Электросталь", value: 92 },
    { name: "Казань", value: 64 },
    { name: "Новосибирск", value: 85 },
    { name: "Хабаровск", value: 71 }
  ],
  processingTimeByWarehouse: [
    { name: "Подольск", time: 8 },
    { name: "Электросталь", time: 12 },
    { name: "Казань", time: 6 },
    { name: "Новосибирск", time: 10 },
    { name: "Хабаровск", time: 9 }
  ],
  warehouseCosts: [
    { warehouse: "Подольск", rent: 1200000, staff: 950000, utilities: 180000, maintenance: 150000 },
    { warehouse: "Электросталь", rent: 980000, staff: 850000, utilities: 120000, maintenance: 110000 },
    { warehouse: "Казань", rent: 870000, staff: 780000, utilities: 110000, maintenance: 95000 },
    { warehouse: "Новосибирск", rent: 920000, staff: 810000, utilities: 130000, maintenance: 100000 },
    { warehouse: "Хабаровск", rent: 850000, staff: 760000, utilities: 105000, maintenance: 90000 }
  ],
  monthlyShipments: [
    { month: "Янв", count: 14500 },
    { month: "Фев", count: 16200 },
    { month: "Мар", count: 18100 },
    { month: "Апр", count: 17300 },
    { month: "Май", count: 19500 },
    { month: "Июн", count: 21200 },
    { month: "Июл", count: 20100 },
    { month: "Авг", count: 22300 },
    { month: "Сен", count: 24100 },
    { month: "Окт", count: 22800 },
    { month: "Ноя", count: 25200 },
    { month: "Дек", count: 27500 }
  ],
  topPerformingWarehouses: [
    { name: "Электросталь", ordersPerDay: 4200, accuracy: 99.2, processingCost: 78 },
    { name: "Новосибирск", ordersPerDay: 3850, accuracy: 98.7, processingCost: 82 },
    { name: "Казань", ordersPerDay: 3650, accuracy: 98.5, processingCost: 76 }
  ]
};

// Данные для складов
export const warehousesData = [
  {
    id: 1,
    name: "Коледино",
    coordinates: [55.341514, 37.526033],
    size: "150,000 м²",
    items: 28500,
    status: "active",
    fillRate: 85,
    lastRestock: "2024-04-01",
    manager: "Иванов И.И.",
    totalValue: 156000000,
    mostStockedCategory: "Одежда",
    fastMovingItems: 8500,
    slowMovingItems: 1200,
    avgProcessingTime: "6 часов"
  },
  {
    id: 2,
    name: "Электросталь",
    coordinates: [55.785092, 38.444097],
    size: "120,000 м²",
    items: 22800,
    status: "active",
    fillRate: 92,
    lastRestock: "2024-04-02",
    manager: "Петров П.П.",
    totalValue: 132000000,
    mostStockedCategory: "Обувь",
    fastMovingItems: 7200,
    slowMovingItems: 980,
    avgProcessingTime: "5 часов"
  },
  {
    id: 3,
    name: "Казань",
    coordinates: [55.822388, 49.089444],
    size: "90,000 м²",
    items: 19500,
    status: "maintenance",
    fillRate: 64,
    lastRestock: "2024-03-28",
    manager: "Сидоров С.С.",
    totalValue: 98000000,
    mostStockedCategory: "Электроника",
    fastMovingItems: 5800,
    slowMovingItems: 750,
    avgProcessingTime: "7 часов"
  },
  {
    id: 4,
    name: "Новосибирск",
    coordinates: [55.028739, 82.927811],
    size: "110,000 м²",
    items: 24200,
    status: "active",
    fillRate: 88,
    lastRestock: "2024-04-03",
    manager: "Козлов К.К.",
    totalValue: 118000000,
    mostStockedCategory: "Бытовая техника",
    fastMovingItems: 6700,
    slowMovingItems: 820,
    avgProcessingTime: "6 часов"
  },
  {
    id: 5,
    name: "Хабаровск",
    coordinates: [48.480223, 135.071917],
    size: "85,000 м²",
    items: 18700,
    status: "low-stock",
    fillRate: 71,
    lastRestock: "2024-03-25",
    manager: "Соколов С.С.",
    totalValue: 86000000,
    mostStockedCategory: "Товары для дома",
    fastMovingItems: 5200,
    slowMovingItems: 680,
    avgProcessingTime: "8 часов"
  }
];

// Данные для маршрутов логистики
export const logisticsRoutes = [
  {
    origin: 1,
    destination: 2,
    volume: "22,000 кг",
    transport: "Грузовик",
    distance: "120 км",
    travelTime: "2 часа",
    cost: 35000,
    frequency: "Ежедневно",
    carrier: "ТК Логистик",
    status: "active"
  },
  {
    origin: 1,
    destination: 3,
    volume: "18,000 кг",
    transport: "Поезд",
    distance: "800 км",
    travelTime: "12 часов",
    cost: 75000,
    frequency: "3 раза в неделю",
    carrier: "РЖД Карго",
    status: "active"
  },
  {
    origin: 2,
    destination: 4,
    volume: "15,000 кг",
    transport: "Поезд",
    distance: "3,100 км",
    travelTime: "3 дня",
    cost: 180000,
    frequency: "2 раза в неделю",
    carrier: "РЖД Карго",
    status: "delayed"
  },
  {
    origin: 3,
    destination: 5,
    volume: "12,000 кг",
    transport: "Самолет",
    distance: "4,800 км",
    travelTime: "6 часов",
    cost: 320000,
    frequency: "1 раз в неделю",
    carrier: "АвиаКарго",
    status: "active"
  },
  {
    origin: 1,
    destination: 5,
    volume: "20,000 кг",
    transport: "Поезд+Грузовик",
    distance: "8,700 км",
    travelTime: "7 дней",
    cost: 450000,
    frequency: "1 раз в 2 недели",
    carrier: "Интер Логистика",
    status: "active"
  }
];

// Данные для категорий инвентаря
export const inventoryData = [
  {
    category: "Одежда",
    totalItems: 12500,
    valueRub: 62500000,
    topSellingItem: "Футболки",
    averageTurnover: "8 дней",
    returns: 320,
    inTransit: 1800
  },
  {
    category: "Обувь",
    totalItems: 8200,
    valueRub: 49200000,
    topSellingItem: "Кроссовки",
    averageTurnover: "12 дней",
    returns: 180,
    inTransit: 1200
  },
  {
    category: "Электроника",
    totalItems: 5600,
    valueRub: 84000000,
    topSellingItem: "Наушники",
    averageTurnover: "15 дней",
    returns: 210,
    inTransit: 920
  },
  {
    category: "Бытовая техника",
    totalItems: 4800,
    valueRub: 72000000,
    topSellingItem: "Кофемашины",
    averageTurnover: "18 дней",
    returns: 150,
    inTransit: 780
  },
  {
    category: "Товары для дома",
    totalItems: 9200,
    valueRub: 36800000,
    topSellingItem: "Постельное белье",
    averageTurnover: "10 дней",
    returns: 280,
    inTransit: 1500
  },
  {
    category: "Косметика",
    totalItems: 7800,
    valueRub: 31200000,
    topSellingItem: "Крем для лица",
    averageTurnover: "7 дней",
    returns: 190,
    inTransit: 1100
  },
  {
    category: "Детские товары",
    totalItems: 6500,
    valueRub: 26000000,
    topSellingItem: "Подгузники",
    averageTurnover: "5 дней",
    returns: 110,
    inTransit: 950
  }
];
