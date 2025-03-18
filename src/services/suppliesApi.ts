
import axios from 'axios';
import { SupplyOptionsResponse, WarehouseCoefficient, Warehouse } from '@/types/supplies';

const API_BASE_URL = 'https://suppliers-api.wildberries.ru/api/v3';

/**
 * Fetches supply options for given barcodes
 * @param {string} apiKey - The API key for authentication
 * @param {string[]} barcodes - An array of barcodes to check supply options for
 * @returns {Promise<SupplyOptionsResponse>} - A promise that resolves with the supply options response
 */
export const fetchSupplyOptions = async (apiKey: string, barcodes: string[]): Promise<SupplyOptionsResponse> => {
  try {
    const response = await axios.post<SupplyOptionsResponse>(
    `${API_BASE_URL}/supplies/options`,
    { barcodes },
    {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    }
  );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching supply options:', error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Fetches acceptance coefficients for a given API key and warehouse IDs.
 * @param {string} apiKey - The API key for authentication.
 * @param {number[]} warehouseIDs - An optional array of warehouse IDs to filter the coefficients.
 * @returns {Promise<WarehouseCoefficient[]>} - A promise that resolves with an array of warehouse coefficients.
 */
export const fetchAcceptanceCoefficients = async (apiKey: string, warehouseIDs?: number[]): Promise<WarehouseCoefficient[]> => {
  try {
    let url = `${API_BASE_URL}/warehouses/acceptance-coefficients`;
    if (warehouseIDs && warehouseIDs.length > 0) {
      const warehouseIdParams = warehouseIDs.map(id => `warehouseId=${id}`).join('&');
      url += `?${warehouseIdParams}`;
    }

    const response = await axios.get<WarehouseCoefficient[]>(url, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching acceptance coefficients:', error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Fetches warehouses for a given API key.
 * @param {string} apiKey - The API key for authentication.
 * @returns {Promise<Warehouse[]>} - A promise that resolves with an array of warehouses.
 */
export const fetchWarehouses = async (apiKey: string): Promise<Warehouse[]> => {
  try {
    const response = await axios.get<Warehouse[]>(`${API_BASE_URL}/warehouses`, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching warehouses:', error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Fetches full paid storage report for a given API key and date range.
 * @param {string} apiKey - The API key for authentication.
 * @param {string} dateFrom - The start date for the report.
 * @param {string} dateTo - The end date for the report.
 * @returns {Promise<any[]>} - A promise that resolves with an array of paid storage data.
 */
export const fetchFullPaidStorageReport = async (apiKey: string, dateFrom: string, dateTo: string): Promise<any[]> => {
  try {
    const response = await axios.get<any[]>(
      `${API_BASE_URL}/storage/full-paid-report?dateFrom=${dateFrom}&dateTo=${dateTo}`,
      {
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching full paid storage report:', error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Get preferred warehouses from localStorage for a specific store
 * @param {string} storeId - The store ID to get preferred warehouses for
 * @returns {number[]} - Array of preferred warehouse IDs
 */
export const getPreferredWarehouses = (storeId: string): number[] => {
  const preferredStr = localStorage.getItem(`preferred_warehouses_${storeId}`);
  try {
    return preferredStr ? JSON.parse(preferredStr) : [];
  } catch (e) {
    console.error('Error parsing preferred warehouses:', e);
    return [];
  }
};

/**
 * Fetch sales data for the last month
 * @param {string} apiKey - The API key for authentication
 * @returns {Promise<Map<number, number>>} - A map of product nmIds to their sales quantity
 */
export const fetchLastMonthSalesData = async (apiKey: string): Promise<Map<number, number>> => {
  try {
    // Calculate date range for last month
    const now = new Date();
    const lastMonth = new Date(now);
    lastMonth.setMonth(now.getMonth() - 1);
    
    const dateFrom = formatDateString(lastMonth);
    const dateTo = formatDateString(now);
    
    console.log(`Fetching sales data from ${dateFrom} to ${dateTo}`);
    
    // In a real implementation, this would make an API call to Wildberries
    // For now, we'll simulate the API response
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network request
    
    // Sample data map
    const salesMap = new Map<number, number>();
    
    // Let's add some mock data for testing
    for (let i = 1000; i < 1100; i++) {
      salesMap.set(i, Math.floor(Math.random() * 30));
    }
    
    console.log(`Fetched sales data for ${salesMap.size} products`);
    return salesMap;
  } catch (error: any) {
    console.error('Error fetching sales data:', error.message || error);
    // Return empty map in case of error
    return new Map<number, number>();
  }
};

/**
 * Enrich products data with sales information
 * @param {any[]} products - Array of product objects from Wildberries API
 * @param {Map<number, number>} salesData - Map of nmId to sales quantity
 * @returns {any[]} - Enriched products with sales data
 */
export const enrichProductsWithSalesData = (products: any[], salesData: Map<number, number>): any[] => {
  return products.map(product => {
    // Get the nmId from the product
    const nmId = product.nmId || product.nmID;
    
    // If we have sales data for this product, add it
    if (nmId && salesData.has(nmId)) {
      return {
        ...product,
        quantitySold: salesData.get(nmId) || 0,
        salesPerDay: (salesData.get(nmId) || 0) / 30, // Average daily sales based on month
      };
    }
    
    // If we don't have sales data, add zero values
    return {
      ...product,
      quantitySold: 0,
      salesPerDay: 0
    };
  });
};

/**
 * Fetch storage data for the last month
 * @param {string} apiKey - The API key for authentication
 * @returns {Promise<any[]>} - Storage data for the last month
 */
export const fetchLastMonthStorageData = async (apiKey: string): Promise<any[]> => {
  try {
    // Calculate date range for last month
    const now = new Date();
    const lastMonth = new Date(now);
    lastMonth.setMonth(now.getMonth() - 1);
    
    const dateFrom = formatDateString(lastMonth);
    const dateTo = formatDateString(now);
    
    console.log(`Fetching storage data from ${dateFrom} to ${dateTo}`);
    
    // Call the existing function to get storage data
    return await fetchFullPaidStorageReport(apiKey, dateFrom, dateTo);
  } catch (error: any) {
    console.error('Error fetching storage data:', error.message || error);
    return [];
  }
};

// Helper function to format date string in YYYY-MM-DD format
const formatDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
