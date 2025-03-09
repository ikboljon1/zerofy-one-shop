
import { useState, useEffect } from "react";
import { ShoppingBag, Store, Package2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Store as StoreType, NewStore, STATS_STORAGE_KEY } from "@/types/store";
import { loadStores, saveStores, refreshStoreStats, ensureStoreSelectionPersistence } from "@/utils/storeUtils";
import { AddStoreDialog } from "./stores/AddStoreDialog";
import { StoreCard } from "./stores/StoreCard";
import { getSubscriptionStatus, SubscriptionData } from "@/services/userService";
import { Badge } from "@/components/ui/badge";
import { fetchWildberriesStats } from "@/services/wildberriesApi";

interface StoresProps {
  onStoreSelect?: (store: { id: string; apiKey: string }) => void;
}

export default function Stores({ onStoreSelect }: StoresProps) {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [canDeleteStores, setCanDeleteStores] = useState(true); // Default to true so users can delete invalid stores
  const [storeLimit, setStoreLimit] = useState<number>(1); // Default to 1
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedStores = ensureStoreSelectionPersistence();
      setStores(savedStores);
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
      // Double check API key validity before actually adding the store
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      console.log("Verifying API key before adding store...");
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const validationResult = await fetchWildberriesStats(newStore.apiKey, weekAgo, today, controller.signal);
      clearTimeout(timeoutId);
      
      // Detailed validation of the API response structure
      if (!validationResult || 
          !validationResult.currentPeriod || 
          typeof validationResult.currentPeriod.sales !== 'number' ||
          !validationResult.dailySales || 
          !Array.isArray(validationResult.dailySales)) {
        throw new Error("Неверный API ключ или сервер вернул некорректные данные. Пожалуйста, проверьте ключ и попробуйте снова.");
      }
      
      console.log("API key validation successful, proceeding with store addition");
      
      const store: StoreType = {
        id: Date.now().toString(),
        marketplace: newStore.marketplace,
        name: newStore.name,
        apiKey: newStore.apiKey,
        isSelected: false,
        isValid: true,
        lastFetchDate: new Date().toISOString()
      };

      console.log("Created new store object:", store);

      // API key is valid, now fetch and update the stats
      const updatedStore = await refreshStoreStats(store);
      
      if (!updatedStore || !updatedStore.stats) {
        throw new Error("Не удалось получить данные от API. Пожалуйста, проверьте API ключ.");
      }
      
      const storeToAdd = updatedStore || store;
      
      // Save analytics data
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
      
      const updatedStores = [...stores, storeToAdd];
      setStores(updatedStores);
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
        description: error instanceof Error ? error.message : "Не удалось добавить магазин",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelection = (storeId: string) => {
    const updatedStores = stores.map(store => ({
      ...store,
      isSelected: store.id === storeId
    }));
    
    setStores(updatedStores);
    saveStores(updatedStores);

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
        const updatedStores = stores.map(s => 
          s.id === store.id ? updatedStore : s
        );
        setStores(updatedStores);
        saveStores(updatedStores);
        
        // Также обновляем данные для использования в Analytics и Dashboard
        if (updatedStore.stats) {
          const analyticsData = {
            storeId: store.id,
            dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            dateTo: new Date().toISOString(),
            data: updatedStore.stats,
            timestamp: Date.now()
          };
          
          // Сохраняем данные для использования в аналитике
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
    // Allow deletion of stores with invalid API keys by making canDeleteStores always true
    const storeToDelete = stores.find(store => store.id === storeId);
    if (!storeToDelete) return;

    // Remove the store from storage and update UI
    const updatedStores = stores.filter(store => store.id !== storeId);
    setStores(updatedStores);
    saveStores(updatedStores);
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
              canDelete={true} // Always allow deletion
            />
          ))}
        </div>
      )}
    </div>
  );
}
