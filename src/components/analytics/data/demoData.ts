
// Demo data for analytics dashboard
export const penaltiesData = [
  { name: "Брак товара", value: 5000 },
  { name: "Недопоставка", value: 3500 },
  { name: "Нарушение упаковки", value: 2800 },
  { name: "Нарушение маркировки", value: 1200 },
  { name: "Другие причины", value: 2500 }
];

export const returnsData = [
  { name: "Костюм женский спортивный", value: 12000, count: 3 },
  { name: "Платье летнее", value: 8500, count: 2 },
  { name: "Футболка мужская", value: 6300, count: 4 },
  { name: "Джинсы классические", value: 4200, count: 1 },
  { name: "Куртка зимняя", value: 3000, count: 1 }
];

export const deductionsTimelineData = [
  { date: "01.05.2024", logistic: 1200, storage: 800, penalties: 500, acceptance: 300, advertising: 700 },
  { date: "02.05.2024", logistic: 1100, storage: 900, penalties: 300, acceptance: 350, advertising: 650 },
  { date: "03.05.2024", logistic: 1500, storage: 750, penalties: 800, acceptance: 400, advertising: 800 },
  { date: "04.05.2024", logistic: 1300, storage: 850, penalties: 200, acceptance: 320, advertising: 720 },
  { date: "05.05.2024", logistic: 1400, storage: 950, penalties: 600, acceptance: 370, advertising: 680 },
  { date: "06.05.2024", logistic: 1250, storage: 700, penalties: 400, acceptance: 310, advertising: 750 },
  { date: "07.05.2024", logistic: 1600, storage: 800, penalties: 350, acceptance: 330, advertising: 790 }
];

export const advertisingData = [
  { name: "Реклама в поиске", value: 12500 },
  { name: "Реклама в карточках", value: 7300 },
  { name: "Автоматическая реклама", value: 5200 },
  { name: "Другие форматы", value: 4100 }
];

export const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#6366F1'];

export const demoData = {
  currentPeriod: {
    sales: 1250000,
    transferred: 1125000, // К перечислению продавцу
    expenses: {
      total: 125000,
      logistics: 45000,
      storage: 35000,
      penalties: 15000,
      advertising: 30000,
      acceptance: 30000  // Добавлено поле acceptance
    },
    netProfit: 875000,
    acceptance: 30000
  },
  dailySales: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(2024, 0, i + 1).toISOString(),
    sales: Math.floor(Math.random() * 50000) + 20000,
    previousSales: Math.floor(Math.random() * 40000) + 15000
  })),
  productSales: [
    { subject_name: "Футболки", quantity: 150 },
    { subject_name: "Джинсы", quantity: 120 },
    { subject_name: "Куртки", quantity: 80 },
    { subject_name: "Обувь", quantity: 200 },
    { subject_name: "Аксессуары", quantity: 95 }
  ],
  productReturns: returnsData,
  topProfitableProducts: [
    { 
      name: "Платье летнее", 
      price: "1200", 
      profit: "25000", 
      image: "https://images.wbstatic.net/big/new/22270000/22271973-1.jpg",
      quantitySold: 78,
      margin: 45,
      returnCount: 2,
      category: "Женская одежда"
    },
    { 
      name: "Кроссовки спортивные", 
      price: "3500", 
      profit: "18000", 
      image: "https://images.wbstatic.net/big/new/10050000/10052354-1.jpg",
      quantitySold: 42,
      margin: 38,
      returnCount: 1,
      category: "Обувь"
    },
    { 
      name: "Джинсы классические", 
      price: "2800", 
      profit: "15500", 
      image: "https://images.wbstatic.net/big/new/13730000/13733711-1.jpg",
      quantitySold: 36,
      margin: 32,
      returnCount: 3,
      category: "Мужская одежда"
    }
  ],
  topUnprofitableProducts: [
    { 
      name: "Шарф зимний", 
      price: "800", 
      profit: "-5200", 
      image: "https://images.wbstatic.net/big/new/11080000/11081822-1.jpg",
      quantitySold: 8,
      margin: 12,
      returnCount: 18,
      category: "Аксессуары"
    },
    { 
      name: "Рубашка офисная", 
      price: "1500", 
      profit: "-3800", 
      image: "https://images.wbstatic.net/big/new/9080000/9080277-1.jpg",
      quantitySold: 5,
      margin: 8,
      returnCount: 12,
      category: "Мужская одежда"
    },
    { 
      name: "Перчатки кожаные", 
      price: "1200", 
      profit: "-2900", 
      image: "https://images.wbstatic.net/big/new/10320000/10328291-1.jpg",
      quantitySold: 3,
      margin: 15,
      returnCount: 25,
      category: "Аксессуары"
    }
  ]
};

