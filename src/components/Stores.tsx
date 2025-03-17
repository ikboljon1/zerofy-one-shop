import { useState, useEffect } from "react";
import { ShoppingBag, Store, Package2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Store as StoreType, NewStore, STATS_STORAGE_KEY } from "@/types/store";
import { loadStores, saveStores, refreshStoreStats, ensureStoreSelectionPersistence, validateApiKey } from "@/utils/storeUtils";
import { AddStoreDialog } from "./stores/AddStoreDialog";
import { StoreCard } from "./stores/StoreCard";
import { getSubscriptionStatus, SubscriptionData } from "@/services/userService";
import { Badge } from "@/components/ui/badge";

interface StoresProps {
  onStoreSelect?: (store: { id: string; apiKey: string }) => void;
}

export default function Stores({ onStoreSelect }: StoresProps) {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [canDeleteStores, setCanDeleteStores] = useState(false);
  const [storeLimit, setStoreLimit] = useState<number>(1); // Default to 1
  const { toast } = useToast();

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      const currentUserId = userData ? JSON.parse(userData).id : null;
      
      // Загружаем и фильтруем магазины по текущему пользователю
      const savedStores = ensureStoreSelectionPersistence();
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
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (!userData) return;
    
    try {
      const user = JSON.parse(userData);
      
      // Set store limit based on tariff
      switch (user.tariffId) {
        case "1": // Базовый
          setStoreLimit(1);
          break;
        case "2": // Профессиональный
          setStoreLimit(3);
          break;
        case "3": // Бизнес
          setStoreLimit(10);
          break;
        case "4": // Корпоративный
          setStoreLimit(999); // Practically unlimited
          break;
        default:
          setStoreLimit(1); // Default to basic plan
      }
    } catch (error) {
      console.error("Ошибка при получении лимита магазинов:", error);
      setStoreLimit(1); // Default to basic plan on error
    }
  };

  const checkDeletePermissions = async () => {
    // Get current user from localStorage
    const userData = localStorage.getItem('user');
    if (!userData) return;
    
    try {
      const user = JSON.parse(userData);
      
      // Get subscription information
      const subscriptionData: SubscriptionData = getSubscriptionStatus(user);
      
      if (subscriptionData && subscriptionData.endDate) {
        const subscriptionEndDate = new Date(subscriptionData.endDate);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        // Если конец подписки более чем через месяц, значит подписка оформлена менее месяца назад
        // В этом случае удаление запрещено
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

    // Check if store limit has been reached
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
      // Validate API key before creating the store
      const validationResult = await validateApiKey(newStore.apiKey);
      
      if (!validationResult.isValid) {
        toast({
          title: "Ошибка API ключа",
          description: validationResult.errorMessage || "Указанный API ключ некорректен. Пожалуйста, проверьте ключ и попробуйте снова.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Получаем текущего пользователя из localStorage
      const userData = localStorage.getItem('user');
      const currentUserId = userData ? JSON.parse(userData).id : null;

      const store: StoreType = {
        id: Date.now().toString(),
        marketplace: newStore.marketplace,
        name: newStore.name,
        apiKey: newStore.apiKey,
        isSelected: false,
        lastFetchDate: new Date().toISOString(),
        userId: currentUserId // Привязываем магазин к текущему пользователю
      };

      console.log("Created new store object:", store);

      const updatedStore = await refreshStoreStats(store);
      const storeToAdd = updatedStore || store;
      
      // Сохраняем данные для использования в Analytics и Dashboard
      if (updatedStore && updatedStore.stats) {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        
        // Создаем или обновляем данные для Analytics
        const analyticsData = {
          storeId: store.id,
          dateFrom: weekAgo.toISOString(),
          dateTo: today.toISOString(),
          data: updatedStore.stats,
          penalties: [],
          returns: [],
          deductions: [],
          deductionsTimeline: updatedStore.stats.dailySales?.map((day: any, index: number) => {
            const daysCount = updatedStore.stats.dailySales.length || 1;
            const logistic = (updatedStore.stats.currentPeriod.expenses.logistics || 0) / daysCount;
            const storage = (updatedStore.stats.currentPeriod.expenses.storage || 0) / daysCount;
            const penalties = (updatedStore.stats.currentPeriod.expenses.penalties || 0) / daysCount;
            const acceptance = (updatedStore.stats.currentPeriod.expenses.acceptance || 0) / daysCount;
            const advertising = (updatedStore.stats.currentPeriod.expenses.advertising || 0) / daysCount;
            const deductions = (updatedStore.stats.currentPeriod.expenses.deductions || 0) / daysCount;
            
            return {
              date: typeof day.date === 'string' ? day.date.split('T')[0] : new Date(weekAgo.getTime() + index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              logistic,
              storage,
              penalties,
              acceptance,
              advertising,
              deductions
            };
          }) || [],
          productAdvertisingData: [],
          advertisingBreakdown: { search: 0 },
          timestamp: Date.now()
        };
        
        // Сохраняем данные для аналитики в localStorage
        localStorage.setItem(`marketplace_analytics_${store.id}`, JSON.stringify(analyticsData));
        
        // Пытаемся сохранить данные в API, если это не удается - уже сохранили в localStorage
        try {
          await fetch('http://localhost:3001/api/store-stats', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              storeId: store.id,
              dateFrom: weekAgo.toISOString(),
              dateTo: today.toISOString(),
              data: updatedStore.stats
            })
          });
          
          await fetch('http://localhost:3001/api/analytics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(analyticsData)
          });
        } catch (apiError) {
          console.error('Error saving data to API:', apiError);
          // Данные уже сохранены в localStorage, поэтому продолжаем
        }
      }
      
      // Получаем все магазины и добавляем новый
      const allStores = loadStores();
      const updatedStores = [...allStores, storeToAdd];
      
      // Обновляем только магазины текущего пользователя в состоянии
      const userStores = currentUserId 
        ? updatedStores.filter(s => s.userId === currentUserId)
        : updatedStores;
      
      setStores(userStores);
      saveStores(updatedStores); // Сохраняем все магазины
      
      console.log("Store added successfully:", storeToAdd);
      
      setIsOpen(false);
      toast({
        title: "Успешно",
        description: "Магазин успешно добавлен",
      });
      
      // Вызываем диспетчер события для обновления других компонентов
      window.dispatchEvent(new CustomEvent('store-added', { 
        detail: { store: storeToAdd }
      }));
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
    // Получаем все магазины
    const allStores = loadStores();
    const updatedAllStores = allStores.map(store => ({
      ...store,
      isSelected: store.id === storeId
    }));
    
    // Обновляем состояние только для магазинов текущего пользователя
    const userData = localStorage.getItem('user');
    const currentUserId = userData ? JSON.parse(userData).id : null;
    
    const userStores = currentUserId 
      ? updatedAllStores.filter(store => store.userId === currentUserId)
      : updatedAllStores;
    
    setStores(userStores);
    saveStores(updatedAllStores); // Сохраняем все магазины

    // Save the selected store separately for better persistence
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

  const handleRefreshStats = async (store: StoreType) => {
    setIsLoading(true);
    try {
      const updatedStore = await refreshStoreStats(store);
      if (updatedStore) {
        // Получаем все магазины
        const allStores = loadStores();
        const updatedAllStores = allStores.map(s => 
          s.id === store.id ? updatedStore : s
        );
        
        // Обновляем состояние только для магазинов текущего пользователя
        const userData = localStorage.getItem('user');
        const currentUserId = userData ? JSON.parse(userData).id : null;
        
        const userStores = currentUserId 
          ? updatedAllStores.filter(s => s.userId === currentUserId)
          : updatedAllStores;
        
        setStores(userStores);
        saveStores(updatedAllStores); // Сохраняем все магазины
        
        // Также обновляем данные для использования в Analytics и Dashboard
        if (updatedStore.stats) {
          const today = new Date();
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          
          // Обновляем данные для Analytics
          const analyticsData = {
            storeId: store.id,
            dateFrom: weekAgo.toISOString(),
            dateTo: today.toISOString(),
            data: updatedStore.stats,
            penalties: [],
            returns: [],
            deductions: [],
            deductionsTimeline: updatedStore.stats.dailySales?.map((day: any, index: number) => {
              const daysCount = updatedStore.stats.dailySales.length || 1;
              const logistic = (updatedStore.stats.currentPeriod.expenses.logistics || 0) / daysCount;
              const storage = (updatedStore.stats.currentPeriod.expenses.storage || 0) / daysCount;
              const penalties = (updatedStore.stats.currentPeriod.expenses.penalties || 0) / daysCount;
              const acceptance = (updatedStore.stats.currentPeriod.expenses.acceptance || 0) / daysCount;
              const advertising = (updatedStore.stats.currentPeriod.expenses.advertising || 0) / daysCount;
              const deductions = (updatedStore.stats.currentPeriod.expenses.deductions || 0) / daysCount;
              
              return {
                date: typeof day.date === 'string' ? day.date.split('T')[0] : new Date(weekAgo.getTime() + index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                logistic,
                storage,
                penalties,
                acceptance,
                advertising,
                deductions
              };
            }) || [],
            productAdvertisingData: [],
            advertisingBreakdown: { search: 0 },
            timestamp: Date.now()
          };
          
          // Сохраняем данные для аналитики в localStorage
          localStorage.setItem(`marketplace_analytics_${store.id}`, JSON.stringify(analyticsData));
          
          // Пытаемся сохранить данные в API, если это не удается - уже сохранили в localStorage
          try {
            await fetch('http://localhost:3001/api/store-stats', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                storeId: store.id,
                dateFrom: weekAgo.toISOString(),
                dateTo: today.toISOString(),
                data: updatedStore.stats
              })
            });
            
            await fetch('http://localhost:3001/api/analytics', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(analyticsData)
            });
          } catch (apiError) {
            console.error('Error saving data to API:', apiError);
            // Данные уже сохранены в localStorage, поэтому продолжаем
          }
        }
        
        toast({
          title: "Успешно",
          description: "Статистика магазина обновлена",
        });
        
        // Вызываем диспетчер события для обновления других компонентов
        window.dispatchEvent(new CustomEvent('store-data-updated', { 
          detail: { store: updatedStore }
        }));
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
    // Проверяем, можно ли удалять магазины
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

    // Получаем все магазины и удаляем нужный
    const allStores = loadStores();
    const updatedAllStores = allStores.filter(store => store.id !== storeId);
    
    // Обновляем состояние только для магазинов текущего пользователя
    const userData = localStorage.getItem('user');
    const currentUserId = userData ? JSON.parse(userData).id : null;
    
    const userStores = currentUserId 
      ? updatedAllStores.filter(store => store.userId === currentUserId)
      : updatedAllStores;
    
    setStores(userStores);
    saveStores(updatedAllStores); // Сохраняем все магазины
    
    localStorage.removeItem(`${STATS_STORAGE_KEY}_${storeId}`);
    localStorage.removeItem(`marketplace_analytics_${storeId}`);
    
    toast({
      title: "Магазин удален",
      description: `Магазин "${storeToDelete.name}" был успешно удален`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Магазины</h2>
          
          {/* Store count indicator */}
          <Badge variant="outline" className="flex items-center gap-1.5 ml-2 bg-blue-950/30 text-blue-400 border-blue-800">
            <Package2 className="h-3.5 w-3.5" />
            <span>{stores.length}/{storeLimit}</span>
          </Badge>
        </div>
        <AddStoreDialog
          isOpen={isOpen}
          isLoading={isLoading}
          onOpenChange={setIsOpen}
          onAddStore={handleAddStore}
          storeCount={stores.length}
          storeLimit={storeLimit}
        />
      </div>

      {stores.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Store className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">У вас пока нет добавленных магазинов</p>
            {storeLimit > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Ваш текущий тариф позволяет добавить до {storeLimit} {storeLimit === 1 ? 'магазина' : storeLimit < 5 ? 'магазина' : 'магазинов'}
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onToggleSelection={handleToggleSelection}
              onDelete={handleDeleteStore}
              onRefreshStats={handleRefreshStats}
              isLoading={isLoading}
              canDelete={canDeleteStores}
            />
          ))}
        </div>
      )}
    </div>
  );
}
