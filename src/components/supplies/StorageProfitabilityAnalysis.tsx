import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { WarehouseRemainItem, PaidStorageItem } from '@/types/supplies';
import { formatCurrency } from '@/utils/formatCurrency';
import { TrendingDown, TrendingUp, AlertTriangle, Clock, Package, DollarSign, Scissors } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";

interface StorageProfitabilityAnalysisProps {
  warehouseItems: WarehouseRemainItem[];
  paidStorageData: PaidStorageItem[];
  averageDailySalesRate: Record<number, number>;
  dailyStorageCost: Record<number, number>;
}

const StorageProfitabilityAnalysis: React.FC<StorageProfitabilityAnalysisProps> = ({
  warehouseItems,
  paidStorageData,
  averageDailySalesRate,
  dailyStorageCost
}) => {
  const { toast } = useToast();
  const [showAllItems, setShowAllItems] = useState(false);
  
  // Calculate days of stock and profitability metrics
  const itemsWithMetrics = warehouseItems.map(item => {
    const dailySales = averageDailySalesRate[item.nmId] || 0.1; // Default to 0.1 to avoid division by zero
    const storageCost = dailyStorageCost[item.nmId] || 1; // Default to 1 ruble per day
    const daysOfStock = dailySales > 0 ? item.quantityWarehousesFull / dailySales : 999;
    
    // Calculate if the item is in paid storage based on paidStorageData
    const isPaidStorage = paidStorageData.some(paidItem => 
      paidItem.nmId === item.nmId && paidItem.daysOnStock > 60
    );
    
    // Calculate daily profit/loss
    const dailyRevenue = dailySales * (Number(item.price) || 0);
    const dailyProfit = dailyRevenue - (storageCost * item.quantityWarehousesFull);
    
    // Calculate ROI (Return on Inventory Investment)
    const inventoryValue = item.quantityWarehousesFull * (Number(item.price) || 0);
    const monthlyProfit = dailyProfit * 30;
    const roi = inventoryValue > 0 ? (monthlyProfit / inventoryValue) * 100 : 0;
    
    return {
      ...item,
      daysOfStock,
      isPaidStorage,
      dailySales,
      storageCost,
      dailyProfit,
      roi
    };
  });
  
  // Sort items by profitability (most problematic first)
  const sortedItems = [...itemsWithMetrics].sort((a, b) => {
    // First sort by paid storage status
    if (a.isPaidStorage && !b.isPaidStorage) return -1;
    if (!a.isPaidStorage && b.isPaidStorage) return 1;
    
    // Then by days of stock (higher is worse)
    if (a.daysOfStock > b.daysOfStock) return -1;
    if (a.daysOfStock < b.daysOfStock) return 1;
    
    // Then by ROI (lower is worse)
    return a.roi - b.roi;
  });
  
  // Get top problematic items
  const topProblematicItems = sortedItems.slice(0, showAllItems ? sortedItems.length : 10);
  
  // Calculate overall metrics
  const totalItems = warehouseItems.reduce((sum, item) => sum + item.quantityWarehousesFull, 0);
  const totalValue = warehouseItems.reduce((sum, item) => {
    return sum + (item.quantityWarehousesFull * (Number(item.price) || 0));
  }, 0);
  
  const totalPaidStorageItems = paidStorageData.length;
  const totalPaidStorageCost = paidStorageData.reduce((sum, item) => sum + (item.totalStorageCost || 0), 0);
  
  const averageDaysOfStock = itemsWithMetrics.reduce((sum, item) => sum + item.daysOfStock, 0) / itemsWithMetrics.length;
  
  // Calculate items at risk of paid storage (between 45-60 days)
  const itemsAtRiskCount = itemsWithMetrics.filter(item => 
    !item.isPaidStorage && item.daysOfStock >= 45 && item.daysOfStock < 60
  ).length;
  
  // Calculate potential savings from optimizing inventory
  const potentialMonthlySavings = topProblematicItems
    .filter(item => item.isPaidStorage || item.daysOfStock > 60)
    .reduce((sum, item) => {
      const excessStock = item.quantityWarehousesFull - (item.dailySales * 30); // Keep 30 days of stock
      if (excessStock > 0) {
        return sum + (excessStock * item.storageCost * 30); // Monthly savings
      }
      return sum;
    }, 0);
  
  const handleOptimizeInventory = () => {
    toast({
      title: "Оптимизация запасов",
      description: "Функция оптимизации запасов будет доступна в следующем обновлении",
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-green-500" />
          Анализ рентабельности хранения
        </CardTitle>
        <CardDescription>
          Оценка эффективности использования складских запасов и выявление проблемных товаров
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-muted/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Общая стоимость запасов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <div className="text-xs text-muted-foreground">{totalItems.toLocaleString()} единиц товара</div>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Средний запас (дни)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageDaysOfStock.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">
                {averageDaysOfStock > 60 ? (
                  <span className="text-red-500 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" /> Выше нормы
                  </span>
                ) : (
                  <span className="text-green-500 flex items-center">
                    <TrendingDown className="h-3 w-3 mr-1" /> В пределах нормы
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Товары на платном хранении</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPaidStorageItems}</div>
              <div className="text-xs text-muted-foreground">
                {totalPaidStorageCost > 0 ? (
                  <span className="text-red-500">Затраты: {formatCurrency(totalPaidStorageCost)}</span>
                ) : (
                  <span className="text-green-500">Нет затрат на платное хранение</span>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Товары под риском</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{itemsAtRiskCount}</div>
              <div className="text-xs text-muted-foreground flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                Скоро перейдут на платное хранение
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Проблемные товары</h3>
          <Button variant="outline" size="sm" onClick={handleOptimizeInventory}>
            <Scissors className="h-4 w-4 mr-2" />
            Оптимизировать запасы
          </Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Товар</TableHead>
              <TableHead>Бренд</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead className="text-right">Количество</TableHead>
              <TableHead className="text-right">Дней на складе</TableHead>
              <TableHead className="text-right">Продажи/день</TableHead>
              <TableHead className="text-right">Статус</TableHead>
              <TableHead className="text-right">ROI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topProblematicItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{item.vendorCode}</span>
                    <span className="text-xs text-muted-foreground">ID: {item.nmId}</span>
                  </div>
                </TableCell>
                <TableCell>{item.brand}</TableCell>
                <TableCell>{item.subjectName}</TableCell>
                <TableCell className="text-right">{item.quantityWarehousesFull}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span>{item.daysOfStock.toFixed(1)}</span>
                    {item.daysOfStock > 60 && (
                      <Badge variant="destructive" className="ml-1">60+</Badge>
                    )}
                    {item.daysOfStock >= 45 && item.daysOfStock < 60 && (
                      <Badge variant="warning" className="ml-1 bg-amber-500">Риск</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">{item.dailySales.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  {item.isPaidStorage ? (
                    <Badge variant="destructive" className="flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" />
                      Платное
                    </Badge>
                  ) : item.daysOfStock > 60 ? (
                    <Badge variant="destructive" className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Избыток
                    </Badge>
                  ) : item.daysOfStock > 45 ? (
                    <Badge variant="outline" className="flex items-center text-amber-500 border-amber-500">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Внимание
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center text-green-500 border-green-500">
                      <Package className="h-3 w-3 mr-1" />
                      Норма
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end">
                    <span className={item.roi < 0 ? "text-red-500" : "text-green-500"}>
                      {item.roi.toFixed(1)}%
                    </span>
                    <div className="w-16 ml-2">
                      <Progress 
                        value={Math.min(100, Math.max(0, item.roi + 20))} 
                        className={`h-2 ${item.roi < 0 ? "bg-red-200" : "bg-green-200"}`}
                        indicatorClassName={item.roi < 0 ? "bg-red-500" : "bg-green-500"}
                      />
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {sortedItems.length > 10 && (
          <div className="flex justify-center">
            <Button 
              variant="ghost" 
              onClick={() => setShowAllItems(!showAllItems)}
            >
              {showAllItems ? "Показать меньше" : `Показать все (${sortedItems.length})`}
            </Button>
          </div>
        )}
        
        <Card className="bg-muted/50 border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Потенциальная экономия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Ежемесячная экономия при оптимизации запасов:</span>
              <span className="font-bold text-green-500">{formatCurrency(potentialMonthlySavings)}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Оптимизация запасов может снизить затраты на хранение и высвободить оборотные средства.
              Рекомендуется поддерживать запас не более чем на 30-45 дней для большинства товаров.
            </div>
            <div className="pt-2">
              <Button 
                className="w-full" 
                onClick={handleOptimizeInventory}
              >
                Получить детальный план оптимизации
              </Button>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default StorageProfitabilityAnalysis;
