
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
  // Новые поля для анализа рентабельности хранения
  averageDailySales?: number;
  warehousePrice?: number;
  salesData?: {
    totalSalesQuantity: number;
    averageDailySalesQuantity: number;
  };
  storageData?: {
    totalCost: number;
    dayCount: number;
    averageDailyStorageCost: number;
  };
  commissionPercent?: number;
  logisticsCost?: number;
}
