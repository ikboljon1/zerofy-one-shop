
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewStore, marketplaces } from "@/types/store";
import { PlusCircle, ShoppingBag, AlertTriangle, Package2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface AddStoreDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStore: (store: NewStore) => void;
  storeCount: number;
  storeLimit: number;
}

export function AddStoreDialog({ 
  isOpen, 
  isLoading, 
  onOpenChange, 
  onAddStore,
  storeCount,
  storeLimit
}: AddStoreDialogProps) {
  const [storeName, setStoreName] = useState("");
  const [marketplace, setMarketplace] = useState<string>("");
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStore({
      name: storeName,
      marketplace: marketplace as any,
      apiKey,
    });
  };

  const resetForm = () => {
    setStoreName("");
    setMarketplace("");
    setApiKey("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const isAtStoreLimit = storeCount >= storeLimit;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2" disabled={isAtStoreLimit}>
          <PlusCircle className="h-4 w-4" />
          <span>Добавить магазин</span>
          {storeCount > 0 && (
            <Badge variant="outline" className="ml-1 bg-blue-950/30 text-blue-400 border-blue-800">
              <span>{storeCount}/{storeLimit}</span>
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <DialogTitle>Добавить новый магазин</DialogTitle>
          </div>
        </DialogHeader>
        
        {isAtStoreLimit && (
          <Alert className="bg-yellow-900/20 border-yellow-800/30 text-yellow-300">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription>
              Вы достигли лимита магазинов ({storeLimit}) для вашего тарифа. Перейдите на более высокий тариф, чтобы добавить больше магазинов.
            </AlertDescription>
          </Alert>
        )}
        
        {!isAtStoreLimit && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="name">Название магазина</Label>
                <Badge variant="outline" className="flex items-center gap-1.5 bg-blue-950/30 text-blue-400 border-blue-800">
                  <Package2 className="h-3.5 w-3.5" />
                  <span>{storeCount}/{storeLimit}</span>
                </Badge>
              </div>
              <Input
                id="name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Введите название магазина"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marketplace">Маркетплейс</Label>
              <Select value={marketplace} onValueChange={setMarketplace}>
                <SelectTrigger id="marketplace">
                  <SelectValue placeholder="Выберите маркетплейс" />
                </SelectTrigger>
                <SelectContent>
                  {marketplaces.map((mp) => (
                    <SelectItem key={mp} value={mp}>
                      {mp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API ключ</Label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Введите API ключ"
              />
            </div>
            
            {!isLoading && (
              <Alert variant="default" className="bg-yellow-900/20 border-yellow-800/30 text-yellow-300">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription>
                  Удаление магазина будет доступно только через 1 месяц после активации тарифа
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-end">
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)} className="mr-2">
                Отмена
              </Button>
              <Button type="submit" disabled={isLoading || !storeName || !marketplace || !apiKey}>
                {isLoading ? "Добавление..." : "Добавить"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
