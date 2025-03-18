
const CACHE_TTL = {
  WAREHOUSES: 24 * 60 * 60 * 1000, // 24 часа
  REMAINS: 6 * 60 * 60 * 1000,     // 6 часов
  SALES: 1 * 60 * 60 * 1000,       // 1 час
  STORAGE: 12 * 60 * 60 * 1000     // 12 часов
};

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export const setCacheItem = <T>(key: string, data: T): void => {
  const cacheItem: CacheItem<T> = {
    data,
    timestamp: Date.now()
  };
  localStorage.setItem(key, JSON.stringify(cacheItem));
  console.log(`[Cache] Data cached for key: ${key}`);
};

export const getCacheItem = <T>(key: string, ttl: number): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const cacheItem: CacheItem<T> = JSON.parse(item);
    const now = Date.now();

    if (now - cacheItem.timestamp > ttl) {
      console.log(`[Cache] Cache expired for key: ${key}`);
      localStorage.removeItem(key);
      return null;
    }

    console.log(`[Cache] Cache hit for key: ${key}`);
    return cacheItem.data;
  } catch {
    console.log(`[Cache] Error reading cache for key: ${key}`);
    return null;
  }
};

export { CACHE_TTL };
