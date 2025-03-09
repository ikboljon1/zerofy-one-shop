
import { Store } from "@/types/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { Badge } from "@/components/ui/badge";

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
  // Add a function to handle selection changes with additional side effects
  const handleSelectionChange = () => {
    // Only allow selecting a store, not deselecting it
    // This ensures the checkbox stays checked until another store is selected
    if (!store.isSelected) {
      // Call the parent component's toggle selection handler
      onToggleSelection(store.id);
      
      // Also trigger a refresh of stats
      setTimeout(() => {
        onRefreshStats(store);
      }, 100);
      
      // Notify other components about the store selection change
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

  // Check if this store has valid stats
  const hasValidStats = store.stats && Object.keys(store.stats).length > 0;

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
        {store.isValidated === false && (
          <Badge variant="outline" className="bg-red-950/20 text-red-400 border-red-800 mt-1">
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span>Неверный API ключ</span>
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Маркетплейс:</span>
            <span className="font-medium">{store.marketplace}</span>
          </div>
          {hasValidStats && store.stats && (
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
                <span className="font-medium">
                  {formatCurrency(
                    store.stats.currentPeriod.netProfit !== undefined
                      ? store.stats.currentPeriod.netProfit
                      : store.stats.currentPeriod.profit
                  )}
                </span>
              </div>
            </>
          )}
          {!hasValidStats && (
            <div className="text-center text-muted-foreground py-2">
              <p>Нет данных о продажах</p>
              <p className="text-xs mt-1">Обновите статистику для получения данных</p>
            </div>
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
