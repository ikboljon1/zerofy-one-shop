import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface CalculatorModalProps {
  open: boolean;
  onClose: () => void;
}

const CalculatorModal = ({ open, onClose }: CalculatorModalProps) => {
  const [costPrice, setCostPrice] = useState("");
  const [targetProfit, setTargetProfit] = useState("");
  const [result, setResult] = useState<{
    minPrice: number;
    profit: number;
    profitPercent: number;
  } | null>(null);
  const { toast } = useToast();

  const calculate = () => {
    const cost = parseFloat(costPrice);
    const profit = parseFloat(targetProfit);

    if (isNaN(cost) || isNaN(profit)) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите корректные значения",
        variant: "destructive",
      });
      return;
    }

    const minPrice = cost / (1 - profit / 100);
    const profitAmount = minPrice - cost;
    const profitPercent = (profitAmount / minPrice) * 100;

    setResult({
      minPrice,
      profit: profitAmount,
      profitPercent,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
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
              placeholder="Введите цену"
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
          <Button onClick={calculate} className="w-full">
            Рассчитать
          </Button>
          {result && (
            <div className="rounded-lg bg-secondary p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Мин. Цена</p>
                  <p className="text-lg font-semibold">
                    {result.minPrice.toFixed(2)} руб
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Прибыль</p>
                  <p className="text-lg font-semibold">
                    {result.profit.toFixed(2)} руб
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Процент прибыли</p>
                  <p className="text-lg font-semibold">
                    {result.profitPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalculatorModal;