
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
import { NewStore, marketplaces, Marketplace } from "@/types/store";

interface AddStoreDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStore: (store: NewStore) => void;
}

export function AddStoreDialog({ isOpen, isLoading, onOpenChange, onAddStore }: AddStoreDialogProps) {
  const [newStore, setNewStore] = useState<NewStore>({});

  const handleSubmit = () => {
    onAddStore(newStore);
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          setNewStore({});
        }
      }}
    >
      <DialogTrigger asChild>
        <Button disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить магазин
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить новый магазин</DialogTitle>
          <DialogDescription>
            Заполните информацию о магазине ниже.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="marketplace">Маркетплейс</Label>
            <Select
              value={newStore.marketplace}
              onValueChange={(value: Marketplace) =>
                setNewStore(prev => ({ ...prev, marketplace: value }))
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
              onChange={(e) => setNewStore(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Введите название магазина"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API ключ</Label>
            <Input
              id="apiKey"
              value={newStore.apiKey || ""}
              onChange={(e) => setNewStore(prev => ({ ...prev, apiKey: e.target.value }))}
              type="password"
              placeholder="Введите API ключ"
            />
          </div>
          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Добавление..." : "Добавить"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

