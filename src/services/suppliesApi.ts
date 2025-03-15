interface StorageData {
  averageStorageCost: number;
  brand: string;
  vendorCode: string;
  subject: string;
}

interface SalesData {
  averageDailySales: number;
  sa_name: string;
}

interface ProductData {
  storageData?: StorageData;
  salesData?: SalesData;
}

export async function fetchProductDataByNmId(
  apiKey: string,
  nmId: number,
  dateFrom: string,
  dateTo: string
): Promise<ProductData> {
  try {
    console.log(`Fetching data for nmId: ${nmId}, from ${dateFrom} to ${dateTo}`);
    
    // This would be replaced with real API calls in production
    // For now, we'll simulate the API response
    const response: ProductData = {
      storageData: {
        averageStorageCost: Math.random() * 10 + 1, // Random cost between 1 and 11
        brand: "Example Brand",
        vendorCode: `V-${nmId}`,
        subject: "Example Subject"
      },
      salesData: {
        averageDailySales: Math.round(Math.random() * 5 * 100) / 100, // Random sales between 0 and 5
        sa_name: `SA-${nmId}`
      }
    };
    
    console.log("Fetched product data:", response);
    return response;
  } catch (error) {
    console.error("Error fetching product data:", error);
    throw new Error(`Failed to fetch product data: ${error}`);
  }
}

// Add missing functions that are being imported in Warehouses.tsx
export async function fetchWarehouses(apiKey: string) {
  try {
    console.log("Fetching warehouses with API key:", apiKey);
    // Mock data for warehouses
    const warehouses = [
      { id: 1, name: "Warehouse 1", address: "Address 1" },
      { id: 2, name: "Warehouse 2", address: "Address 2" },
      { id: 3, name: "Warehouse 3", address: "Address 3" }
    ];
    return warehouses;
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    throw new Error(`Failed to fetch warehouses: ${error}`);
  }
}

export async function fetchAcceptanceCoefficients(apiKey: string, warehouseIds?: number[]) {
  try {
    console.log("Fetching acceptance coefficients with API key:", apiKey);
    // Mock data for acceptance coefficients
    const coefficients = [
      { warehouseId: 1, date: "2023-01-01", coefficient: 0.85 },
      { warehouseId: 1, date: "2023-01-02", coefficient: 0.87 },
      { warehouseId: 2, date: "2023-01-01", coefficient: 0.92 },
      { warehouseId: 2, date: "2023-01-02", coefficient: 0.90 },
      { warehouseId: 3, date: "2023-01-01", coefficient: 0.88 },
      { warehouseId: 3, date: "2023-01-02", coefficient: 0.89 }
    ];
    
    if (warehouseIds && warehouseIds.length > 0) {
      return coefficients.filter(coef => warehouseIds.includes(coef.warehouseId));
    }
    
    return coefficients;
  } catch (error) {
    console.error("Error fetching acceptance coefficients:", error);
    throw new Error(`Failed to fetch acceptance coefficients: ${error}`);
  }
}

export async function fetchFullPaidStorageReport(apiKey: string, dateFrom: string, dateTo: string) {
  try {
    console.log(`Fetching full paid storage report from ${dateFrom} to ${dateTo} with API key: ${apiKey}`);
    // Mock data for paid storage report
    const paidStorageItems = [
      { nmId: 12345, warehousePrice: 120, vendorCode: "ABC123", brand: "Brand1", subject: "Subject1" },
      { nmId: 67890, warehousePrice: 85, vendorCode: "DEF456", brand: "Brand2", subject: "Subject2" },
      { nmId: 54321, warehousePrice: 95, vendorCode: "GHI789", brand: "Brand3", subject: "Subject3" }
    ];
    
    return paidStorageItems;
  } catch (error) {
    console.error("Error fetching paid storage report:", error);
    throw new Error(`Failed to fetch paid storage report: ${error}`);
  }
}

export function getPreferredWarehouses(storeId: string) {
  try {
    // Get preferred warehouses from localStorage or return empty array
    const storedPreferences = localStorage.getItem(`store_${storeId}_preferred_warehouses`);
    return storedPreferences ? JSON.parse(storedPreferences) : [];
  } catch (error) {
    console.error("Error getting preferred warehouses:", error);
    return [];
  }
}

export function togglePreferredWarehouse(storeId: string, warehouseId: number) {
  try {
    const preferred = getPreferredWarehouses(storeId);
    const index = preferred.indexOf(warehouseId);
    
    if (index === -1) {
      // Add warehouse to preferred list
      preferred.push(warehouseId);
    } else {
      // Remove warehouse from preferred list
      preferred.splice(index, 1);
    }
    
    // Save updated preferences to localStorage
    localStorage.setItem(`store_${storeId}_preferred_warehouses`, JSON.stringify(preferred));
    
    return preferred;
  } catch (error) {
    console.error("Error toggling preferred warehouse:", error);
    return [];
  }
}
