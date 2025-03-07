
import { Store } from "@/types/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

interface StoreCardProps {
  store: Store;
  onToggleSelection: (id: string) => void;
  onDelete: (id: string) => void;
  onRefreshStats: (store: Store) => void;
  isLoading: boolean;
}

export function StoreCard({ 
  store, 
  onToggleSelection, 
  onDelete, 
  onRefreshStats,
  isLoading 
}: StoreCardProps) {
  // Calculate net profit correctly considering deductions might be positive or negative
  const netProfit = store.stats?.currentPeriod.netProfit || 0;
  
  // Check if there are deductions to display
  const hasDeductions = store.stats?.currentPeriod.expenses.deductions !== undefined;
  const deductionsAmount = store.stats?.currentPeriod.expenses.deductions || 0;
  const isDeductionsPositive = deductionsAmount >= 0;
  const deductionsLabel = isDeductionsPositive ? "Удержания:" : "Компенсации:";
  
  return (
    <Card className={store.isSelected ? "border-primary" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{store.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={store.isSelected}
              onCheckedChange={() => onToggleSelection(store.id)}
              className="mt-1"
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive/90"
              onClick={() => onDelete(store.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Маркетплейс:</span>
            <span className="font-medium">{store.marketplace}</span>
          </div>
          {store.stats && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Продажи:</span>
                <span className="font-medium">{formatCurrency(store.stats.currentPeriod.sales)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Перечислено:</span>
                <span className="font-medium">{formatCurrency(store.stats.currentPeriod.transferred)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Расходы:</span>
                <span className="font-medium">{formatCurrency(store.stats.currentPeriod.expenses.total)}</span>
              </div>
              {hasDeductions && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{deductionsLabel}</span>
                  <span className={`font-medium ${isDeductionsPositive ? "" : "text-green-600"}`}>
                    {formatCurrency(Math.abs(deductionsAmount))}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Чистая прибыль:</span>
                <span className={`font-medium ${netProfit >= 0 ? "" : "text-destructive"}`}>
                  {formatCurrency(netProfit)}
                </span>
              </div>
            </>
          )}
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => onRefreshStats(store)}
            disabled={isLoading}
          >
            Обновить статистику
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
