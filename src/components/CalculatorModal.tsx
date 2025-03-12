import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { fetchWildberriesStats } from "@/services/wildberriesApi";
import { subDays } from "date-fns";
import { Lock } from "lucide-react";
import { Tariff } from "@/data/tariffs";

interface CalculatorModalProps {
  open: boolean;
  onClose: () => void;
  hasAccess?: boolean; // Добавляем проверку доступа к функции
}

interface Expenses {
  logistics: number;
  storage: number;
  penalties: number;
  acceptance: number;
  advertising: number;
  deductions: number;
  price?: number;
}

const CalculatorModal = ({ open, onClose, hasAccess = true }: CalculatorModalProps) => {
  const [costPrice, setCostPrice] = useState("");
  const [targetProfit, setTargetProfit] = useState("");
  const [expenses, setExpenses] = useState<Expenses>({
    logistics: 0,
    storage: 0,
    penalties: 0,
    acceptance: 0,
    advertising: 0,
    deductions: 0,
    price: 0
  });
  const [result, setResult] = useState<{
    minPrice: number;
    profit: number;
    profitPercent: number;
    totalExpenses: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Если нет доступа к калькулятору, показываем только уведомление о необходимости обновления тарифа
  if (!hasAccess) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Калькулятор минимальной цены</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Функция недоступна</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Калькулятор расходов доступен на тарифе "Базовый" и выше. 
              Обновите свой тарифный план для доступа к этой функции.
            </p>
            <Button onClick={onClose}>Закрыть</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  useEffect(() => {
    if (open) {
      fetchHighestExpenses();
    }
  }, [open]);

  const fetchHighestExpenses = async () => {
    setIsLoading(true);
    try {
      // Fetch data from API - use a 30-day period for significant data
      const dateFrom = subDays(new Date(), 30);
      const dateTo = new Date();
      
      // Get all stores from localStorage
      const allStores = Object.keys(localStorage)
        .filter(key => key.startsWith('marketplace_stores'))
        .map(key => JSON.parse(localStorage.getItem(key) || '[]'))
        .flat();
      
      const selectedStore = allStores.find((store: any) => store.isSelected);
      
      if (!selectedStore) {
        toast({
          title: "Внимание",
          description: "Выберите основной магазин в разделе 'Магазины'",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Fetch stats from API 
      const statsData = await fetchWildberriesStats(selectedStore.apiKey, dateFrom, dateTo);
      
      if (statsData) {
        // Find the highest expenses across all products
        let maxLogistics = 0;
        let maxStorage = 0;
        let maxPenalties = 0;
        let maxAcceptance = 0;
        let maxAdvertising = 0;
        let maxDeductions = 0;
        let productWithHighestTotal = null;
        let maxTotalExpenses = 0;
        
        // Process products from all stores
        const allStores = Object.keys(localStorage).filter(key => key.startsWith('products_'));
        
        allStores.forEach(storeKey => {
          const products = JSON.parse(localStorage.getItem(storeKey) || '[]');
          
          products.forEach((product: any) => {
            if (product.expenses) {
              const logistics = product.expenses.logistics || 0;
              const storage = product.expenses.storage || 0;
              const penalties = product.expenses.penalties || 0;
              const acceptance = product.expenses.acceptance || 0;
              const advertising = product.expenses.advertising || 0;
              const deductions = product.expenses.deductions || 0;
              
              // Update maximum values for each expense type
              maxLogistics = Math.max(maxLogistics, logistics);
              maxStorage = Math.max(maxStorage, storage);
              maxPenalties = Math.max(maxPenalties, penalties);
              maxAcceptance = Math.max(maxAcceptance, acceptance);
              maxAdvertising = Math.max(maxAdvertising, advertising);
              maxDeductions = Math.max(maxDeductions, deductions);
              
              // Track product with highest total expenses for cost price
              const totalExpenses = logistics + storage + penalties + acceptance + advertising + deductions;
              if (totalExpenses > maxTotalExpenses) {
                maxTotalExpenses = totalExpenses;
                productWithHighestTotal = product;
              }
            }
          });
        });
        
        // Also check analytics data for highest values
        if (statsData.currentPeriod && statsData.currentPeriod.expenses) {
          maxLogistics = Math.max(maxLogistics, statsData.currentPeriod.expenses.logistics || 0);
          maxStorage = Math.max(maxStorage, statsData.currentPeriod.expenses.storage || 0);
          maxPenalties = Math.max(maxPenalties, statsData.currentPeriod.expenses.penalties || 0);
          maxAcceptance = Math.max(maxAcceptance, statsData.currentPeriod.expenses.acceptance || 0);
          maxAdvertising = Math.max(maxAdvertising, statsData.currentPeriod.expenses.advertising || 0);
          maxDeductions = Math.max(maxDeductions, statsData.currentPeriod.expenses.deductions || 0);
        }
        
        // Update expenses state with highest values
        setExpenses({
          logistics: maxLogistics,
          storage: maxStorage,
          penalties: maxPenalties,
          acceptance: maxAcceptance,
          advertising: maxAdvertising,
          deductions: maxDeductions,
          price: productWithHighestTotal?.price || 0
        });
        
        // Set cost price from the product with highest expenses
        if (productWithHighestTotal) {
          setCostPrice(productWithHighestTotal.costPrice?.toString() || "0");
        }
        
        console.log('Highest expenses found:', {
          logistics: maxLogistics,
          storage: maxStorage,
          penalties: maxPenalties,
          acceptance: maxAcceptance,
          advertising: maxAdvertising,
          deductions: maxDeductions
        });
      }
    } catch (error) {
      console.error('Error fetching highest expenses:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные о расходах",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculate = () => {
    const cost = parseFloat(costPrice);
    const profit = parseFloat(targetProfit);
    
    // Calculate total expenses
    const totalExpenses = 
      expenses.logistics +
      expenses.storage +
      expenses.penalties +
      expenses.acceptance +
      expenses.advertising +
      expenses.deductions;

    if (isNaN(cost) || isNaN(profit)) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите корректные значения",
        variant: "destructive",
      });
      return;
    }

    // Calculate minimum price considering all expenses and desired profit margin
    const totalCost = cost + totalExpenses;
    const minPrice = totalCost / (1 - profit / 100);
    const profitAmount = minPrice - totalCost;
    const profitPercent = (profitAmount / minPrice) * 100;

    setResult({
      minPrice,
      profit: profitAmount,
      profitPercent,
      totalExpenses
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Калькулятор минимальной цены</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm">Себестоимость:</label>
            <Input
              type="number"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="Введите себестоимость"
            />
          </div>
          <div>
            <label className="text-sm">Желаемая прибыль (%):</label>
            <Input
              type="number"
              value={targetProfit}
              onChange={(e) => setTargetProfit(e.target.value)}
              placeholder="Введите %"
            />
          </div>
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Максимальные расходы:</h3>
            <div className="space-y-2">
              {expenses.price !== undefined && expenses.price > 0 && (
                <div className="flex justify-between">
                  <span>Цена товара:</span>
                  <span>{expenses.price.toFixed(2)} ₽</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Логистика:</span>
                <span>{expenses.logistics.toFixed(2)} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Хранение:</span>
                <span>{expenses.storage.toFixed(2)} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Штрафы:</span>
                <span>{expenses.penalties.toFixed(2)} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Приемка:</span>
                <span>{expenses.acceptance.toFixed(2)} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Реклама:</span>
                <span>{expenses.advertising.toFixed(2)} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Удержания:</span>
                <span>{expenses.deductions.toFixed(2)} ₽</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2">
                <span>Всего расходов:</span>
                <span>{(
                  expenses.logistics + 
                  expenses.storage + 
                  expenses.penalties + 
                  expenses.acceptance + 
                  expenses.advertising + 
                  expenses.deductions
                ).toFixed(2)} ₽</span>
              </div>
            </div>
          </Card>
          <Button onClick={calculate} className="w-full">
            Рассчитать
          </Button>
          {result && (
            <Card className="p-4">
              <div className="grid gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Мин. цена продажи</p>
                  <p className="text-lg font-semibold">{result.minPrice.toFixed(2)} ₽</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Чистая прибыль</p>
                  <p className="text-lg font-semibold">{result.profit.toFixed(2)} ₽</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Рентабельность</p>
                  <p className="text-lg font-semibold">{result.profitPercent.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Общие расходы</p>
                  <p className="text-lg font-semibold">{result.totalExpenses.toFixed(2)} ₽</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalculatorModal;
