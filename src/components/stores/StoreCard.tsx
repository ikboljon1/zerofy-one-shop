
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
  canDelete?: boolean;
}

export function StoreCard({ 
  store, 
  onToggleSelection, 
  onDelete, 
  onRefreshStats,
  isLoading,
  canDelete = true
}: StoreCardProps) {
  const handleSelectionChange = () => {
    if (!store.isSelected) {
      onToggleSelection(store.id);
    }
  };

  const handleRefreshStats = () => {
    onRefreshStats(store);
  };

  const calculateNetProfit = () => {
    if (!store.stats) return 0;
    
    const { transferred, expenses, returnsAmount = 0 } = store.stats.currentPeriod;
    
    let costPrice = 0;
    try {
      const costPriceData = localStorage.getItem(`costPriceMetrics_${store.id}`);
      if (costPriceData) {
        const parsedData = JSON.parse(costPriceData);
        costPrice = parsedData.totalCostPrice || 0;
      }
    } catch (error) {
      console.error("Error parsing cost price data:", error);
    }
    
    return transferred - expenses.total - costPrice - returnsAmount;
  };

  return (
    <Card className={store.isSelected ? "border-primary" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{store.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={store.isSelected}
              onCheckedChange={handleSelectionChange}
              className="mt-1"
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive/90"
              onClick={() => onDelete(store.id)}
              disabled={!canDelete}
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Возвраты:</span>
                <span className="font-medium">{formatCurrency(store.stats.currentPeriod.returnsAmount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Чистая прибыль:</span>
                <span className="font-medium">{formatCurrency(calculateNetProfit())}</span>
              </div>
            </>
          )}
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={handleRefreshStats}
            disabled={isLoading}
          >
            Обновить статистику
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
