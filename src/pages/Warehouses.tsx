import React, { useState, useEffect } from 'react';
import WarehouseMap from '@/components/WarehouseMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  WarehouseIcon, TruckIcon, BarChart3Icon, ClipboardListIcon, 
  PackageSearch, ArrowUpDown, Clock, DollarSign, PackageOpen, Box, RefreshCw
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { 
  fetchAcceptanceCoefficients, 
  fetchWarehouses, 
  fetchAcceptanceOptions,
  fetchStocks,
  processStocksByCategory,
  processStocksByWarehouse,
  WarehouseData
} from '@/services/suppliesApi';
import { 
  SupplyForm, 
  WarehouseCoefficientsTable, 
  SupplyOptionsResults,
  InventoryDetails
} from '@/components/supplies';

import { toast } from '@/hooks/use-toast';

interface SupplyFormData {
  items: Array<{
    article: string;
    quantity: number;
  }>;
  selectedWarehouse: string;
}

interface Warehouse {
  ID: string;
  name: string;
  address: string;
  workTime: string;
  acceptsQR: boolean;
}

interface WarehouseCoefficient {
  warehouse_id: string;
  warehouse_name: string;
  coefficients: {
    [key: string]: number;
  };
}

interface SupplyOptionsResponse {
  result: Array<{
    article: string;
    isError: boolean;
    errorText?: string;
    sizes?: any[];
  }>;
  warehouse: {
    id: string;
    name: string;
  };
}

interface WildberriesStock {
  id: string;
  name: string;
  article: string;
  barcode: string;
  category: string;
  warehouse: string;
  quantity: number;
  dateUpdate: string;
}

interface StocksByCategory {
  name: string;
  count: number;
}

interface StocksByWarehouse {
  name: string;
  count: number;
}

const warehouseAnalyticsData = {
  utilizationByWarehouse: [
    { name: 'Коледино', value: 78 },
    { name: 'Электросталь', value: 65 },
    { name: 'Санкт-Петербург', value: 82 },
    { name: 'Краснодар', value: 45 },
    { name: 'Казань', value: 56 }
  ],
  processingTimeByWarehouse: [
    { name: 'Коледино', time: 12 },
    { name: 'Электросталь', time: 16 },
    { name: 'Санкт-Петербург', time: 9 },
    { name: 'Краснодар', time: 18 },
    { name: 'Казань', time: 14 }
  ],
  warehouseCosts: [
    { warehouse: 'Коледино', rent: 1500000, staff: 2300000, utilities: 450000, maintenance: 350000 },
    { warehouse: 'Электросталь', rent: 1200000, staff: 1800000, utilities: 380000, maintenance: 290000 },
    { warehouse: 'СПб', rent: 1800000, staff: 2600000, utilities: 520000, maintenance: 420000 },
    { warehouse: 'Краснодар', rent: 950000, staff: 1400000, utilities: 280000, maintenance: 210000 },
    { warehouse: 'Казань', rent: 1100000, staff: 1700000, utilities: 340000, maintenance: 260000 }
  ],
  monthlyShipments: [
    { month: 'Янв', count: 4500 },
    { month: 'Фев', count: 5200 },
    { month: 'Мар', count: 4800 },
    { month: 'Апр', count: 5900 },
    { month: 'Май', count: 6300 },
    { month: 'Июн', count: 5700 },
    { month: 'Июл', count: 6100 },
    { month: 'Авг', count: 6800 },
    { month: 'Сен', count: 7200 },
    { month: 'Окт', count: 6500 },
    { month: 'Ноя', count: 7500 },
    { month: 'Дек', count: 8200 }
  ],
  topPerformingWarehouses: [
    { name: 'Коледино', ordersPerDay: 3500, accuracy: 98.5, processingCost: 45 },
    { name: 'Санкт-Петербург', ordersPerDay: 2800, accuracy: 97.8, processingCost: 48 },
    { name: 'Казань', ordersPerDay: 2100, accuracy: 97.2, processingCost: 51 }
  ]
};

