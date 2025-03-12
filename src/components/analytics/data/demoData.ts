
// Минимальная структура для API-интерфейса
export const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#6366F1'];

// Пустые данные для состояния по умолчанию при превышении лимита
export const emptyAnalyticsData = {
  currentPeriod: {
    sales: 0,
    transferred: 0,
    expenses: {
      total: 0,
      logistics: 0,
      storage: 0,
      penalties: 0,
      advertising: 0,
      acceptance: 0,
      deductions: 0
    },
    netProfit: 0,
    acceptance: 0
  },
  dailySales: [],
  productSales: [],
  productReturns: [],
  topProfitableProducts: [],
  topUnprofitableProducts: []
};

// Пустые данные для графиков
export const emptyDeductionsTimelineData = [];
export const emptyAdvertisingData = [];
export const emptyPenaltiesData = [];
export const emptyReturnsData = [];
export const emptyDeductionsData = [];
