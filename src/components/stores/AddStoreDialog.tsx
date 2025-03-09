
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewStore, marketplaces } from "@/types/store";
import { PlusCircle, ShoppingBag, AlertTriangle, Package2, Clock, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { fetchWildberriesStats } from "@/services/wildberriesApi";

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
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStoreName("");
      setMarketplace("Wildberries");
      setApiKey("");
      setValidationError(null);
    }
  }, [isOpen]);

  const validateApiKey = async () => {
    if (!apiKey) {
      setValidationError("API ключ не может быть пустым");
      return false;
    }
    
    setIsValidating(true);
    setValidationError(null);
    
    try {
      // Get dates for API call
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      // Direct call to validate the API key with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const result = await fetchWildberriesStats(apiKey, weekAgo, today, controller.signal);
      clearTimeout(timeoutId);
      
      setIsValidating(false);
      
      // Robust check to ensure the API key is valid and returned the expected structure
      if (result && 
          result.currentPeriod && 
          typeof result.currentPeriod.sales === 'number' &&
          result.dailySales && 
          Array.isArray(result.dailySales)) {
        console.log("API key validation successful:", result);
        return true;
      } else {
        console.log("API key validation failed - invalid response structure:", result);
        setValidationError("Не удалось получить корректные данные с API. Проверьте ключ и попробуйте снова.");
        return false;
      }
    } catch (error) {
      console.error("Ошибка при валидации API ключа:", error);
      setValidationError("Неверный API ключ или сервер не отвечает. Пожалуйста, проверьте и попробуйте снова.");
      setIsValidating(false);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storeName || !marketplace || !apiKey) {
      setValidationError("Пожалуйста, заполните все поля");
      return;
    }
    
    // Validate API key before adding store
    setIsValidating(true);
    const isValid = await validateApiKey();
    setIsValidating(false);
    
    if (!isValid) {
      console.log("API key validation failed, not adding store");
      return;
    }
    
    console.log("API key validation passed, adding store");
    onAddStore({
      name: storeName,
      marketplace: marketplace as any,
      apiKey,
      isValid: true,
    });
    
    // Reset form
    setStoreName("");
    setApiKey("");
    setValidationError(null);
  };

  const resetForm = () => {
    setStoreName("");
    setMarketplace("Wildberries");
    setApiKey("");
    setValidationError(null);
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
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Введите API ключ"
              />
              {validationError && (
                <Alert variant="destructive" className="mt-2 py-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {validationError}
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            {!isLoading && !isValidating && (
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
                disabled={isLoading || isValidating || !storeName || !marketplace || !apiKey}
              >
                {isLoading || isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isValidating ? "Проверка..." : "Добавление..."}
                  </>
                ) : "Добавить"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
