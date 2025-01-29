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

interface CalculatorModalProps {
  open: boolean;
  onClose: () => void;
}

interface Expenses {
  logistics: number;
  storage: number;
  penalties: number;
  acceptance: number;
}

const CalculatorModal = ({ open, onClose }: CalculatorModalProps) => {
  const [costPrice, setCostPrice] = useState("");
  const [targetProfit, setTargetProfit] = useState("");
  const [expenses, setExpenses] = useState<Expenses>({
    logistics: 0,
    storage: 0,
    penalties: 0,
    acceptance: 0
  });
  const [result, setResult] = useState<{
    minPrice: number;
    profit: number;
    profitPercent: number;
    totalExpenses: number;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Находим продукт с наибольшими расходами из localStorage
    const findProductWithHighestExpenses = () => {
      const allStores = Object.keys(localStorage).filter(key => key.startsWith('products_'));
      let maxExpenses = 0;
      let productWithMaxExpenses = null;

      allStores.forEach(storeKey => {
        const products = JSON.parse(localStorage.getItem(storeKey) || '[]');
        products.forEach((product: any) => {
          if (product.expenses) {
            const totalExpenses = 
              product.expenses.logistics +
              product.expenses.storage +
              product.expenses.penalties +
              product.expenses.acceptance;
            
            if (totalExpenses > maxExpenses) {
              maxExpenses = totalExpenses;
              productWithMaxExpenses = product;
            }
          }
        });
      });

      if (productWithMaxExpenses) {
        setCostPrice(productWithMaxExpenses.costPrice?.toString() || "0");
        setExpenses(productWithMaxExpenses.expenses);
      }
    };

    if (open) {
      findProductWithHighestExpenses();
    }
  }, [open]);

  const calculate = () => {
    const cost = parseFloat(costPrice);
    const profit = parseFloat(targetProfit);
    const totalExpenses = 
      expenses.logistics +
      expenses.storage +
      expenses.penalties +
      expenses.acceptance;

    if (isNaN(cost) || isNaN(profit)) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите корректные значения",
        variant: "destructive",
      });
      return;
    }

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
            <h3 className="text-sm font-medium mb-2">Дополнительные расходы:</h3>
            <div className="space-y-2">
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
              <div className="flex justify-between font-medium border-t pt-2">
                <span>Всего расходов:</span>
                <span>{(expenses.logistics + expenses.storage + expenses.penalties + expenses.acceptance).toFixed(2)} ₽</span>
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