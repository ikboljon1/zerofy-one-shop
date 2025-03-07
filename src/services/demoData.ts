
// Demo data for Wildberries API
export const demoData = {
  currentPeriod: {
    sales: 1250000,
    transferred: 1125000,
    expenses: {
      total: 125000,
      logistics: 45000,
      storage: 35000,
      penalties: 15000,
      advertising: 30000,
      acceptance: 30000
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
  productReturns: [
    { name: "Костюм женский спортивный", value: 12000, count: 3 },
    { name: "Платье летнее", value: 8500, count: 2 },
    { name: "Футболка мужская", value: 6300, count: 4 },
    { name: "Джинсы классические", value: 4200, count: 1 },
    { name: "Куртка зимняя", value: 3000, count: 1 }
  ],
  topProfitableProducts: [
    { 
      name: "Платье летнее", 
      price: "1200", 
      profit: "25000", 
      image: "https://images.wbstatic.net/big/new/22270000/22271973-1.jpg",
      quantitySold: 78,
      margin: 45,
      returnCount: 2
    },
    { 
      name: "Кроссовки спортивные", 
      price: "3500", 
      profit: "18000", 
      image: "https://images.wbstatic.net/big/new/10050000/10052354-1.jpg",
      quantitySold: 42,
      margin: 38,
      returnCount: 1
    },
    { 
      name: "Джинсы классические", 
      price: "2800", 
      profit: "15500", 
      image: "https://images.wbstatic.net/big/new/13730000/13733711-1.jpg",
      quantitySold: 36,
      margin: 32,
      returnCount: 3
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
      returnCount: 18
    },
    { 
      name: "Рубашка офисная", 
      price: "1500", 
      profit: "-3800", 
      image: "https://images.wbstatic.net/big/new/9080000/9080277-1.jpg",
      quantitySold: 5,
      margin: 8,
      returnCount: 12
    },
    { 
      name: "Перчатки кожаные", 
      price: "1200", 
      profit: "-2900", 
      image: "https://images.wbstatic.net/big/new/10320000/10328291-1.jpg",
      quantitySold: 3,
      margin: 15,
      returnCount: 25
    }
  ],
  // Add properties for orders, sales, and distributions to match the interface
  orders: [],
  sales: [],
  warehouseDistribution: [],
  regionDistribution: []
};

export const demoReportData = [
  {
    retail_price_withdisc_rub: 1200,
    doc_type_name: "Продажа",
    rrd_id: 1,
    date_from: "2024-01-01T10:00:00",
    subject_name: "Платье летнее",
    retail_price: 1500,
    ppvz_for_pay: 950
  },
  {
    retail_price_withdisc_rub: 2800,
    doc_type_name: "Продажа",
    rrd_id: 2,
    date_from: "2024-01-02T15:00:00",
    subject_name: "Джинсы классические",
    retail_price: 3000,
    ppvz_for_pay: 2200
  },
  {
    retail_price_withdisc_rub: -1200,
    doc_type_name: "Возврат",
    rrd_id: 3,
    date_from: "2024-01-03T09:00:00",
    subject_name: "Платье летнее",
    retail_price: 1500,
    ppvz_for_pay: -950
  },
  {
    deduction: -500,
    bonus_type_name: "Логистика возврата",
    nm_id: 12345,
    rrd_id: 4
  },
  {
    deduction: -300,
    bonus_type_name: "Штраф за брак",
    nm_id: 67890,
    rrd_id: 5
  }
];

// Demo orders data
export const demoOrdersData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2024, 0, i + 1).toISOString(),
  lastChangeDate: new Date(2024, 0, i + 1).toISOString(),
  warehouseName: ["Московский", "Санкт-Петербургский", "Екатеринбургский", "Краснодарский", "Новосибирский"][Math.floor(Math.random() * 5)],
  warehouseType: "Универсальный",
  countryName: "Россия",
  oblastOkrugName: "Центральный",
  regionName: ["Москва", "Санкт-Петербург", "Екатеринбург", "Краснодар", "Новосибирск"][Math.floor(Math.random() * 5)],
  supplierArticle: `АРТ-${Math.floor(Math.random() * 10000)}`,
  nmId: Math.floor(Math.random() * 1000000),
  barcode: `2000${Math.floor(Math.random() * 1000000)}`,
  category: ["Женская одежда", "Мужская одежда", "Обувь", "Аксессуары", "Детская одежда"][Math.floor(Math.random() * 5)],
  subject: ["Платье", "Джинсы", "Футболка", "Кроссовки", "Куртка"][Math.floor(Math.random() * 5)],
  brand: ["ZARA", "H&M", "NIKE", "Adidas", "Puma"][Math.floor(Math.random() * 5)],
  techSize: ["XS", "S", "M", "L", "XL"][Math.floor(Math.random() * 5)],
  incomeID: Math.floor(Math.random() * 100000),
  isSupply: true,
  isRealization: true,
  totalPrice: Math.floor(Math.random() * 10000) + 1000,
  discountPercent: Math.floor(Math.random() * 30),
  spp: Math.floor(Math.random() * 15),
  finishedPrice: Math.floor(Math.random() * 8000) + 800,
  priceWithDisc: Math.floor(Math.random() * 9000) + 900,
  isCancel: false,
  isReturn: Math.random() > 0.9,
  cancelDate: "",
  orderType: "Клиентский",
  sticker: `WB${Math.floor(Math.random() * 1000000)}`,
  gNumber: `g${Math.floor(Math.random() * 1000000)}`,
  srid: `sr${Math.floor(Math.random() * 1000000)}`
}));

