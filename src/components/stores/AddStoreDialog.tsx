
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
  DialogFooter,
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
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { canAddStore, incrementStoreCount, getSubscriptionStatus } from "@/services/userService";

interface AddStoreDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStore: (store: NewStore) => void;
}

export function AddStoreDialog({ isOpen, isLoading, onOpenChange, onAddStore }: AddStoreDialogProps) {
  const [newStore, setNewStore] = useState<NewStore>({});
  const [isCheckingLimit, setIsCheckingLimit] = useState(false);
  const [limitError, setLimitError] = useState<string | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    isActive: boolean;
    daysRemaining: number;
    endDate?: string;
    tariffId?: string;
  } | null>(null);
  const { toast } = useToast();

  // Get current user from localStorage
  const getCurrentUserId = (): string | null => {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    
    try {
      const user = JSON.parse(userData);
      return user.id;
    } catch (e) {
      return null;
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Check store limit when dialog opens
      checkStoreLimit();
    } else {
      // Reset form when closing
      setNewStore({});
      setLimitError(null);
    }
    onOpenChange(open);
  };

  const checkStoreLimit = async () => {
    const userId = getCurrentUserId();
    
    if (!userId) {
      setLimitError("Пользователь не авторизован");
      return;
    }

    setIsCheckingLimit(true);
    try {
      // Get subscription information
      const subscription = await getSubscriptionStatus(userId);
      setSubscriptionInfo(subscription);
      
      const result = await canAddStore(userId);
      
      if (!result.allowed) {
        setLimitError(result.message || "Достигнут лимит магазинов для вашего тарифа");
      } else {
        setLimitError(null);
      }
    } catch (error) {
      console.error("Error checking store limit:", error);
      setLimitError("Не удалось проверить лимит магазинов");
    } finally {
      setIsCheckingLimit(false);
    }
  };

  const handleSubmit = async () => {
    const userId = getCurrentUserId();
    
    if (!userId) {
      toast({
        title: "Ошибка",
        description: "Пользователь не авторизован",
        variant: "destructive",
      });
      return;
    }

    // Check store limit one more time before submitting
    try {
      const limitCheck = await canAddStore(userId);
      
      if (!limitCheck.allowed) {
        setLimitError(limitCheck.message || "Достигнут лимит магазинов для вашего тарифа");
        return;
      }

      // Get subscription information to ensure it's active
      const subscription = await getSubscriptionStatus(userId);
      if (!subscription.isActive) {
        setLimitError("Подписка неактивна. Пожалуйста, обновите тариф");
        return;
      }

      // Update the store count
      await incrementStoreCount(userId);
      
      // Call the original onAddStore
      onAddStore(newStore);
      
      toast({
        title: "Магазин добавлен",
        description: "Магазин успешно добавлен в вашу учетную запись",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить магазин",
        variant: "destructive",
      });
    }
  };

  // Функция для определения, прошел ли минимальный период подписки (1 месяц)
  const hasMinimumSubscriptionPeriodPassed = (): boolean => {
    if (!subscriptionInfo || !subscriptionInfo.endDate) return false;
    
    const subscriptionEndDate = new Date(subscriptionInfo.endDate);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // Если конец подписки более чем через месяц, значит подписка оформлена менее месяца назад
    return subscriptionEndDate.getTime() - oneMonthAgo.getTime() < 0;
  };

  // Подготовка текста ошибки, связанной с минимальным сроком подписки
  const getSubscriptionPeriodErrorText = (): string => {
    if (!subscriptionInfo || !subscriptionInfo.endDate) return "Информация о подписке недоступна";

    const endDate = new Date(subscriptionInfo.endDate);
    const formattedDate = endDate.toLocaleDateString('ru-RU');
    return `Вы не можете удалить магазин до истечения минимального срока подписки. Подписка действует до ${formattedDate}`;
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={handleOpenChange}
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
        
        {limitError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ограничение тарифа</AlertTitle>
            <AlertDescription>
              {limitError}
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-1"
                  onClick={() => window.location.href = '/admin#tariffs'}
                >
                  Обновить тариф
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {subscriptionInfo && !hasMinimumSubscriptionPeriodPassed() && (
          <Alert variant="warning" className="mb-4 bg-yellow-900/30 border-yellow-800/30 text-yellow-300">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertTitle>Важная информация</AlertTitle>
            <AlertDescription>
              Удаление магазинов будет доступно только через 1 месяц после активации тарифа.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="marketplace">Маркетплейс</Label>
            <Select
              value={newStore.marketplace}
              onValueChange={(value: Marketplace) =>
                setNewStore(prev => ({ ...prev, marketplace: value }))
              }
              disabled={!!limitError}
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
              disabled={!!limitError}
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
              disabled={!!limitError}
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button 
              className="w-full" 
              onClick={handleSubmit}
              disabled={isLoading || !!limitError || !newStore.name || !newStore.marketplace}
            >
              {isLoading ? "Добавление..." : "Добавить"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
