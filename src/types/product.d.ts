

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
  // Поля для анализа рентабельности хранения
  averageDailySales?: number;
  warehousePrice?: number;
  salesData?: {
    totalSalesQuantity: number;
    averageDailySalesQuantity: number;
    sa_name?: string;
  };
  storageData?: {
    totalCost: number;
    dayCount: number;
    averageDailyStorageCost: number;
    vendor_code?: string;
    brand?: string;
    subject?: string;
  };
  commissionPercent?: number;
  logisticsCost?: number;
}

