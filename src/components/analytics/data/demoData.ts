
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
  { date: "01.05.2024", logistic: 1200, storage: 800, penalties: 500 },
  { date: "02.05.2024", logistic: 1100, storage: 900, penalties: 300 },
  { date: "03.05.2024", logistic: 1500, storage: 750, penalties: 800 },
  { date: "04.05.2024", logistic: 1300, storage: 850, penalties: 200 },
  { date: "05.05.2024", logistic: 1400, storage: 950, penalties: 600 },
  { date: "06.05.2024", logistic: 1250, storage: 700, penalties: 400 },
  { date: "07.05.2024", logistic: 1600, storage: 800, penalties: 350 }
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
      image: "https://styles.redditmedia.com/t5_2wquw3/styles/communityIcon_hm9h2653hk541.png",
      quantitySold: 78,
      margin: 45,
      returnRate: 1.2,
      category: "Женская одежда"
    },
    { 
      name: "Кроссовки спортивные", 
      price: "3500", 
      profit: "18000", 
      image: "https://styles.redditmedia.com/t5_2vhfr/styles/communityIcon_br4e2k2k2rd71.png",
      quantitySold: 42,
      margin: 38,
      returnRate: 2.5,
      category: "Обувь"
    },
    { 
      name: "Джинсы классические", 
      price: "2800", 
      profit: "15500", 
      image: "https://www.wildberries.ru/images/catalog-v3-10.jpg?v=202311270958",
      quantitySold: 36,
      margin: 32,
      returnRate: 3.1,
      category: "Мужская одежда"
    }
  ],
  topUnprofitableProducts: [
    { 
      name: "Шарф зимний", 
      price: "800", 
      profit: "-5200", 
      image: "https://www.wildberries.ru/images/catalog-v3-3.jpg?v=202311270958",
      quantitySold: 8,
      margin: 12,
      returnRate: 18.5,
      category: "Аксессуары"
    },
    { 
      name: "Рубашка офисная", 
      price: "1500", 
      profit: "-3800", 
      image: "https://www.wildberries.ru/images/catalog-v3-5.jpg?v=202311270958",
      quantitySold: 5,
      margin: 8,
      returnRate: 12.0,
      category: "Мужская одежда"
    },
    { 
      name: "Перчатки кожаные", 
      price: "1200", 
      profit: "-2900", 
      image: "https://www.wildberries.ru/images/catalog-v3.jpg?v=202311270958",
      quantitySold: 3,
      margin: 15,
      returnRate: 25.0,
      category: "Аксессуары"
    }
  ]
};
