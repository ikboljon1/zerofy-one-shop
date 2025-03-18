
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCacheItem, setCacheItem, CACHE_TTL } from '@/utils/cacheUtils';
import { toast } from 'sonner';

interface WarehouseDataParams {
  storeId: string;
  apiKey: string;
  endpoint: string;
  cacheKey: string;
  ttl: number;
  fetchFn: () => Promise<any>;
}

export const useWarehouseData = ({
  storeId,
  apiKey,
  endpoint,
  cacheKey,
  ttl,
  fetchFn
}: WarehouseDataParams) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fullCacheKey = `${cacheKey}_${storeId}`;

  const fetchWithCache = useCallback(async () => {
    // Сначала проверяем кэш
    const cachedData = getCacheItem(fullCacheKey, ttl);
    if (cachedData) {
      console.log(`[Cache] Using cached data for ${endpoint}, storeId: ${storeId}`);
      return cachedData;
    }

    // Если в кэше нет данных или они устарели, делаем запрос
    console.log(`[Cache] Fetching fresh data for ${endpoint}, storeId: ${storeId}`);
    try {
      const data = await fetchFn();
      setCacheItem(fullCacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }, [storeId, endpoint, fullCacheKey, ttl, fetchFn]);

  const { data, isLoading, error } = useQuery({
    queryKey: [endpoint, storeId],
    queryFn: fetchWithCache,
    staleTime: ttl,
    retry: 2,
    meta: {
      errorHandler: (err: Error) => {
        toast.error(`Ошибка при загрузке данных: ${err.message}`);
      }
    }
  });

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const freshData = await fetchFn();
      setCacheItem(fullCacheKey, freshData);
      setIsRefreshing(false);
      return freshData;
    } catch (error) {
      setIsRefreshing(false);
      throw error;
    }
  }, [storeId, endpoint, fullCacheKey, fetchFn]);

  return {
    data,
    isLoading,
    error,
    isRefreshing,
    refresh
  };
};