const Warehouses: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('map');
  const [wbWarehouses, setWbWarehouses] = useState<Warehouse[]>([]);
  const [coefficients, setCoefficients] = useState<WarehouseCoefficient[]>([]);
  const [supplyResults, setSupplyResults] = useState<SupplyOptionsResponse | null>(null);
  const [stocks, setStocks] = useState<WildberriesStock[]>([]);
  const [categorySummary, setCategorySummary] = useState<StocksByCategory[]>([]);
  const [warehouseSummary, setWarehouseSummary] = useState<StocksByWarehouse[]>([]);
  const [loading, setLoading] = useState({
    warehouses: false,
    coefficients: false,
    options: false,
    inventory: false
  });

  const apiKey = "test_api_key";

  useEffect(() => {
    if (activeTab === 'supplies') {
      loadWarehouses();
      loadCoefficients();
    } else if (activeTab === 'inventory') {
      loadInventory();
    }
  }, [activeTab]);

  const loadWarehouses = async () => {
    try {
      setLoading(prev => ({ ...prev, warehouses: true }));
      const data = await fetchWarehouses(apiKey);
      const warehouses: Warehouse[] = data.map((warehouse: WarehouseData) => ({
        ID: warehouse.id || warehouse.ID || '',
        name: warehouse.name,
        address: warehouse.coordinates ? `Координаты: ${warehouse.coordinates}` : 'Адрес не указан',
        workTime: 'Стандартное время работы', 
        acceptsQR: true
      }));
      setWbWarehouses(warehouses);
    } catch (error) {
      console.error('Ошибка при загрузке складов:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список складов",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, warehouses: false }));
    }
  };

  const loadCoefficients = async () => {
    try {
      setLoading(prev => ({ ...prev, coefficients: true }));
      const data = await fetchAcceptanceCoefficients(apiKey);
      setCoefficients(data);
    } catch (error) {
      console.error('Ошибка при загрузке коэффициентов:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить коэффициенты приемки",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, coefficients: false }));
    }
  };

  const loadInventory = async () => {
    try {
      setLoading(prev => ({ ...prev, inventory: true }));
      const stocksData = await fetchStocks(apiKey);
      setStocks(stocksData);
      
      const categoryData = processStocksByCategory(stocksData);
      const warehouseData = processStocksByWarehouse(stocksData);
      
      setCategorySummary(categoryData);
      setWarehouseSummary(warehouseData);
      
      toast({
        title: "Успех",
        description: "Данные об остатках товаров успешно загружены"
      });
    } catch (error) {
      console.error('Ошибка при загрузке остатков:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные об остатках товаров",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, inventory: false }));
    }
  };

  const handleSupplySubmit = async (data: SupplyFormData) => {
    try {
      setLoading(prev => ({ ...prev, options: true }));
      
      if (!data.selectedWarehouse) {
        toast({
          title: "Ошибка",
          description: "Выберите склад назначения",
          variant: "destructive"
        });
        return;
      }
      
      const optionsResponse = await fetchAcceptanceOptions(
        apiKey,
        data.items,
        data.selectedWarehouse
      );
      
      setSupplyResults(optionsResponse);
      
      const hasErrors = optionsResponse.result.some(item => item.isError);
      
      if (hasErrors) {
        toast({
          title: "Внимание",
          description: "Обнаружены проблемы с некоторыми товарами",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Успех",
          description: "Все товары доступны для поставки"
        });
      }
    } catch (error) {
      console.error('Ошибка при проверке доступности:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось проверить доступность товаров",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, options: false }));
    }
  };

  return (
    <div className="container px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Управление складами и логистикой</h1>
      </div>

      <Tabs defaultValue="map" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="map" className="flex items-center justify-center">
            <WarehouseIcon className="h-4 w-4 mr-2" />
            <span>Карта</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center justify-center">
            <ClipboardListIcon className="h-4 w-4 mr-2" />
            <span>Инвентарь</span>
          </TabsTrigger>
          <TabsTrigger value="logistics" className="flex items-center justify-center">
            <TruckIcon className="h-4 w-4 mr-2" />
            <span>Логистика</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center justify-center">
            <BarChart3Icon className="h-4 w-4 mr-2" />
            <span>Аналитика</span>
          </TabsTrigger>
          <TabsTrigger value="supplies" className="flex items-center justify-center">
            <PackageOpen className="h-4 w-4 mr-2" />
            <span>Поставки</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <WarehouseMap />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold">Остатки товаров на складах</h2>
              <p className="text-sm text-muted-foreground">Актуальная информация о количестве товаров</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={loadInventory}
              disabled={loading.inventory}
              className="flex items-center gap-2"
            >
              {loading.inventory ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Обновить данные
            </Button>
          </div>

          {loading.inventory ? (
            <div className="grid gap-4">
              <Skeleton className="h-[400px] w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : (
            <InventoryDetails
              stocks={stocks}
              categorySummary={categorySummary}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          )}
        </TabsContent>

        <TabsContent value="logistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Логистические маршруты</CardTitle>
              <CardDescription>
                Информация о текущих маршрутах и доставках
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Раздел находится в разработке
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Загруженность складов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={warehouseAnalyticsData.utilizationByWarehouse}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="value" name="Загруженность" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Время обработки заказов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={warehouseAnalyticsData.processingTimeByWarehouse}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip formatter={(value) => `${value} ч.`} />
                      <Bar dataKey="time" name="Время обработки" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Затраты по складам
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={warehouseAnalyticsData.warehouseCosts.slice(0, 4)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="warehouse" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value.toLocaleString()} ₽`} />
                      <Legend />
                      <Bar dataKey="rent" name="Аренда" fill="#8884d8" stackId="a" />
                      <Bar dataKey="staff" name="Персонал" fill="#82ca9d" stackId="a" />
                      <Bar dataKey="utilities" name="Коммунальные" fill="#ffc658" stackId="a" />
                      <Bar dataKey="maintenance" name="Обслуживание" fill="#ff8042" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Динамика отгрузок по месяцам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={warehouseAnalyticsData.monthlyShipments}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Legend />
                    <Line type="monotone" dataKey="count" name="Отгрузки" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Самые эффективные склады</CardTitle>
              <CardDescription>
                Топ 3 склада по эффективности обработки заказов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Склад</TableHead>
                    <TableHead>Заказов в день</TableHead>
                    <TableHead>Точность сборки</TableHead>
                    <TableHead>Стоимость обработки</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouseAnalyticsData.topPerformingWarehouses.map((warehouse, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{warehouse.name}</TableCell>
                      <TableCell>{warehouse.ordersPerDay}</TableCell>
                      <TableCell>{warehouse.accuracy}%</TableCell>
                      <TableCell>{warehouse.processingCost} ₽/заказ</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supplies" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              {loading.warehouses ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ) : (
                <SupplyForm 
                  warehouses={wbWarehouses} 
                  onSupplySubmit={handleSupplySubmit} 
                />
              )}
            </div>
            
            <div className="lg:col-span-2">
              {supplyResults ? (
                <SupplyOptionsResults 
                  results={supplyResults} 
                  warehouses={wbWarehouses} 
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Box className="h-5 w-5 mr-2" />
                      Коэффициенты приемки
                    </CardTitle>
                    <CardDescription>
                      Информация о доступности приемки товаров на складах WB
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading.coefficients ? (
                      <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : (
                      <WarehouseCoefficientsTable coefficients={coefficients} />
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Warehouses;
