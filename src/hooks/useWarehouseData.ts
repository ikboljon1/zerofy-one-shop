
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWarehouseRemains } from '@/services/warehouseRemainsApi';
import { getCache, setCache, CACHE_KEYS } from '@/utils/cacheUtils';
import { toast } from 'sonner';
import { WarehouseRemainItem } from '@/types/supplies';

export const useWarehouseData = (storeId: string, apiKey: string) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (): Promise<WarehouseRemainItem[]> => {
    const cached = getCache<WarehouseRemainItem[]>(CACHE_KEYS.WAREHOUSE_REMAINS, storeId);
    if (cached) {
      return cached.data;
    }

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
