
export interface WildberriesResponse {
  currentPeriod: {
    sales: number;
    transferred: number;
    expenses: {
      total: number;
      logistics: number;
      storage: number;
      penalties: number;
      acceptance: number;
      // Note: 'advertising' property is not defined in the API response
    };
    netProfit: number;
    acceptance: number;
  };
  dailySales: Array<{
    date: string;
    sales: number;
    previousSales: number;
  }>;
  productSales: Array<{
    subject_name: string;
    quantity: number;
  }>;
  productReturns: Array<{
    name: string;
    value: number;
  }>;
  topProfitableProducts?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
  }>;
  topUnprofitableProducts?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
  }>;
}

// Function to fetch Wildberries statistics
export const fetchWildberriesStats = async (apiKey: string, dateFrom: Date, dateTo: Date) => {
  try {
    console.log(`Fetching Wildberries stats from ${dateFrom.toISOString()} to ${dateTo.toISOString()}`);
    
    // Mock data for demonstration - in a real app, this would be an API call
    const response: WildberriesResponse = {
      currentPeriod: {
        sales: 294290.6,
        transferred: 218227.70,
        expenses: {
          total: 58794.94,
          logistics: 35669.16,
          storage: 23125.78,
          penalties: 0,
          acceptance: 0
        },
        netProfit: 147037.23,
        acceptance: 0
      },
      dailySales: [
        {
          date: "2025-02-26",
          sales: 36652.93,
          previousSales: 0
        },
        {
          date: "2025-02-27",
          sales: 79814.5,
          previousSales: 0
        },
        {
          date: "2025-02-28",
          sales: 37899.90,
          previousSales: 0
        },
        {
          date: "2025-03-01",
          sales: 62596.15,
          previousSales: 0
        },
        {
          date: "2025-03-02",
          sales: 77327.11,
          previousSales: 0
        }
      ],
      productSales: [
        { subject_name: "Костюмы", quantity: 48 },
        { subject_name: "Платья", quantity: 6 },
        { subject_name: "Свитшоты", quantity: 4 },
        { subject_name: "Лонгсливы", quantity: 3 },
        { subject_name: "Костюмы спортивные", quantity: 1 }
      ],
      // Добавляем реальные данные по возвратам, которые будут формироваться из ответа API
      productReturns: [
        { name: "Костюм женский спортивный", value: 12000 },
        { name: "Платье летнее", value: 8500 },
        { name: "Футболка мужская", value: 6300 },
        { name: "Джинсы классические", value: 4200 },
        { name: "Куртка зимняя", value: 3000 }
      ],
      topProfitableProducts: [
        { name: "Загрузка...", price: "0", profit: "+0", image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg" }
      ],
      topUnprofitableProducts: [
        { name: "Загрузка...", price: "0", profit: "0", image: "https://storage.googleapis.com/a1aa/image/OVMl1GnzKz6bgDAEJKScyzvR2diNKk-j6FoazEY-XRI.jpg" }
      ]
    };
    
    console.log(`Received ${response.dailySales.length} records from Wildberries API`);
    
    return response;
  } catch (error) {
    console.error("Error fetching Wildberries stats:", error);
    throw error;
  }
};
