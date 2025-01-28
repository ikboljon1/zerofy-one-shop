import { useState } from "react";
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

type Marketplace = "Wildberries" | "Ozon" | "Yandexmarket" | "Uzum";

interface Store {
  id: string;
  marketplace: Marketplace;
  name: string;
  apiKey: string;
}

const marketplaces: Marketplace[] = ["Wildberries", "Ozon", "Yandexmarket", "Uzum"];

export default function Stores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [newStore, setNewStore] = useState<Partial<Store>>({});
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleAddStore = () => {
    if (!newStore.marketplace || !newStore.name || !newStore.apiKey) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }

    const store: Store = {
      id: Date.now().toString(),
      marketplace: newStore.marketplace as Marketplace,
      name: newStore.name,
      apiKey: newStore.apiKey,
    };

    setStores([...stores, store]);
    setNewStore({});
    setIsOpen(false);
    toast({
      title: "Успешно",
      description: "Магазин успешно добавлен",
    });
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
            <Button>
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
              <Button className="w-full" onClick={handleAddStore}>
                Добавить
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
            <Card key={store.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">{store.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Маркетплейс:</span>
                    <span className="font-medium">{store.marketplace}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">API ключ:</span>
                    <span className="font-medium">••••••••</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}