
import { STORES_STORAGE_KEY, Store, PRODUCT_EFFICIENCY_KEY, ProductEfficiency } from "@/types/store";

export const getStores = (): Store[] => {
  try {
    const stores = localStorage.getItem(STORES_STORAGE_KEY);
    return stores ? JSON.parse(stores) : [];
  } catch (error) {
    console.error("Error getting stores:", error);
    return [];
  }
};

export const getSelectedStore = (): Store | null => {
  try {
    const stores = getStores();
    const selectedStore = stores.find((store) => store.isSelected);
    return selectedStore || null;
  } catch (error) {
    console.error("Error getting selected store:", error);
    return null;
  }
};

export const getProductProfitabilityData = (storeId: string): ProductEfficiency | null => {
  try {
    const efficiencyData = localStorage.getItem(PRODUCT_EFFICIENCY_KEY);
    if (!efficiencyData) return null;
    
    const allData: ProductEfficiency[] = JSON.parse(efficiencyData);
    const storeData = allData.find(data => data.storeId === storeId);
    
    return storeData || null;
  } catch (error) {
    console.error("Error getting product profitability data:", error);
    return null;
  }
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value).replace('₽', '₽');
};

export const parseCurrencyString = (str: string): number => {
  if (!str) return 0;
  // Удаляем все нечисловые символы, кроме точки и минуса
  const numStr = str.replace(/[^\d.-]/g, '');
  return parseFloat(numStr) || 0;
};
