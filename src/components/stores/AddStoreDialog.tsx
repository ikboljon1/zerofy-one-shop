
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewStore, marketplaces } from "@/types/store";
import { PlusCircle, ShoppingBag, AlertTriangle, Package2, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { validateApiKey } from "@/utils/storeUtils";

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
  const [marketplace, setMarketplace] = useState<string>("Wildberries");
  const [apiKey, setApiKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [apiKeyValidated, setApiKeyValidated] = useState<boolean | null>(null);
  const [apiKeyMessage, setApiKeyMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setMarketplace("Wildberries");
      resetValidation();
    }
  }, [isOpen]);

  const resetValidation = () => {
    setApiKeyValidated(null);
    setApiKeyMessage("");
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    resetValidation();
  };

  const validateKey = async () => {
    if (!apiKey) {
      setApiKeyMessage("Пожалуйста, введите API ключ");
      return;
    }

    setIsValidating(true);
    setApiKeyMessage("Проверка API ключа...");
    
    try {
      const isValid = await validateApiKey(marketplace, apiKey);
      setApiKeyValidated(isValid);
      
      if (isValid) {
        setApiKeyMessage("API ключ действителен");
      } else {
        setApiKeyMessage("Недействительный API ключ. Пожалуйста, проверьте и попробуйте снова.");
      }
    } catch (error) {
      setApiKeyValidated(false);
      setApiKeyMessage("Ошибка при проверке API ключа");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKeyValidated) {
      validateKey();
      return;
    }
    
    onAddStore({
      name: storeName,
      marketplace: marketplace as any,
      apiKey,
    });
  };

  const resetForm = () => {
    setStoreName("");
    setMarketplace("Wildberries");
    setApiKey("");
    resetValidation();
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
                  <SelectItem key="Wildberries" value="Wildberries">
                    Wildberries
                  </SelectItem>
                  
                  {marketplaces.filter(mp => mp !== "Wildberries").map((mp) => (
                    <SelectItem key={mp} value={mp} disabled className="opacity-60 cursor-not-allowed">
                      <div className="flex items-center gap-1.5">
                        <span>{mp}</span>
                        <Badge variant="outline" className="ml-1 px-1.5 py-0 h-5 bg-amber-950/20 text-amber-300 border-amber-800/50 text-xs flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>скоро</span>
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API ключ</Label>
              <div className="space-y-2">
                <Input
                  id="apiKey"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  placeholder="Введите API ключ"
                  className={apiKeyValidated === true ? "border-green-500" : apiKeyValidated === false ? "border-red-500" : ""}
                />
                <div className="flex justify-between">
                  {apiKeyMessage && (
                    <div className={`text-sm flex items-center gap-1.5 ${
                      apiKeyValidated === true ? "text-green-500" : 
                      apiKeyValidated === false ? "text-red-500" : 
                      "text-muted-foreground"
                    }`}>
                      {apiKeyValidated === true && <CheckCircle2 className="h-4 w-4" />}
                      {apiKeyValidated === false && <AlertCircle className="h-4 w-4" />}
                      <span>{apiKeyMessage}</span>
                    </div>
                  )}
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={validateKey}
                    disabled={isValidating || !apiKey}
                    className="ml-auto"
                  >
                    {isValidating ? "Проверка..." : "Проверить"}
                  </Button>
                </div>
              </div>
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
              <Button 
                type="submit" 
                disabled={isLoading || !storeName || !marketplace || !apiKey || isValidating || (apiKey.length > 0 && apiKeyValidated !== true)}
              >
                {isLoading ? "Добавление..." : apiKeyValidated === null && apiKey ? "Проверить и добавить" : "Добавить"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
