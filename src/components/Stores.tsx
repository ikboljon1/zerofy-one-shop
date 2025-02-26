
import { useState, useEffect } from "react";
import { ShoppingBag, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Store as StoreType, NewStore, STATS_STORAGE_KEY } from "@/types/store";
import { loadStores, saveStores, refreshStoreStats } from "@/utils/storeUtils";
import { AddStoreDialog } from "./stores/AddStoreDialog";
import { StoreCard } from "./stores/StoreCard";

interface StoresProps {
  onStoreSelect?: (store: { id: string; apiKey: string }) => void;
}

export default function Stores({ onStoreSelect }: StoresProps) {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedStores = loadStores();
      setStores(savedStores);
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
    const updatedStores = stores.map(store => ({
      ...store,
      isSelected: store.id === storeId ? !store.isSelected : false
    }));
    
    setStores(updatedStores);
    saveStores(updatedStores);

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
