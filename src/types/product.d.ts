
interface Product {
  nmID: number;
  vendorCode: string;
  brand: string;
  title: string;
  photos: Array<{
    big: string;
    c246x328: string;
  }>;
  costPrice?: number;
  price?: number;
  discountedPrice?: number;
  clubPrice?: number;
  quantity?: number;
  subject?: string;
  subject_name?: string;
  expenses?: {
    logistics: number;
    storage: number;
    penalties: number;
    acceptance: number;
    deductions?: number;
    ppvz_for_pay?: number;
  };
  
  // Данные о платном хранении
  storageData?: {
    averageDailyCost: number; // Среднее хранение в день
    totalStorageCost: number; // Общая стоимость хранения за период
    periodDays: number;       // Количество дней в периоде
  };

  // Данные о продажах
  salesData?: {
    averageDailySales: number; // Среднее количество продаж в день
    totalSales: number;        // Общее количество продаж за период
    periodDays: number;        // Количество дней в периоде
    revenue: number;           // Общая выручка за период
  };
}
