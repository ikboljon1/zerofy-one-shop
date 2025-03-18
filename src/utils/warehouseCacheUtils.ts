
import { 
  WarehouseCoefficient, 
  Warehouse, 
  WarehouseRemainItem,
  PaidStorageItem
} from "@/types/supplies";

// Cache keys
const CACHE_PREFIX = 'wb_warehouse_cache_';
const WAREHOUSE_REMAINS_KEY = 'remains_';
const WAREHOUSES_LIST_KEY = 'warehouses_';
const COEFFICIENTS_KEY = 'coefficients_';
const PAID_STORAGE_KEY = 'paid_storage_';
const AVERAGE_SALES_KEY = 'average_sales_';

// TTL in milliseconds
const DEFAULT_TTL = 15 * 60 * 1000; // 15 minutes
const COEFFICIENTS_TTL = 60 * 60 * 1000; // 1 hour - coefficients change less frequently
const WAREHOUSES_LIST_TTL = 24 * 60 * 60 * 1000; // 24 hours - warehouse list rarely changes

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Generic function to save data to cache with TTL
export function saveToCache<T>(key: string, storeId: string, data: T, ttl = DEFAULT_TTL): void {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}${storeId}`;
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    console.log(`[Cache] Saved ${key} data for store ${storeId}, expires in ${ttl/60000} minutes`);
  } catch (error) {
    console.error('[Cache] Error saving to cache:', error);
  }
}

// Generic function to get data from cache, returns null if expired or not found
export function getFromCache<T>(key: string, storeId: string): T | null {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}${storeId}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (!cachedData) {
      console.log(`[Cache] No cache found for ${key} (store ${storeId})`);
      return null;
    }
    
    const cacheItem: CacheItem<T> = JSON.parse(cachedData);
    const now = Date.now();
    const age = now - cacheItem.timestamp;
    
    if (age > cacheItem.ttl) {
      console.log(`[Cache] Cache expired for ${key} (store ${storeId}), age: ${age/60000} minutes`);
      return null;
    }
    
    console.log(`[Cache] Using cached ${key} data for store ${storeId}, age: ${age/60000} minutes`);
    return cacheItem.data;
  } catch (error) {
    console.error('[Cache] Error reading from cache:', error);
    return null;
  }
}

// Function to check if cache exists and is valid
export function isCacheValid(key: string, storeId: string): boolean {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}${storeId}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (!cachedData) return false;
    
    const cacheItem: CacheItem<any> = JSON.parse(cachedData);
    const now = Date.now();
    const age = now - cacheItem.timestamp;
    
    return age <= cacheItem.ttl;
  } catch {
    return false;
  }
}

// Specific functions for warehouse data types
export function saveWarehouseRemains(storeId: string, data: WarehouseRemainItem[]): void {
  saveToCache(WAREHOUSE_REMAINS_KEY, storeId, data, DEFAULT_TTL);
}

export function getWarehouseRemains(storeId: string): WarehouseRemainItem[] | null {
  return getFromCache<WarehouseRemainItem[]>(WAREHOUSE_REMAINS_KEY, storeId);
}

export function saveWarehouses(storeId: string, data: Warehouse[]): void {
  saveToCache(WAREHOUSES_LIST_KEY, storeId, data, WAREHOUSES_LIST_TTL);
}

export function getWarehouses(storeId: string): Warehouse[] | null {
  return getFromCache<Warehouse[]>(WAREHOUSES_LIST_KEY, storeId);
}

export function saveCoefficients(storeId: string, data: WarehouseCoefficient[]): void {
  saveToCache(COEFFICIENTS_KEY, storeId, data, COEFFICIENTS_TTL);
}

export function getCoefficients(storeId: string): WarehouseCoefficient[] | null {
  return getFromCache<WarehouseCoefficient[]>(COEFFICIENTS_KEY, storeId);
}

export function savePaidStorage(storeId: string, data: PaidStorageItem[]): void {
  saveToCache(PAID_STORAGE_KEY, storeId, data, DEFAULT_TTL);
}

export function getPaidStorage(storeId: string): PaidStorageItem[] | null {
  return getFromCache<PaidStorageItem[]>(PAID_STORAGE_KEY, storeId);
}

export function saveAverageSales(storeId: string, data: Record<number, number>): void {
  saveToCache(AVERAGE_SALES_KEY, storeId, data, DEFAULT_TTL);
}

export function getAverageSales(storeId: string): Record<number, number> | null {
  return getFromCache<Record<number, number>>(AVERAGE_SALES_KEY, storeId);
}

// Function to clear specific cache
export function clearCache(key: string, storeId: string): void {
  const cacheKey = `${CACHE_PREFIX}${key}${storeId}`;
  localStorage.removeItem(cacheKey);
}

// Function to get cache expiration time in human-readable format
export function getCacheExpirationTime(key: string, storeId: string): string {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}${storeId}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (!cachedData) return 'Нет данных';
    
    const cacheItem: CacheItem<any> = JSON.parse(cachedData);
    const expirationTime = new Date(cacheItem.timestamp + cacheItem.ttl);
    
    return expirationTime.toLocaleTimeString();
  } catch {
    return 'Неизвестно';
  }
}

// Function to clear all cache for a specific store
export function clearAllStoreCache(storeId: string): void {
  try {
    const keys = [
      WAREHOUSE_REMAINS_KEY,
      WAREHOUSES_LIST_KEY,
      COEFFICIENTS_KEY,
      PAID_STORAGE_KEY,
      AVERAGE_SALES_KEY
    ];
    
    keys.forEach(key => {
      clearCache(key, storeId);
    });
    
    console.log(`[Cache] Cleared all cache for store ${storeId}`);
  } catch (error) {
    console.error('[Cache] Error clearing all cache:', error);
  }
}
