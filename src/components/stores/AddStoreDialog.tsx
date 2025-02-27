
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewStore } from "@/types/store";

// Определяем доступные маркетплейсы
const marketplaces = ["Wildberries", "Ozon", "Yandex.Market"];

interface AddStoreDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStore: (store: NewStore) => void;
}

export function AddStoreDialog({ isOpen, isLoading, onOpenChange, onAddStore }: AddStoreDialogProps) {
  const [newStore, setNewStore] = useState<NewStore>({
    name: "",
    marketplace: "",
    apiKey: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStore(newStore);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStore({ ...newStore, [name]: value });
  };

  const handleMarketplaceChange = (value: string) => {
    setNewStore({ ...newStore, marketplace: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Добавить магазин
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить магазин</DialogTitle>
          <DialogDescription>
            Введите данные вашего магазина для подключения.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название магазина</Label>
              <Input
                id="name"
                name="name"
                value={newStore.name}
                onChange={handleInputChange}
                placeholder="Введите название магазина"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="marketplace">Маркетплейс</Label>
              <Select
                value={newStore.marketplace}
                onValueChange={handleMarketplaceChange}
              >
                <SelectTrigger id="marketplace">
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
              <Label htmlFor="apiKey">API ключ</Label>
              <Input
                id="apiKey"
                name="apiKey"
                value={newStore.apiKey}
                onChange={handleInputChange}
                placeholder="Введите API ключ"
                required
              />
              <p className="text-xs text-muted-foreground">
                API ключ можно получить в личном кабинете маркетплейса.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Добавление..." : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