// Данные о складах и логистике
export const warehousesData = [
  { 
    id: 1, 
    name: "Московский склад", 
    coordinates: [55.7522, 37.6156], 
    size: "12,000 м²", 
    items: 14500, 
    status: "active",
    fillRate: 85,
    lastRestock: "10.05.2024",
    manager: "Иванов А.С.",
    totalValue: 28500000,
    mostStockedCategory: "Женская одежда",
    fastMovingItems: 3200,
    slowMovingItems: 850,
    avgProcessingTime: "5 часов"
  },
  { 
    id: 2, 
    name: "Санкт-Петербургский склад", 
    coordinates: [59.9343, 30.3351], 
    size: "8,000 м²", 
    items: 9800, 
    status: "active",
    fillRate: 72,
    lastRestock: "11.05.2024",
    manager: "Петров В.И.",
    totalValue: 18700000,
    mostStockedCategory: "Обувь",
    fastMovingItems: 2100,
    slowMovingItems: 650,
    avgProcessingTime: "4.5 часа"
  },
  { 
    id: 3, 
    name: "Новосибирский склад", 
    coordinates: [55.0415, 82.9346], 
    size: "5,500 м²", 
    items: 6200, 
    status: "active",
    fillRate: 68,
    lastRestock: "09.05.2024",
    manager: "Сидорова Е.В.",
    totalValue: 12400000,
    mostStockedCategory: "Мужская одежда",
    fastMovingItems: 1500,
    slowMovingItems: 420,
    avgProcessingTime: "6 часов"
  },
  { 
    id: 4, 
    name: "Екатеринбургский склад", 
    coordinates: [56.8519, 60.6122], 
    size: "4,500 м²", 
    items: 5100, 
    status: "active",
    fillRate: 65,
    lastRestock: "08.05.2024",
    manager: "Козлов Д.Н.",
    totalValue: 9800000,
    mostStockedCategory: "Аксессуары",
    fastMovingItems: 1200,
    slowMovingItems: 380,
    avgProcessingTime: "5.5 часов"
  },
  { 
    id: 5, 
    name: "Казанский склад", 
    coordinates: [55.7887, 49.1221], 
    size: "3,800 м²", 
    items: 4300, 
    status: "maintenance",
    fillRate: 45,
    lastRestock: "05.05.2024",
    manager: "Смирнова О.П.",
    totalValue: 7600000,
    mostStockedCategory: "Детская одежда",
    fastMovingItems: 980,
    slowMovingItems: 320,
    avgProcessingTime: "7 часов"
  },
  { 
    id: 6, 
    name: "Ростовский склад", 
    coordinates: [47.2357, 39.7015], 
    size: "3,500 м²", 
    items: 3900, 
    status: "low-stock",
    fillRate: 38,
    lastRestock: "02.05.2024",
    manager: "Кузнецов А.И.",
    totalValue: 5900000,
    mostStockedCategory: "Спортивная одежда",
    fastMovingItems: 860,
    slowMovingItems: 290,
    avgProcessingTime: "6.5 часов"
  },
  { 
    id: 7, 
    name: "Краснодарский склад", 
    coordinates: [45.0448, 38.9760], 
    size: "4,200 м²", 
    items: 4800, 
    status: "active",
    fillRate: 78,
    lastRestock: "12.05.2024",
    manager: "Морозова А.Е.",
    totalValue: 9200000,
    mostStockedCategory: "Пляжная одежда",
    fastMovingItems: 1380,
    slowMovingItems: 310,
    avgProcessingTime: "4 часа"
  },
  { 
    id: 8, 
    name: "Владивостокский склад", 
    coordinates: [43.1332, 131.9113], 
    size: "3,000 м²", 
    items: 3100, 
    status: "active",
    fillRate: 62,
    lastRestock: "07.05.2024",
    manager: "Лебедев И.К.",
    totalValue: 5400000,
    mostStockedCategory: "Верхняя одежда",
    fastMovingItems: 720,
    slowMovingItems: 260,
    avgProcessingTime: "8 часов"
  }
];

