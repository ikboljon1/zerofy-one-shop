
import { useState, useEffect } from "react";
import { ShoppingBag, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Store as StoreType, NewStore, STATS_STORAGE_KEY } from "@/types/store";
import { loadStores, saveStores, refreshStoreStats, refreshStoreAdsStats } from "@/utils/storeUtils";
import { AddStoreDialog } from "./stores/AddStoreDialog";
import { StoreCard } from "./stores/StoreCard";
import { useStore } from "@/store";

export default function Stores() {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { setSelectedStore, updateStores } = useStore();

  useEffect(() => {
    try {
      const savedStores = loadStores();
      setStores(savedStores);
      
      // Автоматически выбираем магазин, если он выбран в списке
      const selectedStore = savedStores.find(store => store.isSelected);
      if (selectedStore) {
        setSelectedStore(selectedStore);
      }
    } catch (error) {
      console.error("Ошибка загрузки магазинов:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список магазинов",
        variant: "destructive",
      });
    }
  }, []);

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

    setIsLoading(true);

    try {
      const store: StoreType = {
        id: Date.now().toString(),
        marketplace: newStore.marketplace,
        name: newStore.name,
        apiKey: newStore.apiKey,
        isSelected: false,
        lastFetchDate: new Date().toISOString()
      };

      console.log("Created new store object:", store);

      const updatedStore = await refreshStoreStats(store);
      const storeToAdd = updatedStore || store;
      
      const updatedStores = [...stores, storeToAdd];
      setStores(updatedStores);
      saveStores(updatedStores);
      
      console.log("Store added successfully:", storeToAdd);
      
      // Обновляем хранилище
      updateStores();
      
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

  const handleToggleSelection = async (storeId: string) => {
    setIsLoading(true);
    
    try {
      const updatedStores = stores.map(store => ({
        ...store,
        isSelected: store.id === storeId ? !store.isSelected : false
      }));
      
      setStores(updatedStores);
      saveStores(updatedStores);
      
      // Получаем выбранный магазин
      const selectedStore = updatedStores.find(store => store.id === storeId && store.isSelected);
      
      if (selectedStore) {
        console.log("Выбран магазин:", selectedStore.name);
        
        // Обновляем статистику рекламы при выборе магазина
        const storeWithAdsStats = await refreshStoreAdsStats(selectedStore);
        
        if (storeWithAdsStats) {
          console.log("Обновлена рекламная статистика:", storeWithAdsStats.adsStats);
          
          // Обновляем магазин с обновленной рекламной статистикой
          const storesWithUpdatedAds = updatedStores.map(s => 
            s.id === storeId ? storeWithAdsStats : s
          );
          
          setStores(storesWithUpdatedAds);
          saveStores(storesWithUpdatedAds);
          
          // Устанавливаем выбранный магазин в контексте
          setSelectedStore(storeWithAdsStats);
        } else {
          setSelectedStore(selectedStore);
        }
      } else {
        setSelectedStore(null);
      }
      
      // Обновляем хранилище
      updateStores();
    } catch (error) {
      console.error("Ошибка при выборе магазина:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить данные магазина",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshStats = async (store: StoreType) => {
    setIsLoading(true);
    try {
      const updatedStore = await refreshStoreStats(store);
      if (updatedStore) {
        // Также обновляем рекламную статистику
        const storeWithAdsStats = await refreshStoreAdsStats(updatedStore);
        const finalStore = storeWithAdsStats || updatedStore;
        
        const updatedStores = stores.map(s => 
          s.id === store.id ? finalStore : s
        );
        
        setStores(updatedStores);
        saveStores(updatedStores);
        
        // Если это выбранный магазин, обновляем его в контексте
        if (finalStore.isSelected) {
          setSelectedStore(finalStore);
        }
        
        // Обновляем хранилище
        updateStores();
        
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
    const storeToDelete = stores.find(store => store.id === storeId);
    if (!storeToDelete) return;

    const updatedStores = stores.filter(store => store.id !== storeId);
    setStores(updatedStores);
    saveStores(updatedStores);
    localStorage.removeItem(`${STATS_STORAGE_KEY}_${storeId}`);
    
    // Если удаляем выбранный магазин, сбрасываем выбор
    if (storeToDelete.isSelected) {
      setSelectedStore(null);
    }
    
    // Обновляем хранилище
    updateStores();
    
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
        </div>
        <AddStoreDialog
          isOpen={isOpen}
          isLoading={isLoading}
          onOpenChange={setIsOpen}
          onAddStore={handleAddStore}
        />
      </div>

      {stores.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Store className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">У вас пока нет добавленных магазинов</p>
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
