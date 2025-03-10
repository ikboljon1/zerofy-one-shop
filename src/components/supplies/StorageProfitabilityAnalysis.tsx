import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Search, ArrowUpDown, Package, TrendingDown, Banknote } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { WarehouseRemainItem } from '@/types/supplies';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StorageProfitabilityAnalysisProps {
  warehouseItems: WarehouseRemainItem[];
  averageDailySalesRate?: Record<number, number>; // nmId -> average daily sales
  dailyStorageCost?: Record<number, number>; // nmId -> daily storage cost
}

interface AnalysisResult {
  remainItem: WarehouseRemainItem;
  costPrice: number;
  sellingPrice: number;
  dailySales: number;
  dailyStorageCost: number;
  daysOfInventory: number;
  totalStorageCost: number;
  recommendedDiscount: number;
  profitWithoutDiscount: number;
  profitWithDiscount: number;
  savingsWithDiscount: number;
  action: 'sell' | 'discount' | 'keep';
}

const StorageProfitabilityAnalysis: React.FC<StorageProfitabilityAnalysisProps> = ({
  warehouseItems,
  averageDailySalesRate = {},
  dailyStorageCost = {},
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'discount' | 'keep'>('all');
  const [costPrices, setCostPrices] = useState<Record<number, number>>({});
  const [sellingPrices, setSellingPrices] = useState<Record<number, number>>({});
  const [dailySalesRates, setDailySalesRates] = useState<Record<number, number>>({});
  const [storageCostRates, setStorageCostRates] = useState<Record<number, number>>({});
  const [discountLevels, setDiscountLevels] = useState<Record<number, number>>({});
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AnalysisResult | '',
    direction: 'asc' | 'desc'
  }>({ key: '', direction: 'asc' });

  React.useEffect(() => {
    const storedCostPrices = localStorage.getItem('product_cost_prices');
    if (storedCostPrices) {
      setCostPrices(JSON.parse(storedCostPrices));
    }

    const storedSellingPrices = localStorage.getItem('product_selling_prices');
    if (storedSellingPrices) {
      setSellingPrices(JSON.parse(storedSellingPrices));
    }

    const initialDailySales: Record<number, number> = {};
    const initialStorageCosts: Record<number, number> = {};
    const initialDiscountLevels: Record<number, number> = {};

    warehouseItems.forEach(item => {
      initialDailySales[item.nmId] = averageDailySalesRate[item.nmId] || 0.1;
      initialStorageCosts[item.nmId] = dailyStorageCost[item.nmId] || 5;
      initialDiscountLevels[item.nmId] = 30;
    });

    setDailySalesRates(initialDailySales);
    setStorageCostRates(initialStorageCosts);
    setDiscountLevels(initialDiscountLevels);
  }, [warehouseItems, averageDailySalesRate, dailyStorageCost]);

  const analysisResults = useMemo(() => {
    return warehouseItems.map(item => {
      const nmId = item.nmId;
      const costPrice = costPrices[nmId] || 0;
      const sellingPrice = sellingPrices[nmId] || (item.price || 0);
      const dailySales = dailySalesRates[nmId] || 0.1;
      const storageCostPerUnit = storageCostRates[nmId] || 5;
      const currentStock = item.quantityWarehousesFull || 0;
      const daysOfInventory = dailySales > 0 ? Math.round(currentStock / dailySales) : 999;

      const dailyStorageCostTotal = storageCostPerUnit * currentStock;
      const totalStorageCost = dailyStorageCostTotal * daysOfInventory;

      const profitPerItem = sellingPrice - costPrice;
      const profitWithoutDiscount = profitPerItem * currentStock;

      const discountPercentage = discountLevels[nmId] || 30;
      const discountedPrice = sellingPrice * (1 - discountPercentage / 100);
      const profitWithDiscountPerItem = discountedPrice - costPrice;
      const profitWithDiscount = profitWithDiscountPerItem * currentStock;

      const discountedDaysOfInventory = Math.round(daysOfInventory * 0.5);
      const discountedStorageCost = dailyStorageCostTotal * discountedDaysOfInventory;
      const storageSavings = totalStorageCost - discountedStorageCost;

      const netBenefitOfDiscount = storageSavings + profitWithDiscount - profitWithoutDiscount;

      let action: 'sell' | 'discount' | 'keep';
      if (profitWithDiscountPerItem < 0 && profitPerItem < 0) {
        action = 'sell';
      } else if (netBenefitOfDiscount > 0) {
        action = 'discount';
      } else {
        action = 'keep';
      }

      return {
        remainItem: item,
        costPrice,
        sellingPrice,
        dailySales,
        dailyStorageCost: dailyStorageCostTotal,
        daysOfInventory,
        totalStorageCost,
        recommendedDiscount: discountPercentage,
        profitWithoutDiscount,
        profitWithDiscount,
        savingsWithDiscount: netBenefitOfDiscount,
        action
      };
    });
  }, [warehouseItems, costPrices, sellingPrices, dailySalesRates, storageCostRates, discountLevels]);

  const filteredResults = useMemo(() => {
    let results = [...analysisResults];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      results = results.filter(result => 
        result.remainItem.brand.toLowerCase().includes(search) ||
        result.remainItem.subjectName.toLowerCase().includes(search) ||
        result.remainItem.vendorCode.toLowerCase().includes(search) ||
        result.remainItem.nmId.toString().includes(search)
      );
    }

    if (selectedTab === 'discount') {
      results = results.filter(result => result.action === 'discount' || result.action === 'sell');
    } else if (selectedTab === 'keep') {
      results = results.filter(result => result.action === 'keep');
    }

    if (sortConfig.key) {
      results.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return results;
  }, [analysisResults, searchTerm, selectedTab, sortConfig]);

  const requestSort = (key: keyof AnalysisResult) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const savePriceData = () => {
    localStorage.setItem('product_cost_prices', JSON.stringify(costPrices));
    localStorage.setItem('product_selling_prices', JSON.stringify(sellingPrices));
  };

  const updateCostPrice = (nmId: number, value: number) => {
    setCostPrices(prev => ({
      ...prev,
      [nmId]: value
    }));
  };

  const updateSellingPrice = (nmId: number, value: number) => {
    setSellingPrices(prev => ({
      ...prev,
      [nmId]: value
    }));
  };

  const updateDailySales = (nmId: number, value: number) => {
    setDailySalesRates(prev => ({
      ...prev,
      [nmId]: value
    }));
  };

  const updateStorageCost = (nmId: number, value: number) => {
    setStorageCostRates(prev => ({
      ...prev,
      [nmId]: value
    }));
  };

  const updateDiscountLevel = (nmId: number, value: number[]) => {
    setDiscountLevels(prev => ({
      ...prev,
      [nmId]: value[0]
    }));
  };

  const getActionBadge = (action: 'sell' | 'discount' | 'keep') => {
    switch (action) {
      case 'sell':
        return <Badge variant="destructive">Быстрая продажа</Badge>;
      case 'discount':
        return <Badge variant="warning" className="bg-amber-500">Снизить цену</Badge>;
      case 'keep':
        return <Badge variant="outline">Сохранить цену</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-5 w-5 text-primary" />
          Анализ рентабельности хранения товаров
        </CardTitle>
        <CardDescription>
          Сравнение затрат на хранение с потенциальной прибылью от продажи товаров
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по бренду, артикулу или названию..."
                className="pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={savePriceData}>
                Сохранить изменения
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Все товары</TabsTrigger>
              <TabsTrigger value="discount">Товары для скидки</TabsTrigger>
              <TabsTrigger value="keep">Сохранить цены</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Товар</TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => requestSort('daysOfInventory')}
                  >
                    <div className="flex items-center">
                      Дней в запасе
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => requestSort('totalStorageCost')}
                  >
                    <div className="flex items-center">
                      Расходы на хранение
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => requestSort('savingsWithDiscount')}
                  >
                    <div className="flex items-center">
                      Выгода от скидки
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Рекомендация</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Нет данных для отображения</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => (
                    <TableRow key={result.remainItem.nmId} className="group">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium truncate max-w-[300px]">
                            {result.remainItem.brand} - {result.remainItem.subjectName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Артикул: {result.remainItem.vendorCode} | ID: {result.remainItem.nmId}
                          </div>
                          <div className="pt-2 space-y-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Себестоимость:</Label>
                                <Input
                                  type="number"
                                  value={result.costPrice}
                                  onChange={(e) => updateCostPrice(result.remainItem.nmId, Number(e.target.value))}
                                  className="h-7 text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Цена продажи:</Label>
                                <Input
                                  type="number"
                                  value={result.sellingPrice}
                                  onChange={(e) => updateSellingPrice(result.remainItem.nmId, Number(e.target.value))}
                                  className="h-7 text-xs"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Продаж в день:</Label>
                                <Input
                                  type="number"
                                  value={result.dailySales}
                                  step="0.1"
                                  onChange={(e) => updateDailySales(result.remainItem.nmId, Number(e.target.value))}
                                  className="h-7 text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Стоимость хранения в день:</Label>
                                <Input
                                  type="number"
                                  value={result.dailyStorageCost}
                                  onChange={(e) => updateStorageCost(result.remainItem.nmId, Number(e.target.value))}
                                  className="h-7 text-xs"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs">Рекомендуемая скидка: {result.recommendedDiscount}%</Label>
                              <Slider
                                value={[result.recommendedDiscount]}
                                min={0}
                                max={90}
                                step={5}
                                onValueChange={(value) => updateDiscountLevel(result.remainItem.nmId, value)}
                                className="py-2"
                              />
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{result.daysOfInventory}</div>
                        <div className="text-xs text-muted-foreground">
                          В наличии: {result.remainItem.quantityWarehousesFull} шт.
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(result.totalStorageCost)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(result.dailyStorageCost)} в день
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium ${result.savingsWithDiscount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {result.savingsWithDiscount > 0 
                            ? `+${formatCurrency(result.savingsWithDiscount)}` 
                            : formatCurrency(result.savingsWithDiscount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          При скидке {result.recommendedDiscount}%
                        </div>
                      </TableCell>
                      <TableCell>
                        {getActionBadge(result.action)}
                        <div className="text-xs text-muted-foreground mt-1">
                          {result.action === 'sell' && 'Продать быстрее даже с убытком'}
                          {result.action === 'discount' && `Скидка ${result.recommendedDiscount}% сэкономит на хранении`}
                          {result.action === 'keep' && 'Скидка не принесет выгоды'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageProfitabilityAnalysis;