// Маршруты между складами
export const logisticsRoutes = [
  { 
    origin: 1, 
    destination: 2, 
    volume: "320 единиц/день", 
    transport: "грузовик",
    distance: "705 км",
    travelTime: "9 часов", 
    cost: 42000,
    frequency: "ежедневно",
    carrier: "ТрансЛогистик",
    status: "active"
  },
  { 
    origin: 1, 
    destination: 3, 
    volume: "220 единиц/день", 
    transport: "авиаперевозка",
    distance: "3191 км",
    travelTime: "4 часа", 
    cost: 185000,
    frequency: "3 раза в неделю",
    carrier: "АэроКарго",
    status: "active"
  },
  { 
    origin: 1, 
    destination: 4, 
    volume: "180 единиц/день", 
    transport: "грузовик",
    distance: "1795 км",
    travelTime: "22 часа", 
    cost: 95000,
    frequency: "ежедневно",
    carrier: "УралТранс",
    status: "active"
  },
  { 
    origin: 1, 
    destination: 5, 
    volume: "150 единиц/день", 
    transport: "грузовик",
    distance: "815 км",
    travelTime: "11 часов", 
    cost: 48000,
    frequency: "ежедневно",
    carrier: "ВолгаЛогистик",
    status: "active"
  },
  { 
    origin: 1, 
    destination: 6, 
    volume: "140 единиц/день", 
    transport: "грузовик",
    distance: "1074 км",
    travelTime: "14 часов", 
    cost: 62000,
    frequency: "ежедневно",
    carrier: "ЮгТранс",
    status: "delayed"
  },
  { 
    origin: 2, 
    destination: 3, 
    volume: "90 единиц/день", 
    transport: "грузовик",
    distance: "3694 км",
    travelTime: "46 часов", 
    cost: 185000,
    frequency: "2 раза в неделю",
    carrier: "СибЭкспресс",
    status: "active"
  },
  { 
    origin: 4, 
    destination: 3, 
    volume: "70 единиц/день", 
    transport: "грузовик",
    distance: "1512 км",
    travelTime: "19 часов", 
    cost: 78000,
    frequency: "3 раза в неделю",
    carrier: "УралСибирь",
    status: "active"
  },
  { 
    origin: 5, 
    destination: 6, 
    volume: "50 единиц/день", 
    transport: "грузовик",
    distance: "1223 км",
    travelTime: "16 часов", 
    cost: 68000,
    frequency: "2 раза в неделю",
    carrier: "ВолгаДон",
    status: "active"
  },
  { 
    origin: 1, 
    destination: 7, 
    volume: "130 единиц/день", 
    transport: "грузовик",
    distance: "1359 км",
    travelTime: "17 часов", 
    cost: 72000,
    frequency: "ежедневно",
    carrier: "ЮгТранс",
    status: "active"
  },
  { 
    origin: 1, 
    destination: 8, 
    volume: "100 единиц/день", 
    transport: "авиаперевозка",
    distance: "6430 км",
    travelTime: "8 часов", 
    cost: 320000,
    frequency: "2 раза в неделю",
    carrier: "ВостокЭйр",
    status: "active"
  },
  { 
    origin: 7, 
    destination: 6, 
    volume: "80 единиц/день", 
    transport: "грузовик",
    distance: "355 км",
    travelTime: "5 часов", 
    cost: 28000,
    frequency: "ежедневно",
    carrier: "ЮгТранс",
    status: "active"
  }
];

