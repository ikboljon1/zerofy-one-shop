export interface ExpensesData {
  total: number;
  logistics: number;
  storage: number;
  penalties: number;
  advertising: number;
  acceptance: number;
  deductions?: number;
}

export interface PeriodData {
  orderCount: number;
  income: number;
  expenses: ExpensesData;
  profit: number;
  sales?: number;
  transferred?: number;
}

export interface SalesData {
  date: string;
  sales: number;
  previousSales: number;
}

export interface ProductData {
  id: number;
  name: string;
  price: string;
  profit: string;
  image: string;
  quantitySold?: number;
  margin?: number;
  returnCount?: number;
  category?: string;
}

export interface WildberriesResponse {
  currentPeriod: PeriodData;
  previousPeriod: PeriodData;
  sales: any[];
  products: any[];
  dailySales?: SalesData[];
  productSales?: any[];
  productReturns?: any[];
  topProfitableProducts?: ProductData[];
  topUnprofitableProducts?: ProductData[];
  penaltiesData?: any[];
  deductionsData?: any[];
}

// Функция для получения данных статистики с API Wildberries
export const fetchWildberriesStats = async (
  apiKey: string,
  dateFrom: Date,
  dateTo: Date
): Promise<WildberriesResponse> => {
  console.log(`Fetching Wildberries stats from ${dateFrom.toISOString()} to ${dateTo.toISOString()}`);
  
  try {
    // В реальном приложении здесь будет запрос к API
    // В демо-версии возвращаем моковые данные
    return getMockData();
  } catch (error) {
    console.error("Error fetching Wildberries stats:", error);
    throw error;
  }
};

// Функция для генерации моковых данных статистики
const getMockData = (): WildberriesResponse => {
  const totalExpenses = {
    total: 12500,
    logistics: 5000,
    storage: 2500,
    penalties: 1500,
    advertising: 2000,
    acceptance: 1500,
    deductions: 0
  };

  const salesData: SalesData[] = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 29 + i);
    return {
      date: date.toISOString().split('T')[0],
      sales: Math.floor(Math.random() * 10000) + 5000,
      previousSales: Math.floor(Math.random() * 8000) + 4000
    };
  });

  const profitableProducts: ProductData[] = [
    {
      id: 1,
      name: "Футболка с принтом",
      price: "1299",
      profit: "450",
      image: "https://picsum.photos/200/300",
      quantitySold: 145,
      margin: 35,
      category: "Одежда"
    },
    {
      id: 2,
      name: "Джинсы классические",
      price: "2499",
      profit: "780",
      image: "https://picsum.photos/200/301",
      quantitySold: 89,
      margin: 31,
      category: "Одежда"
    },
    {
      id: 3,
      name: "Кроссовки спортивные",
      price: "3799",
      profit: "1100",
      image: "https://picsum.photos/200/302",
      quantitySold: 67,
      margin: 29,
      category: "Обувь"
    }
  ];

  const unprofitableProducts: ProductData[] = [
    {
      id: 4,
      name: "Носки хлопковые",
      price: "199",
      profit: "-30",
      image: "https://picsum.photos/200/303",
      quantitySold: 230,
      margin: -15,
      category: "Одежда"
    },
    {
      id: 5,
      name: "Перчатки зимние",
      price: "799",
      profit: "-120",
      image: "https://picsum.photos/200/304",
      quantitySold: 45,
      margin: -15,
      category: "Аксессуары"
    },
    {
      id: 6,
      name: "Шапка вязаная",
      price: "899",
      profit: "-75",
      image: "https://picsum.photos/200/305",
      quantitySold: 38,
      margin: -8,
      category: "Аксессуары"
    }
  ];

  // Мок данных по штрафам
  const penaltiesData = Array.from({ length: 10 }, (_, i) => ({
    date: new Date(2023, 10, i + 1).toISOString().split('T')[0],
    amount: Math.floor(Math.random() * 500) + 100,
    reason: `Нарушение #${i+1}`
  }));

  // Мок данных по удержаниям
  const deductionsData = Array.from({ length: 10 }, (_, i) => ({
    date: new Date(2023, 10, i + 1).toISOString().split('T')[0],
    amount: Math.floor(Math.random() * 1000) + 200,
    type: i % 2 === 0 ? "Комиссия" : "Возврат"
  }));

  return {
    currentPeriod: {
      orderCount: 1250,
      income: 75000,
      expenses: totalExpenses,
      profit: 62500,
      sales: 150000,
      transferred: 75000
    },
    previousPeriod: {
      orderCount: 1000,
      income: 60000,
      expenses: {
        total: 10000,
        logistics: 4000,
        storage: 2000,
        penalties: 1000,
        advertising: 1500,
        acceptance: 1500,
        deductions: 0
      },
      profit: 50000,
      sales: 120000,
      transferred: 60000
    },
    sales: [],
    products: [],
    dailySales: salesData,
    productSales: [],
    productReturns: [],
    topProfitableProducts: profitableProducts,
    topUnprofitableProducts: unprofitableProducts,
    penaltiesData,
    deductionsData
  };
};

export const fetchProductsWithStats = async (apiKey: string): Promise<any[]> => {
  // В реальном приложении здесь будет запрос к API
  // В демо-версии возвращаем моковые данные
  try {
    return [
      {
        id: 1,
        name: "Футболка с принтом",
        price: 1299,
        stock: 156,
        sold: 145,
        returns: 3,
        profit: 450
      },
      {
        id: 2,
        name: "Джинсы классические",
        price: 2499,
        stock: 78,
        sold: 89,
        returns: 5,
        profit: 780
      },
      {
        id: 3,
        name: "Кроссовки спортивные",
        price: 3799,
        stock: 34,
        sold: 67,
        returns: 2,
        profit: 1100
      }
    ];
  } catch (error) {
    console.error("Error fetching products with stats:", error);
    throw error;
  }
};
