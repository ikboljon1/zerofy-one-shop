
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

interface CalculatorModalProps {
  open: boolean;
  onClose: () => void;
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

const CalculatorModal = ({ open, onClose }: CalculatorModalProps) => {
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

  useEffect(() => {
    if (open) {
      fetchAverageExpenses();
    }
  }, [open]);

  const fetchAverageExpenses = async () => {
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
        // Находим средние значения расходов для всех товаров
        let totalLogistics = 0;
        let totalStorage = 0;
        let totalPenalties = 0;
        let totalAcceptance = 0;
        let totalAdvertising = 0;
        let totalDeductions = 0;
        let totalPrice = 0;
        let productCount = 0;
        let productWithHighestSales = null;
        let maxSales = 0;
        
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
              
              // Суммируем расходы для последующего вычисления среднего
              totalLogistics += logistics;
              totalStorage += storage;
              totalPenalties += penalties;
              totalAcceptance += acceptance;
              totalAdvertising += advertising;
              totalDeductions += deductions;
              
              if (product.price) {
                totalPrice += product.price;
              }
              
              productCount++;
              
              // Отслеживаем товар с наибольшими продажами для определения себестоимости
              const sales = product.quantity || 0;
              if (sales > maxSales) {
                maxSales = sales;
                productWithHighestSales = product;
              }
            }
          });
        });
        
        // Вычисляем средние значения
        const avgLogistics = productCount > 0 ? totalLogistics / productCount : 0;
        const avgStorage = productCount > 0 ? totalStorage / productCount : 0;
        const avgPenalties = productCount > 0 ? totalPenalties / productCount : 0;
        const avgAcceptance = productCount > 0 ? totalAcceptance / productCount : 0;
        const avgAdvertising = productCount > 0 ? totalAdvertising / productCount : 0;
        const avgDeductions = productCount > 0 ? totalDeductions / productCount : 0;
        const avgPrice = productCount > 0 ? totalPrice / productCount : 0;
        
        // Update expenses state with average values
        setExpenses({
          logistics: avgLogistics,
          storage: avgStorage,
          penalties: avgPenalties,
          acceptance: avgAcceptance,
          advertising: avgAdvertising,
          deductions: avgDeductions,
          price: avgPrice
        });
        
        // Set cost price from the product with highest sales
        if (productWithHighestSales) {
          setCostPrice(productWithHighestSales.costPrice?.toString() || "0");
        }
        
        console.log('Average expenses calculated:', {
          logistics: avgLogistics,
          storage: avgStorage,
          penalties: avgPenalties,
          acceptance: avgAcceptance,
          advertising: avgAdvertising,
          deductions: avgDeductions,
          productCount: productCount
        });
      }
    } catch (error) {
      console.error('Error fetching average expenses:', error);
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
            <h3 className="text-sm font-medium mb-2">Средние расходы:</h3>
            <div className="space-y-2">
              {expenses.price !== undefined && expenses.price > 0 && (
                <div className="flex justify-between">
                  <span>Ср. цена товара:</span>
                  <span>{expenses.price.toFixed(2)} ₽</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Ср. логистика:</span>
                <span>{expenses.logistics.toFixed(2)} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Ср. хранение:</span>
                <span>{expenses.storage.toFixed(2)} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Ср. штрафы:</span>
                <span>{expenses.penalties.toFixed(2)} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Ср. приемка:</span>
                <span>{expenses.acceptance.toFixed(2)} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Ср. реклама:</span>
                <span>{expenses.advertising.toFixed(2)} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Ср. удержания:</span>
                <span>{expenses.deductions.toFixed(2)} ₽</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2">
                <span>Всего ср. расходов:</span>
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
