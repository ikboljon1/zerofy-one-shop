import { useState, useEffect } from "react";
import { ShoppingBag, Plus, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchWildberriesStats, WildberriesResponse } from "@/services/wildberriesApi";

type Marketplace = "Wildberries" | "Ozon" | "Yandexmarket" | "Uzum";

interface Store {
  id: string;
  marketplace: Marketplace;
  name: string;
  apiKey: string;
  isSelected?: boolean;
  stats?: WildberriesResponse;
  lastFetchDate?: string;
}

const marketplaces: Marketplace[] = ["Wildberries", "Ozon", "Yandexmarket", "Uzum"];

const STORES_STORAGE_KEY = 'marketplace_stores';
const STATS_STORAGE_KEY = 'marketplace_stats';

export default function Stores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [newStore, setNewStore] = useState<Partial<Store>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load stores from localStorage on component mount
  useEffect(() => {
    const savedStores = localStorage.getItem(STORES_STORAGE_KEY);
    if (savedStores) {
      setStores(JSON.parse(savedStores));
    }
  }, []);

  // Save stores to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(stores));
  }, [stores]);

  const getLastWeekDateRange = () => {
    const now = new Date();
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);
    return { from: lastWeek, to: now };
  };

  const fetchStoreStats = async (store: Store) => {
    if (store.marketplace === "Wildberries") {
      try {
        const { from, to } = getLastWeekDateRange();
        const stats = await fetchWildberriesStats(store.apiKey, from, to);
        
        // Save stats to localStorage
        const statsData = {
          storeId: store.id,
          dateFrom: from.toISOString(),
          dateTo: to.toISOString(),
          stats: stats
        };
        
        localStorage.setItem(`${STATS_STORAGE_KEY}_${store.id}`, JSON.stringify(statsData));
        
        return stats;
      } catch (error) {
        console.error('Error fetching store stats:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось получить статистику магазина",
          variant: "destructive",
        });
        return null;
      }
    }
    return null;
  };

  const handleAddStore = async () => {
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
      const store: Store = {
        id: Date.now().toString(),
        marketplace: newStore.marketplace as Marketplace,
        name: newStore.name,
        apiKey: newStore.apiKey,
        isSelected: false,
        lastFetchDate: new Date().toISOString()
      };

      // Fetch initial stats for the store
      const stats = await fetchStoreStats(store);
      if (stats) {
        store.stats = stats;
      }

      setStores([...stores, store]);
      setNewStore({});
      setIsOpen(false);
      toast({
        title: "Успешно",
        description: "Магазин успешно добавлен",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить магазин",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStoreSelection = (storeId: string) => {
    setStores(stores.map(store => ({
      ...store,
      isSelected: store.id === storeId ? !store.isSelected : false
    })));
  };

  const refreshStoreStats = async (store: Store) => {
    setIsLoading(true);
    try {
      const stats = await fetchStoreStats(store);
      if (stats) {
        setStores(stores.map(s => 
          s.id === store.id ? { ...s, stats } : s
        ));
        toast({
          title: "Успешно",
          description: "Статистика магазина обновлена",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статистику",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Магазины</h2>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить магазин
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить новый магазин</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="marketplace">Маркетплейс</Label>
                <Select
                  value={newStore.marketplace}
                  onValueChange={(value: Marketplace) =>
                    setNewStore({ ...newStore, marketplace: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите маркетплейс" />
                  </SelectTrigger>
                  <SelectContent>
                    {marketplaces.map((marketplace) => (
                      <SelectItem key={marketplace} value={marketplace}>
                        {marketplace}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Название магазина</Label>
                <Input
                  id="name"
                  value={newStore.name || ""}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                  placeholder="Введите название магазина"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API ключ</Label>
                <Input
                  id="apiKey"
                  value={newStore.apiKey || ""}
                  onChange={(e) => setNewStore({ ...newStore, apiKey: e.target.value })}
                  type="password"
                  placeholder="Введите API ключ"
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleAddStore}
                disabled={isLoading}
              >
                {isLoading ? "Добавление..." : "Добавить"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
            <Card key={store.id} className={store.isSelected ? "border-primary" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-medium">{store.name}</CardTitle>
                  <Checkbox
                    checked={store.isSelected}
                    onCheckedChange={() => toggleStoreSelection(store.id)}
                    className="mt-1"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Маркетплейс:</span>
                    <span className="font-medium">{store.marketplace}</span>
                  </div>
                  {store.stats && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Продажи:</span>
                        <span className="font-medium">{store.stats.currentPeriod.sales.toLocaleString()} ₽</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Перечислено:</span>
                        <span className="font-medium">{store.stats.currentPeriod.transferred.toLocaleString()} ₽</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Расходы:</span>
                        <span className="font-medium">{store.stats.currentPeriod.expenses.total.toLocaleString()} ₽</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Чистая прибыль:</span>
                        <span className="font-medium">{store.stats.currentPeriod.netProfit.toLocaleString()} ₽</span>
                      </div>
                    </>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => refreshStoreStats(store)}
                    disabled={isLoading}
                  >
                    Обновить статистику
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}