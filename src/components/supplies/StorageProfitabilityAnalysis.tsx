
import React, { useState } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell 
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  fetchFullPaidStorageReport, fetchProductDataByNmId
} from '@/services/suppliesApi';
import { PaidStorageItem } from '@/types/supplies';
import { Store } from '@/types/store';
import { 
  Archive, ArrowRight, Calendar, DatabaseIcon, 
  InfoIcon, SearchIcon, TrendingUp 
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { useIsMobile } from '@/hooks/use-mobile';

interface PaidStorageReportProps {
  selectedStore: Store | null;
}

interface StorageProfitabilityAnalysisProps {
  selectedStore: Store | null;
}

interface ProductDetailProps {
  nmId: number;
  vendorCode: string;
  brand: string;
  subject: string;
  averageStorageCost: number;
  averageDailySales: number;
  productName: string;
}

const NmIdSearchDialog: React.FC<{
  selectedStore: Store | null;
  onProductDataFetched: (data: ProductDetailProps) => void;
}> = ({ selectedStore, onProductDataFetched }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [nmId, setNmId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date>(subDays(new Date(), 7));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSearch = async () => {
    if (!selectedStore) {
      toast({
        title: "Ошибка",
        description: "Выберите магазин для получения данных",
        variant: "destructive"
      });
      return;
    }
    
    if (!nmId || isNaN(Number(nmId))) {
      toast({
        title: "Ошибка",
        description: "Введите корректный nmId",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const productData = await fetchProductDataByNmId(
        selectedStore.apiKey,
        Number(nmId),
        dateFrom,
        dateTo
      );
      
      onProductDataFetched(productData);
      setIsOpen(false);
      
      toast({
        title: "Успешно",
        description: `Данные для товара ${productData.productName || nmId} получены`,
      });
    } catch (error: any) {
      console.error("Ошибка при получении данных:", error);
      toast({
        title: "Ошибка при получении данных",
        description: error.message || "Не удалось получить данные по указанному nmId",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-auto">
          <SearchIcon className="mr-2 h-4 w-4" />
          Найти по nmId
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Поиск данных по nmId</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nmId">NmId товара</Label>
            <Input
              id="nmId"
              type="number"
              placeholder="Введите nmId товара"
              value={nmId}
              onChange={(e) => setNmId(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Период для расчета</Label>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <Label htmlFor="dateFrom" className="w-24">С:</Label>
                <DatePicker
                  date={dateFrom}
                  setDate={setDateFrom}
                  className="flex-1"
                />
              </div>
              <div className="flex gap-2 items-center">
                <Label htmlFor="dateTo" className="w-24">По:</Label>
                <DatePicker
                  date={dateTo}
                  setDate={setDateTo}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? (
              <>Загрузка...</>
            ) : (
              <>
                <SearchIcon className="mr-2 h-4 w-4" />
                Найти данные
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ProductDetail: React.FC<{
  productData: ProductDetailProps | null;
}> = ({ productData }) => {
  const isMobile = useIsMobile();
  
  if (!productData) return null;
  
  const calcStats = () => {
    const storageCostPerMonth = productData.averageStorageCost * 30;
    const salesPerMonth = productData.averageDailySales * 30;
    
    const storagePerUnit = salesPerMonth > 0 
      ? storageCostPerMonth / salesPerMonth
      : productData.averageStorageCost;
    
    return {
      storageCostPerMonth,
      salesPerMonth,
      storagePerUnit
    };
  };
  
  const stats = calcStats();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <InfoIcon className="mr-2 h-5 w-5 text-primary" />
          Информация о товаре
        </CardTitle>
        <CardDescription>
          NmId: {productData.nmId} | Артикул: {productData.vendorCode}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-lg font-medium">{productData.productName || "Товар"}</div>
          <div className="text-sm text-muted-foreground">
            {productData.brand} | {productData.subject}
          </div>
          
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4 mt-4`}>
            <div className="bg-secondary/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Archive className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium">Хранение</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">
                  {formatCurrency(productData.averageStorageCost)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Средняя стоимость хранения в день
                </div>
              </div>
              <div className="mt-2">
                <div className="text-lg font-semibold">
                  {formatCurrency(stats.storageCostPerMonth)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Стоимость хранения в месяц
                </div>
              </div>
            </div>
            
            <div className="bg-secondary/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Продажи</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">
                  {productData.averageDailySales.toFixed(2)} шт.
                </div>
                <div className="text-xs text-muted-foreground">
                  Среднее количество продаж в день
                </div>
              </div>
              <div className="mt-2">
                <div className="text-lg font-semibold">
                  {stats.salesPerMonth.toFixed(0)} шт.
                </div>
                <div className="text-xs text-muted-foreground">
                  Прогноз продаж в месяц
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-primary/10 p-4 rounded-lg mt-4">
            <div className="flex items-center space-x-2">
              <DatabaseIcon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Аналитика рентабельности</span>
            </div>
            <div className="mt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Стоимость хранения одной единицы товара:</span>
                <span className="font-medium">{formatCurrency(stats.storagePerUnit)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm">Рекомендации:</span>
                <span className="font-medium text-sm">
                  {stats.storagePerUnit > 50 ? (
                    <span className="text-red-500">Высокие затраты на хранение</span>
                  ) : stats.storagePerUnit > 20 ? (
                    <span className="text-amber-500">Средние затраты на хранение</span>
                  ) : (
                    <span className="text-green-500">Оптимальные затраты на хранение</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PaidStorageReport: React.FC<PaidStorageReportProps> = ({ selectedStore }) => {
  const [paidStorageItems, setPaidStorageItems] = useState<PaidStorageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date>(subDays(new Date(), 7));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const { toast } = useToast();
  
  const fetchPaidStorageData = async () => {
    if (!selectedStore) {
      toast({
        title: "Ошибка",
        description: "Выберите магазин для получения данных",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formattedDateFrom = format(dateFrom, "yyyy-MM-dd'T'HH:mm:ss", { locale: ru });
      const formattedDateTo = format(dateTo, "yyyy-MM-dd'T'HH:mm:ss", { locale: ru });
      
      const data = await fetchFullPaidStorageReport(
        selectedStore.apiKey,
        formattedDateFrom,
        formattedDateTo
      );
      
      setPaidStorageItems(data);
      
      toast({
        title: "Успешно",
        description: `Получено ${data.length} записей о платном хранении`,
      });
    } catch (error: any) {
      console.error("Ошибка при получении данных:", error);
      toast({
        title: "Ошибка при получении данных",
        description: error.message || "Не удалось получить данные о платном хранении",
        variant: "destructive"
      });
      
      // Используем тестовые данные в случае ошибки
      const mockData = Array(10).fill(null).map((_, index) => ({
        date: new Date(Date.now() - (index % 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        logWarehouseCoef: 1,
        officeId: 500 + (index % 3),
        warehouse: ['Коледино', 'Подольск', 'Электросталь'][index % 3],
        warehouseCoef: 1.5 + (index % 5) / 10,
        giId: 100000 + index,
        chrtId: 200000 + index,
        size: ['S', 'M', 'L', 'XL', 'XXL'][index % 5],
        barcode: `2000000${index}`,
        subject: ['Футболка', 'Джинсы', 'Куртка', 'Обувь', 'Аксессуары'][index % 5],
        brand: ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance'][index % 5],
        vendorCode: `A${1000 + index}`,
        nmId: 300000 + index,
        volume: 0.5 + (index % 10) / 10,
        calcType: 'короба: без габаритов',
        warehousePrice: 5 + (index % 20),
        barcodesCount: 1 + (index % 5),
        palletPlaceCode: 0,
        palletCount: 0,
        originalDate: new Date(Date.now() - (index % 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        loyaltyDiscount: index % 3 === 0 ? (2 + index % 5) : 0,
        tariffFixDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tariffLowerDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));
      
      setPaidStorageItems(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  const [groupedData, setGroupedData] = useState<Array<{
    warehouse: string;
    totalCost: number;
    itemCount: number;
  }>>([]);

  const [productData, setProductData] = useState<ProductDetailProps | null>(null);

  // Обработчик получения данных о товаре
  const handleProductDataFetched = (data: ProductDetailProps) => {
    setProductData(data);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Анализ рентабельности хранения</CardTitle>
            <CardDescription>
              Информация о стоимости хранения товаров на складах Wildberries
            </CardDescription>
          </div>
          
          <NmIdSearchDialog 
            selectedStore={selectedStore} 
            onProductDataFetched={handleProductDataFetched}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {productData && <ProductDetail productData={productData} />}
        
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateFrom">С:</Label>
              <DatePicker
                date={dateFrom}
                setDate={setDateFrom}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">По:</Label>
              <DatePicker
                date={dateTo}
                setDate={setDateTo}
              />
            </div>
          </div>
          <Button 
            onClick={fetchPaidStorageData}
            disabled={isLoading || !selectedStore}
            className="sm:self-end"
          >
            {isLoading ? (
              "Загрузка..."
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Получить данные
              </>
            )}
          </Button>
        </div>
        
        <Tabs defaultValue="warehouses">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="warehouses">По складам</TabsTrigger>
            <TabsTrigger value="items">По товарам</TabsTrigger>
          </TabsList>
          
          <TabsContent value="warehouses">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Склад</TableHead>
                    <TableHead className="text-right">Общая стоимость</TableHead>
                    <TableHead className="text-right">Количество товаров</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paidStorageItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        Данные отсутствуют
                      </TableCell>
                    </TableRow>
                  ) : (
                    // Группировка и отображение данных по складам
                    Object.values(
                      paidStorageItems.reduce<Record<string, {
                        warehouse: string;
                        totalCost: number;
                        itemCount: number;
                      }>>((acc, item) => {
                        const warehouse = item.warehouse || 'Неизвестно';
                        if (!acc[warehouse]) {
                          acc[warehouse] = {
                            warehouse,
                            totalCost: 0,
                            itemCount: 0,
                          };
                        }
                        acc[warehouse].totalCost += item.warehousePrice;
                        acc[warehouse].itemCount += 1;
                        return acc;
                      }, {})
                    ).map((group, index) => (
                      <TableRow key={index}>
                        <TableCell>{group.warehouse}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(group.totalCost)}
                        </TableCell>
                        <TableCell className="text-right">{group.itemCount}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="items">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Артикул</TableHead>
                    <TableHead>NmID</TableHead>
                    <TableHead>Товар</TableHead>
                    <TableHead className="text-right">Стоимость хранения</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paidStorageItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Данные отсутствуют
                      </TableCell>
                    </TableRow>
                  ) : (
                    // Группировка и отображение данных по товарам
                    Object.values(
                      paidStorageItems.reduce<Record<number, {
                        vendorCode: string;
                        nmId: number;
                        subject: string;
                        totalCost: number;
                      }>>((acc, item) => {
                        const nmId = item.nmId || 0;
                        if (!acc[nmId]) {
                          acc[nmId] = {
                            vendorCode: item.vendorCode || '',
                            nmId,
                            subject: item.subject || '',
                            totalCost: 0,
                          };
                        }
                        acc[nmId].totalCost += item.warehousePrice;
                        return acc;
                      }, {})
                    ).sort((a, b) => b.totalCost - a.totalCost).slice(0, 20).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.vendorCode}</TableCell>
                        <TableCell>{item.nmId}</TableCell>
                        <TableCell>{item.subject}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.totalCost)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const StorageProfitabilityAnalysis: React.FC<StorageProfitabilityAnalysisProps> = ({ selectedStore }) => {
  return (
    <div className="space-y-6">
      <PaidStorageReport selectedStore={selectedStore} />
    </div>
  );
};

export default StorageProfitabilityAnalysis;
