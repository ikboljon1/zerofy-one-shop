
import { Store } from "@/types/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, RefreshCw } from "lucide-react";
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
  canDelete = true // Default to true to allow deleting invalid stores
}: StoreCardProps) {
  // Add a function to handle selection changes with additional side effects
  const handleSelectionChange = () => {
    // Only allow selecting a store, not deselecting it
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
              disabled={false} // Never disable delete button
              title="Удалить магазин"
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
          {store.stats ? (
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
                <span className="font-medium">{formatCurrency(store.stats.currentPeriod.netProfit)}</span>
              </div>
            </>
          ) : (
            <div className="py-2 text-center text-amber-500">
              <p>Нет данных статистики.</p>
              <p className="text-xs mt-1">Возможно, API ключ неверный или истек срок его действия.</p>
            </div>
          )}
          <Button 
            variant="outline" 
            className="w-full mt-4 flex items-center justify-center gap-2"
            onClick={() => onRefreshStats(store)}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            Обновить статистику
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
