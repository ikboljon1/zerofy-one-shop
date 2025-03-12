
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
  // Modified the handleSelectionChange function to prevent redundant selections
  const handleSelectionChange = () => {
    // Only allow selecting a store, not deselecting it
    // This ensures the checkbox stays checked until another store is selected
    if (!store.isSelected) {
      // Call the parent component's toggle selection handler
      onToggleSelection(store.id);
      
      // Dispatch selection event only when we're actually changing the selection
      window.dispatchEvent(new CustomEvent('store-selection-changed', { 
        detail: { storeId: store.id, selected: true, timestamp: Date.now() } 
      }));
      
      // Save this selection to localStorage with timestamp to help with persistence
      localStorage.setItem('last_selected_store', JSON.stringify({
        storeId: store.id,
        timestamp: Date.now()
      }));
    }
  };
  
  // Create a separate handler for refreshing stats without triggering reselection
  const handleRefreshStats = () => {
    onRefreshStats(store);
  };

  // Рассчитываем чистую прибыль с учетом себестоимости (если она указана)
  const calculateNetProfit = () => {
    if (!store.stats) return 0;
    
    const { sales, expenses } = store.stats.currentPeriod;
    
    // Fix: Get costPrice data from localStorage if it exists
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
    
    return sales - expenses.total - costPrice;
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
