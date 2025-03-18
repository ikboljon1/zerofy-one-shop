
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWarehouseRemains } from '@/services/warehouseRemainsApi';
import { getCache, setCache, CACHE_KEYS } from '@/utils/cacheUtils';
import { toast } from 'sonner';
import { WarehouseRemainItem } from '@/types/supplies';

export const useWarehouseData = (storeId: string, apiKey: string) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (): Promise<WarehouseRemainItem[]> => {
    // First check cache
    const cached = getCache<WarehouseRemainItem[]>(CACHE_KEYS.WAREHOUSE_REMAINS, storeId);
    if (cached) {
      console.log('[Warehouse] Using cached data');
      return cached.data;
    }

    // Only if no cache, fetch from API
    console.log('[Warehouse] No cache found, fetching from API');
    const data = await fetchWarehouseRemains(apiKey);
    if (data && data.length > 0) {
      setCache(CACHE_KEYS.WAREHOUSE_REMAINS, data, storeId);
    }
    return data;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['warehouseRemains', storeId],
    queryFn: fetchData,
    retry: 1,
    // Don't auto-refetch unless explicitly requested
    staleTime: 15 * 60 * 1000, // Consider data fresh for 15 minutes
    meta: {
      errorHandler: (err: Error) => {
        toast.error('Ошибка при загрузке данных о складах');
        console.error('Error fetching warehouse data:', err);
      }
    }
  });

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Данные успешно обновлены');
    } catch (error) {
      toast.error('Не удалось обновить данные');
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    isRefreshing,
    refreshData
  };
};
