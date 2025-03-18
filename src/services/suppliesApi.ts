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