// Данные об инвентаре (по категориям)
export const inventoryData = [
  { 
    category: "Женская одежда", 
    totalItems: 12500, 
    valueRub: 28500000, 
    topSellingItem: "Платье летнее",
    averageTurnover: "5 дней",
    returns: 320,
    inTransit: 580
  },
  { 
    category: "Мужская одежда", 
    totalItems: 9800, 
    valueRub: 22400000, 
    topSellingItem: "Джинсы классические",
    averageTurnover: "7 дней",
    returns: 245,
    inTransit: 420
  },
  { 
    category: "Детская одежда", 
    totalItems: 7200, 
    valueRub: 14500000, 
    topSellingItem: "Комбинезон детский",
    averageTurnover: "6 дней",
    returns: 180,
    inTransit: 350
  },
  { 
    category: "Обувь", 
    totalItems: 6400, 
    valueRub: 19800000, 
    topSellingItem: "Кроссовки спортивные",
    averageTurnover: "10 дней",
    returns: 210,
    inTransit: 290
  },
  { 
    category: "Аксессуары", 
    totalItems: 8900, 
    valueRub: 9700000, 
    topSellingItem: "Сумка женская",
    averageTurnover: "12 дней",
    returns: 150,
    inTransit: 320
  },
  { 
    category: "Спортивная одежда", 
    totalItems: 5300, 
    valueRub: 15200000, 
    topSellingItem: "Костюм спортивный",
    averageTurnover: "8 дней",
    returns: 130,
    inTransit: 240
  },
  { 
    category: "Верхняя одежда", 
    totalItems: 4200, 
    valueRub: 18900000, 
    topSellingItem: "Куртка зимняя",
    averageTurnover: "15 дней",
    returns: 95,
    inTransit: 180
  }
];

// Данные для аналитики складов
export const warehouseAnalyticsData = {
  utilizationByWarehouse: [
    { name: "Московский", value: 85 },
    { name: "Санкт-Петербургский", value: 72 },
    { name: "Новосибирский", value: 68 },
    { name: "Екатеринбургский", value: 65 },
    { name: "Казанский", value: 45 },
    { name: "Ростовский", value: 38 },
    { name: "Краснодарский", value: 78 },
    { name: "Владивостокский", value: 62 }
  ],
  processingTimeByWarehouse: [
    { name: "Московский", time: 5 },
    { name: "Санкт-Петербургский", time: 4.5 },
    { name: "Новосибирский", time: 6 },
    { name: "Екатеринбургский", time: 5.5 },
    { name: "Казанский", time: 7 },
    { name: "Ростовский", time: 6.5 },
    { name: "Краснодарский", time: 4 },
    { name: "Владивостокский", time: 8 }
  ],
  monthlyShipments: [
    { month: "Январь", count: 12500 },
    { month: "Февраль", count: 13200 },
    { month: "Март", count: 14800 },
    { month: "Апрель", count: 16300 },
    { month: "Май", count: 15700 }
  ],
  warehouseCosts: [
    { warehouse: "Московский", rent: 1200000, staff: 850000, utilities: 350000, maintenance: 180000 },
    { warehouse: "Санкт-Петербургский", rent: 980000, staff: 720000, utilities: 280000, maintenance: 150000 },
    { warehouse: "Новосибирский", rent: 650000, staff: 580000, utilities: 210000, maintenance: 120000 },
    { warehouse: "Екатеринбургский", rent: 580000, staff: 520000, utilities: 190000, maintenance: 110000 },
    { warehouse: "Казанский", rent: 520000, staff: 480000, utilities: 170000, maintenance: 100000 },
    { warehouse: "Ростовский", rent: 480000, staff: 450000, utilities: 150000, maintenance: 90000 },
    { warehouse: "Краснодарский", rent: 550000, staff: 490000, utilities: 180000, maintenance: 105000 },
    { warehouse: "Владивостокский", rent: 420000, staff: 390000, utilities: 140000, maintenance: 85000 }
  ],
  topPerformingWarehouses: [
    { name: "Краснодарский", ordersPerDay: 520, accuracy: 98.2, processingCost: 95 },
    { name: "Санкт-Петербургский", ordersPerDay: 780, accuracy: 97.8, processingCost: 102 },
    { name: "Московский", ordersPerDay: 1250, accuracy: 97.5, processingCost: 108 }
  ]
};
