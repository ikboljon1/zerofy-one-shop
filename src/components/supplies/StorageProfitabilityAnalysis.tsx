
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WarehouseRemainItem } from '@/types/supplies';
import { Search, TrendingDown, AlertTriangle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/utils/formatCurrency';

interface StorageProfitabilityAnalysisProps {
  warehouseItems: WarehouseRemainItem[];
  averageDailySalesRate: Record<number, number>;
  dailyStorageCost: Record<number, number>;
}

type RecommendationType = 'sell_quickly' | 'discount' | 'keep';

interface ProfitabilityItem {
  item: WarehouseRemainItem;
  daysOfInventory: number;
  monthlyCost: number;
  dailyCost: number;
  profitWithoutDiscount: number;
  profitWithDiscount: number;
  recommendation: RecommendationType;
}

const StorageProfitabilityAnalysis: React.FC<StorageProfitabilityAnalysisProps> = ({ 
  warehouseItems, 
  averageDailySalesRate,
  dailyStorageCost
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [discountPercentage] = useState(30); // Default discount percentage

  const profitabilityData: ProfitabilityItem[] = useMemo(() => {
    if (!warehouseItems || warehouseItems.length === 0) return [];

    return warehouseItems.map(item => {
      // Default to very low sales rate if not provided
      const salesRate = averageDailySalesRate[item.nmId] || 0.05;
      
      // Calculate days of inventory
      const itemQuantity = item.quantityWarehousesFull || 0;
      const daysOfInventory = salesRate > 0 ? Math.round(itemQuantity / salesRate) : 999;
      
      // Calculate storage costs
      const dailyCost = dailyStorageCost[item.nmId] || 1; // Default to 1 ruble if not provided
      const monthlyCost = dailyCost * 30;
      
      // Estimate revenue with and without discount
      const price = item.price || 0;
      const quantity = itemQuantity;
      const totalValue = price * quantity;
      
      // Estimate profits
      const profitWithoutDiscount = totalValue - (daysOfInventory * dailyCost);
      const discountedPrice = price * (1 - discountPercentage / 100);
      const estimatedFasterSaleDays = Math.max(daysOfInventory / 2, 7); // Assume at least 50% faster or 7 days minimum
      const profitWithDiscount = (discountedPrice * quantity) - (estimatedFasterSaleDays * dailyCost);
      
      // Determine recommendation
      let recommendation: RecommendationType = 'keep';
      
      if (daysOfInventory > 180) {
        recommendation = 'sell_quickly';
      } else if (profitWithDiscount > profitWithoutDiscount) {
        recommendation = 'discount';
      }
      
      return {
        item,
        daysOfInventory,
        monthlyCost,
        dailyCost,
        profitWithoutDiscount,
        profitWithDiscount,
        recommendation
      };
    });
  }, [warehouseItems, averageDailySalesRate, dailyStorageCost, discountPercentage]);

  const filteredData = useMemo(() => {
    if (!profitabilityData || profitabilityData.length === 0) return [];
    
    return profitabilityData.filter(entry => {
      if (!searchTerm.trim()) return true;
      
      const item = entry.item;
      
      // Safely check properties before using includes
      const brand = item.brand || '';
      const subjectName = item.subjectName || '';
      const vendorCode = item.vendorCode || '';
      const techSize = item.techSize || '';
      
      return (
        brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        techSize.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [profitabilityData, searchTerm]);

  const getRecommendationColor = (rec: RecommendationType) => {
    switch (rec) {
      case 'sell_quickly': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'discount': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
      case 'keep': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return '';
    }
  };

  const getRecommendationIcon = (rec: RecommendationType) => {
    switch (rec) {
      case 'sell_quickly': return <TrendingDown className="h-3.5 w-3.5 mr-1" />;
      case 'discount': return <AlertTriangle className="h-3.5 w-3.5 mr-1" />;
      case 'keep': return <ArrowRight className="h-3.5 w-3.5 mr-1" />;
      default: return null;
    }
  };

  const getRecommendationText = (rec: RecommendationType) => {
    switch (rec) {
      case 'sell_quickly': return 'Продать быстро';
      case 'discount': return 'Сделать скидку';
      case 'keep': return 'Сохранить цену';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingDown className="mr-2 h-5 w-5" />
          Анализ выгодности хранения
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по бренду, артикулу или наименованию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Товар</TableHead>
                <TableHead className="text-right">Запас (дни)</TableHead>
                <TableHead className="text-right">Хранение/мес</TableHead>
                <TableHead className="text-right">Текущий план</TableHead>
                <TableHead className="text-right">С учетом скидки</TableHead>
                <TableHead>Рекомендация</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{entry.item.brand || 'Н/Д'}</div>
                        <div className="text-sm text-muted-foreground">
                          {entry.item.vendorCode || 'Н/Д'} - {entry.item.subjectName || 'Н/Д'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Остаток: {entry.item.quantityWarehousesFull || 0} шт.
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className="font-medium">{entry.daysOfInventory}</div>
                        <Progress 
                          value={Math.min(100, (entry.daysOfInventory / 180) * 100)} 
                          className={`h-2 ${
                            entry.daysOfInventory > 120 ? 'bg-red-100' : 
                            entry.daysOfInventory > 60 ? 'bg-amber-100' : 'bg-green-100'
                          }`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(entry.monthlyCost)} ₽
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(entry.profitWithoutDiscount)} ₽
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span>{formatCurrency(entry.profitWithDiscount)} ₽</span>
                        <span className={`text-xs ${entry.profitWithDiscount > entry.profitWithoutDiscount ? 'text-green-600' : 'text-red-600'}`}>
                          {entry.profitWithDiscount > entry.profitWithoutDiscount ? '+' : ''}
                          {formatCurrency(entry.profitWithDiscount - entry.profitWithoutDiscount)} ₽
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`gap-1 ${getRecommendationColor(entry.recommendation)}`}>
                        {getRecommendationIcon(entry.recommendation)}
                        {getRecommendationText(entry.recommendation)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {searchTerm ? (
                      "Нет товаров, соответствующих поисковому запросу"
                    ) : (
                      "Нет данных для анализа"
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageProfitabilityAnalysis;
