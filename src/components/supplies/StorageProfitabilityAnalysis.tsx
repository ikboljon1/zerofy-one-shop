
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, ChevronsUpDown, X, HelpCircle, Info, Settings, Truck, Calendar, DollarSign, BarChart3, Calculator, RefreshCw, Database } from 'lucide-react';
import { addDays, format, startOfMonth, endOfMonth } from 'date-fns';

// Mock warehouse data structure
interface Warehouse {
  id: string;
  name: string;
  type: string;
  city: string;
  region: string;
  coefficient: number;
  isActive: boolean;
}

// Mock product data structure
interface Product {
  id: number;
  nmId: number;
  name: string;
  vendorCode: string;
  category: string;
  brand: string;
  size: string;
  volume: number;
  weight: number;
  barcode: string;
  stockQuantity: number;
  avgDailySales: number;
  retailPrice: number;
  warehousePrice: number;
  daysInStock: number;
}

interface WildberriesAPIKey {
  id: string;
  apiKey: string;
}

const StorageProfitabilityAnalysis: React.FC<{
  selectedWarehouse?: Warehouse | null;
  apiKey?: string;
  paidStorageData?: any[];
}> = ({ selectedWarehouse, apiKey, paidStorageData = [] }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [productInputs, setProductInputs] = useState<Record<number, Product>>({});
  const [selectedTab, setSelectedTab] = useState<string>('analysis');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Mock data for demo
  useEffect(() => {
    // Generate some example products from paid storage data if available
    if (paidStorageData && paidStorageData.length > 0) {
      const mappedProducts = paidStorageData.slice(0, 10).map((item, index) => {
        return {
          id: index + 1,
          nmId: item.nmId || 0,
          name: item.subject || 'Неизвестный товар',
          vendorCode: item.vendorCode || 'UNKNOWN',
          category: item.category || 'Категория не указана',
          brand: item.brand || 'Бренд не указан',
          size: 'Стандарт',
          volume: item.volume || 0,
          weight: 0.5,
          barcode: `XYZ${Math.floor(Math.random() * 1000000)}`,
          stockQuantity: item.barcodesCount || 0,
          avgDailySales: 0, // Initially 0, will be filled by user
          retailPrice: 0, // Initially 0, will be filled by user
          warehousePrice: item.warehousePrice || 0,
          daysInStock: Math.floor(Math.random() * 30) + 1,
        };
      });

      setProducts(mappedProducts);
      
      // Initialize product inputs
      const initialInputs: Record<number, Product> = {};
      mappedProducts.forEach(product => {
        initialInputs[product.nmId] = { ...product };
      });
      setProductInputs(initialInputs);
    } else {
      // Fallback to dummy data if no paid storage data
      const dummyProducts = Array.from({ length: 5 }).map((_, index) => ({
        id: index + 1,
        nmId: 100000 + index,
        name: `Товар ${index + 1}`,
        vendorCode: `ABC-${index + 100}`,
        category: 'Одежда',
        brand: 'Торговая марка',
        size: 'Стандарт',
        volume: 0.1 * (index + 1),
        weight: 0.5,
        barcode: `XYZ${Math.floor(Math.random() * 1000000)}`,
        stockQuantity: Math.floor(Math.random() * 50) + 10,
        avgDailySales: 0,
        retailPrice: 0,
        warehousePrice: Math.floor(Math.random() * 100) + 50,
        daysInStock: Math.floor(Math.random() * 30) + 1
      }));

      setProducts(dummyProducts);
      
      // Initialize product inputs
      const initialInputs: Record<number, Product> = {};
      dummyProducts.forEach(product => {
        initialInputs[product.nmId] = { ...product };
      });
      setProductInputs(initialInputs);
    }
  }, [paidStorageData]);

  const handleInputChange = (nmId: number, field: keyof Product, value: number | string) => {
    setProductInputs(prev => ({
      ...prev,
      [nmId]: {
        ...prev[nmId],
        [field]: value
      }
    }));
  };

  const calculateProfitability = (product: Product) => {
    const { avgDailySales, retailPrice, warehousePrice, stockQuantity } = product;
    
    // Skip calculation if required fields are not filled
    if (!avgDailySales || !retailPrice) {
      return {
        daysToSellOut: 0,
        monthlySales: 0,
        monthlyStorageCost: 0,
        monthlyRevenue: 0,
        monthlyProfit: 0,
        roi: 0,
        isProfitable: false
      };
    }

    // Calculate days to sell all current stock
    const daysToSellOut = avgDailySales > 0 ? stockQuantity / avgDailySales : 0;
    
    // Calculate monthly metrics
    const monthlySales = avgDailySales * 30;
    const monthlyStorageCost = warehousePrice * 30;
    const monthlyRevenue = monthlySales * retailPrice;
    const monthlyProfit = monthlyRevenue - monthlyStorageCost;
    
    // Calculate ROI (Return on Investment)
    const roi = monthlyStorageCost > 0 ? (monthlyProfit / monthlyStorageCost) * 100 : 0;
    
    return {
      daysToSellOut,
      monthlySales,
      monthlyStorageCost,
      monthlyRevenue,
      monthlyProfit,
      roi,
      isProfitable: monthlyProfit > 0
    };
  };

  const FetchSalesDataDialog = () => {
    const [dateFrom, setDateFrom] = useState<Date>(startOfMonth(new Date()));
    const [dateTo, setDateTo] = useState<Date>(endOfMonth(new Date()));
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchSalesData = async () => {
      setIsProcessing(true);
      
      try {
        // This would be a real API call in production
        // For now, we'll simulate fetching sales data with a delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate receiving data from the API
        // In a real implementation, this would come from your API response
        const mockSalesData: Record<number, { avgDailySales: number, retailPrice: number }> = {};
        
        // Here we create unique data for each product instead of using the same value for all
        products.forEach(product => {
          mockSalesData[product.nmId] = {
            avgDailySales: parseFloat((Math.random() * 5 + 0.5).toFixed(2)), // Random value between 0.5 and 5.5
            retailPrice: Math.floor(Math.random() * 3000) + 1000 // Random price between 1000 and 4000
          };
        });
        
        // Update product inputs with the fetched sales data
        setProductInputs(prev => {
          const updated = { ...prev };
          
          Object.entries(mockSalesData).forEach(([nmId, data]) => {
            const productId = parseInt(nmId);
            if (updated[productId]) {
              updated[productId] = {
                ...updated[productId],
                avgDailySales: data.avgDailySales,
                retailPrice: data.retailPrice
              };
            }
          });
          
          return updated;
        });
        
        toast({
          title: "Данные успешно получены",
          description: `Данные о продажах за период ${format(dateFrom, 'dd.MM.yyyy')} - ${format(dateTo, 'dd.MM.yyyy')} успешно загружены.`,
        });
        
        setIsDialogOpen(false);
      } catch (error) {
        console.error("Error fetching sales data:", error);
        toast({
          title: "Ошибка получения данных",
          description: "Не удалось получить данные о продажах. Пожалуйста, попробуйте еще раз.",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    };

    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Получение данных о продажах</DialogTitle>
            <DialogDescription>
              Выберите период для получения данных о средних продажах и ценах товаров
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Начальная дата</Label>
                <DatePicker 
                  date={dateFrom} 
                  setDate={setDateFrom}
                  placeholder="Выберите дату"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateTo">Конечная дата</Label>
                <DatePicker 
                  date={dateTo} 
                  setDate={setDateTo}
                  placeholder="Выберите дату"
                />
              </div>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Информация</AlertTitle>
              <AlertDescription>
                Система получит данные о средних продажах в день и ценах товаров за выбранный период из Wildberries API.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={fetchSalesData} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Загрузка...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Получить данные
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-xl text-indigo-700 dark:text-indigo-400">
          <Calculator className="h-6 w-6" />
          Анализ рентабельности хранения
        </CardTitle>
        <CardDescription>
          Расчет эффективности хранения товаров на складах Wildberries
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="analysis">
                <BarChart3 className="h-4 w-4 mr-2" />
                Расчет рентабельности
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Настройки
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="analysis" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Товары на складе</h3>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Database className="mr-2 h-4 w-4" />
                  Получить данные продаж
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Товар</TableHead>
                      <TableHead className="text-right">
                        <div className="flex justify-end items-center">
                          <span>Кол-во на складе</span>
                          <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        <div className="flex justify-end items-center">
                          <span>Продаж в день</span>
                          <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        <div className="flex justify-end items-center">
                          <span>Цена продажи</span>
                          <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        <div className="flex justify-end items-center">
                          <span>Стоимость хранения</span>
                          <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Результат</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(product => {
                      const input = productInputs[product.nmId] || product;
                      const result = calculateProfitability(input);
                      
                      return (
                        <TableRow key={product.nmId}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium truncate max-w-[180px]">{product.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {product.brand} | ID: {product.nmId}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{product.stockQuantity}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={input.avgDailySales || ''}
                              onChange={(e) => handleInputChange(product.nmId, 'avgDailySales', parseFloat(e.target.value))}
                              placeholder="0.00"
                              className="w-24 h-8 text-right ml-auto"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={input.retailPrice || ''}
                              onChange={(e) => handleInputChange(product.nmId, 'retailPrice', parseFloat(e.target.value))}
                              placeholder="0.00"
                              className="w-24 h-8 text-right ml-auto"
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">{product.warehousePrice.toFixed(2)} ₽</TableCell>
                          <TableCell>
                            {input.avgDailySales && input.retailPrice ? (
                              <div className="flex flex-col items-end">
                                <Badge variant={result.isProfitable ? "success" : "destructive"} className="mb-1">
                                  {result.isProfitable ? 'Выгодно' : 'Невыгодно'}
                                </Badge>
                                <div className="text-xs">
                                  <span className="font-medium">Период распродажи:</span> {result.daysToSellOut.toFixed(1)} дней
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground text-right">
                                Заполните все поля
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {products.filter(p => productInputs[p.nmId]?.avgDailySales && productInputs[p.nmId]?.retailPrice).map(product => {
                  const input = productInputs[product.nmId];
                  const result = calculateProfitability(input);
                  
                  return (
                    <Card key={product.nmId} className={`border ${result.isProfitable ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}`}>
                      <CardHeader className={`pb-2 ${result.isProfitable ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
                        <CardTitle className="text-base font-medium truncate">{product.name}</CardTitle>
                        <CardDescription>
                          {product.brand} | Артикул: {product.vendorCode}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Объем (л):</span>
                            <span>{product.volume.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Запас (шт):</span>
                            <span>{product.stockQuantity}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Продаж в день:</span>
                            <span>{input.avgDailySales.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Цена продажи:</span>
                            <span>{input.retailPrice.toFixed(2)} ₽</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Стоимость хранения в день:</span>
                            <span>{input.warehousePrice.toFixed(2)} ₽</span>
                          </div>
                          
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between">
                              <span className="font-medium">Месячный доход:</span>
                              <span className="font-medium text-green-600">{result.monthlyRevenue.toFixed(2)} ₽</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Месячные расходы:</span>
                              <span className="font-medium text-red-600">{result.monthlyStorageCost.toFixed(2)} ₽</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 mt-2">
                              <span className="font-medium">Чистая прибыль в месяц:</span>
                              <span className={`font-bold ${result.isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                                {result.monthlyProfit.toFixed(2)} ₽
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">ROI:</span>
                              <span className={`font-bold ${result.isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                                {result.roi.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-muted rounded-md p-2 mt-2">
                            <div className="text-sm font-medium mb-1">Рекомендации:</div>
                            {result.isProfitable ? (
                              <div className="text-xs">
                                Хранение товара выгодно. Срок распродажи: {result.daysToSellOut.toFixed(1)} дней.
                              </div>
                            ) : (
                              <div className="text-xs">
                                Хранение товара невыгодно. Рекомендуется снизить запасы или повысить цену.
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="settings">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium">Настройки расчетов</CardTitle>
                    <CardDescription>
                      Параметры для расчета рентабельности хранения
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="marketplace-fee">Комиссия маркетплейса (%)</Label>
                        <Input id="marketplace-fee" type="number" placeholder="15" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="avg-delivery-cost">Средняя стоимость доставки (₽)</Label>
                        <Input id="avg-delivery-cost" type="number" placeholder="150" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="min-days-stock">Минимальный запас (дней)</Label>
                        <Input id="min-days-stock" type="number" placeholder="7" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="target-roi">Целевой ROI (%)</Label>
                        <Input id="target-roi" type="number" placeholder="50" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium">API настройки</CardTitle>
                    <CardDescription>
                      Настройки для получения данных из API Wildberries
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>API ключ Wildberries</Label>
                        <div className="text-sm bg-muted p-2 rounded-md">
                          {apiKey ? apiKey.substring(0, 12) + "..." + apiKey.substring(apiKey.length - 8) : "API ключ не найден"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          API ключ берется из настроек выбранного магазина
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      
      <FetchSalesDataDialog />
    </Card>
  );
};

export default StorageProfitabilityAnalysis;
