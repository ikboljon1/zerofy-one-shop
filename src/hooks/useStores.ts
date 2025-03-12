import { useState, useEffect } from "react";
import { Store, NewStore } from "@/types/store";
import { useToast } from "@/components/ui/use-toast";
import { loadStores, saveStores, refreshStoreStats, validateApiKey, getOrdersData, getSalesData, fetchAndUpdateOrders, fetchAndUpdateSales } from "@/utils/storeUtils";

export const useStores = (onStoreSelect?: (store: { id: string; apiKey: string }) => void) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [canDeleteStores, setCanDeleteStores] = useState(false);
  const [storeLimit, setStoreLimit] = useState<number>(1);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      const currentUserId = userData ? JSON.parse(userData).id : null;
      
      const savedStores = loadStores();
      const userStores = currentUserId 
        ? savedStores.filter(store => store.userId === currentUserId)
        : savedStores;
      
      setStores(userStores);
      checkDeletePermissions();
      getStoreLimitFromTariff();
    } catch (error) {
      console.error("Ошибка загрузки магазинов:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список магазинов",
        variant: "destructive",
      });
    }
  }, []);

  const getStoreLimitFromTariff = () => {
    const userData = localStorage.getItem('user');
    if (!userData) return;
    
    try {
      const user = JSON.parse(userData);
      const limits = {
        "1": 1,  // Базовый
        "2": 3,  // Профессиональный
        "3": 10, // Бизнес
        "4": 999 // Корпоративный
      };
      setStoreLimit(limits[user.tariffId as keyof typeof limits] || 1);
    } catch (error) {
      console.error("Ошибка при получении лимита магазинов:", error);
      setStoreLimit(1);
    }
  };

  const checkDeletePermissions = () => {
    const userData = localStorage.getItem('user');
    if (!userData) return;
    
    try {
      const user = JSON.parse(userData);
      const { getSubscriptionStatus } = require("@/services/userService");
      const subscriptionData = getSubscriptionStatus(user);
      
      if (subscriptionData?.endDate) {
        const subscriptionEndDate = new Date(subscriptionData.endDate);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        setCanDeleteStores(subscriptionEndDate.getTime() - oneMonthAgo.getTime() < 0);
      }
    } catch (error) {
      console.error("Ошибка при проверке разрешений:", error);
    }
  };

  const handleAddStore = async (newStore: NewStore) => {
    console.log("Starting store addition...");
    
    if (!newStore.marketplace || !newStore.name || !newStore.apiKey) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }

    if (stores.length >= storeLimit) {
      toast({
        title: "Ограничение тарифа",
        description: `Ваш тариф позволяет добавить максимум ${storeLimit} ${storeLimit === 1 ? 'магазин' : storeLimit < 5 ? 'магазина' : 'магазинов'}. Перейдите на более высокий тариф для добавления большего количества магазинов.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const isValidApiKey = await validateApiKey(newStore.apiKey);
      
      if (!isValidApiKey.isValid) {
        toast({
          title: "Ошибка API ключа",
          description: isValidApiKey.errorMessage || "Указанный API ключ некорректен. Пожалуйста, проверьте ключ и попробуйте снова.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const userData = localStorage.getItem('user');
      const currentUserId = userData ? JSON.parse(userData).id : null;

      const store: Store = {
        id: Date.now().toString(),
        marketplace: newStore.marketplace,
        name: newStore.name,
        apiKey: newStore.apiKey,
        isSelected: false,
        lastFetchDate: new Date().toISOString(),
        userId: currentUserId
      };

      console.log("Created new store object:", store);

      const updatedStore = await refreshStoreStats(store);
      const storeToAdd = updatedStore || store;
      
      if (updatedStore && updatedStore.stats) {
        const analyticsData = {
          storeId: store.id,
          dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          dateTo: new Date().toISOString(),
          data: updatedStore.stats,
          timestamp: Date.now()
        };
        
        localStorage.setItem(`marketplace_analytics_${store.id}`, JSON.stringify(analyticsData));
      }
      
      const allStores = loadStores();
      const updatedStores = [...allStores, storeToAdd];
      
      const userStores = currentUserId 
        ? updatedStores.filter(s => s.userId === currentUserId)
        : updatedStores;
      
      setStores(userStores);
      saveStores(updatedStores);
      
      console.log("Store added successfully:", storeToAdd);
      
      setIsOpen(false);
      toast({
        title: "Успешно",
        description: "Магазин успешно добавлен",
      });
    } catch (error) {
      console.error("Ошибка при добавлении магазина:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить магазин",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelection = (storeId: string) => {
    const allStores = loadStores();
    const updatedAllStores = allStores.map(store => ({
      ...store,
      isSelected: store.id === storeId
    }));
    
    const userData = localStorage.getItem('user');
    const currentUserId = userData ? JSON.parse(userData).id : null;
    
    const userStores = currentUserId 
      ? updatedAllStores.filter(store => store.userId === currentUserId)
      : updatedAllStores;
    
    setStores(userStores);
    saveStores(updatedAllStores);

    localStorage.setItem('last_selected_store', JSON.stringify({
      storeId,
      timestamp: Date.now()
    }));

    const selectedStore = stores.find(store => store.id === storeId);
    if (selectedStore && onStoreSelect) {
      onStoreSelect({
        id: selectedStore.id,
        apiKey: selectedStore.apiKey
      });
    }
  };

  const handleRefreshStats = async (store: Store) => {
    setIsLoading(true);
    try {
      const updatedStore = await refreshStoreStats(store);
      if (updatedStore) {
        const allStores = loadStores();
        const updatedAllStores = allStores.map(s => 
          s.id === store.id ? updatedStore : s
        );
        
        const userData = localStorage.getItem('user');
        const currentUserId = userData ? JSON.parse(userData).id : null;
        
        const userStores = currentUserId 
          ? updatedAllStores.filter(s => s.userId === currentUserId)
          : updatedAllStores;
        
        setStores(userStores);
        saveStores(updatedAllStores);
        
        if (updatedStore.stats) {
          const analyticsData = {
            storeId: store.id,
            dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            dateTo: new Date().toISOString(),
            data: updatedStore.stats,
            timestamp: Date.now()
          };
          
          localStorage.setItem(`marketplace_analytics_${store.id}`, JSON.stringify(analyticsData));
        }
        
        toast({
          title: "Успешно",
          description: "Статистика магазина обновлена",
        });
      }
    } catch (error) {
      console.error("Ошибка при обновлении статистики:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статистику",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStore = (storeId: string) => {
    if (!canDeleteStores) {
      toast({
        title: "Действие запрещено",
        description: "Удаление магазинов будет доступно через 1 месяц после активации тарифа",
        variant: "destructive",
      });
      return;
    }

    const storeToDelete = stores.find(store => store.id === storeId);
    if (!storeToDelete) return;

    const allStores = loadStores();
    const updatedAllStores = allStores.filter(store => store.id !== storeId);
    
    const userData = localStorage.getItem('user');
    const currentUserId = userData ? JSON.parse(userData).id : null;
    
    const userStores = currentUserId 
      ? updatedAllStores.filter(store => store.userId === currentUserId)
      : updatedAllStores;
    
    setStores(userStores);
    saveStores(updatedAllStores);
    
    localStorage.removeItem(`marketplace_analytics_${storeId}`);
    
    toast({
      title: "Магазин удален",
      description: `Магазин "${storeToDelete.name}" был успешно удален`,
    });
  };

  return {
    stores,
    isLoading,
    canDeleteStores,
    storeLimit,
    handleAddStore,
    handleToggleSelection,
    handleRefreshStats,
    handleDeleteStore,
  };
};