// Demo sales data
export const demoSalesData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2024, 0, i + 1).toISOString(),
  lastChangeDate: new Date(2024, 0, i + 1).toISOString(),
  warehouseName: ["Московский", "Санкт-Петербургский", "Екатеринбургский", "Краснодарский", "Новосибирский"][Math.floor(Math.random() * 5)],
  warehouseType: "Универсальный",
  countryName: "Россия",
  oblastOkrugName: "Центральный",
  regionName: ["Москва", "Санкт-Петербург", "Екатеринбург", "Краснодар", "Новосибирск"][Math.floor(Math.random() * 5)],
  supplierArticle: `АРТ-${Math.floor(Math.random() * 10000)}`,
  nmId: Math.floor(Math.random() * 1000000),
  barcode: `2000${Math.floor(Math.random() * 1000000)}`,
  category: ["Женская одежда", "Мужская одежда", "Обувь", "Аксессуары", "Детская одежда"][Math.floor(Math.random() * 5)],
  subject: ["Платье", "Джинсы", "Футболка", "Кроссовки", "Куртка"][Math.floor(Math.random() * 5)],
  brand: ["ZARA", "H&M", "NIKE", "Adidas", "Puma"][Math.floor(Math.random() * 5)],
  techSize: ["XS", "S", "M", "L", "XL"][Math.floor(Math.random() * 5)],
  incomeID: Math.floor(Math.random() * 100000),
  isSupply: true,
  isRealization: true,
  totalPrice: Math.floor(Math.random() * 10000) + 1000,
  discountPercent: Math.floor(Math.random() * 30),
  spp: Math.floor(Math.random() * 15),
  paymentSaleAmount: Math.floor(Math.random() * 7000) + 700,
  forPay: Math.floor(Math.random() * 7500) + 750,
  finishedPrice: Math.floor(Math.random() * 8000) + 800,
  priceWithDisc: Math.floor(Math.random() * 9000) + 900,
  isReturn: Math.random() > 0.9,
  saleID: `sale${Math.floor(Math.random() * 1000000)}`,
  orderType: "Клиентский",
  sticker: `WB${Math.floor(Math.random() * 1000000)}`,
  gNumber: `g${Math.floor(Math.random() * 1000000)}`,
  srid: `sr${Math.floor(Math.random() * 1000000)}`
}));
