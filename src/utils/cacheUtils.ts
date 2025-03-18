
import { WildberriesOrder, WildberriesSale, WarehouseRemainItem } from "@/types/supplies";

export interface CacheData<T> {
  data: T;
  timestamp: number;
  storeId: string;
}

interface CacheConfig {
  ttl: number;  // Time to live in milliseconds
}

const DEFAULT_TTL = 15 * 60 * 1000; // 15 minutes default TTL

const CACHE_KEYS = {
  WAREHOUSE_REMAINS: 'warehouse_remains_cache',
  ORDERS: 'orders_cache',
  SALES: 'sales_cache',
  COEFFICIENTS: 'coefficients_cache',
  PAID_STORAGE: 'paid_storage_cache'
} as const;

export const getCacheConfig = (cacheKey: string): CacheConfig => {
  switch (cacheKey) {
    case CACHE_KEYS.WAREHOUSE_REMAINS:
      return { ttl: 15 * 60 * 1000 }; // 15 minutes for remains
    case CACHE_KEYS.ORDERS:
      return { ttl: 30 * 60 * 1000 }; // 30 minutes for orders
    case CACHE_KEYS.SALES:
      return { ttl: 30 * 60 * 1000 }; // 30 minutes for sales
    case CACHE_KEYS.COEFFICIENTS:
      return { ttl: 60 * 60 * 1000 }; // 1 hour for coefficients
    case CACHE_KEYS.PAID_STORAGE:
      return { ttl: 60 * 60 * 1000 }; // 1 hour for paid storage
    default:
      return { ttl: DEFAULT_TTL };
  }
};

export const setCache = <T>(key: string, data: T, storeId: string): void => {
  try {
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now(),
      storeId
    };
    localStorage.setItem(`${key}_${storeId}`, JSON.stringify(cacheData));
    console.log(`[Cache] Data cached for key: ${key}, store: ${storeId}`);
  } catch (error) {
    console.error('[Cache] Error setting cache:', error);
  }
};

export const getCache = <T>(key: string, storeId: string): CacheData<T> | null => {
  try {
    const cached = localStorage.getItem(`${key}_${storeId}`);
    if (!cached) {
      console.log(`[Cache] Cache miss for key: ${key}, store: ${storeId}`);
      return null;
    }

    const cacheData: CacheData<T> = JSON.parse(cached);
    const config = getCacheConfig(key);
    const isExpired = Date.now() - cacheData.timestamp > config.ttl;

    if (isExpired) {
      console.log(`[Cache] Expired data for key: ${key}, store: ${storeId}`);
      localStorage.removeItem(`${key}_${storeId}`);
      return null;
    }

    console.log(`[Cache] Cache hit for key: ${key}, store: ${storeId}`);
    return cacheData;
  } catch (error) {
    console.error('[Cache] Error getting cache:', error);
    return null;
  }
};

export { CACHE_KEYS };
