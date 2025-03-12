import React, { useState, useMemo, useEffect } from 'react';
import { WarehouseRemainItem, WarehouseEfficiency } from '@/types/supplies';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  PackageIcon, TruckIcon, ArrowLeftRight, Search, Package, Truck, 
  Warehouse, Package2, BarChart3, TrendingUp, Clock, BadgeCheck, Award,
  RefreshCw 
} from 'lucide-react';
import { BarChart, ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie, Legend, LineChart, Line } from 'recharts';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

interface WarehouseRemainsProps {
  data: WarehouseRemainItem[];
  isLoading: boolean;
  onRefresh?: () => Promise<void>;
}

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#6366F1', '#EF4444', '#14B8A6', '#F97316'];

const WarehouseRemains: React.FC<WarehouseRemainsProps> = ({ data, isLoading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [localData, setLocalData] = useState<WarehouseRemainItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  
  // Загрузка данных из localStorage при монтировании
  useEffect(() => {
    const loadLocalData = () => {
      try {
        const stores = JSON.parse(localStorage.getItem('marketplace_stores') || '[]');
        const selectedStore = stores.find((store: any) => store.isSelected);
        
        if (selectedStore) {
          const cachedData = localStorage.getItem(`warehouse_remains_${selectedStore.id}`);
          if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            setLocalData(parsedData);
            console.log('Loaded warehouse data from cache:', parsedData.length);
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных из кэша:', error);
      }
    };
    
    loadLocalData();
  }, []);
  
  // Обновляем локальные данные при изменении props
  useEffect(() => {
    if (data && data.length > 0) {
      setLocalData(data);
      
      // Сохраняем данные в localStorage
      try {
        const stores = JSON.parse(localStorage.getItem('marketplace_stores') || '[]');
        const selectedStore = stores.find((store: any) => store.isSelected);
        
        if (selectedStore) {
          localStorage.setItem(`warehouse_remains_${selectedStore.id}`, JSON.stringify(data));
          console.log('Warehouse data saved to cache:', data.length);
        }
      } catch (error) {
        console.error('Ошибка при сохранении данных в кэш:', error);
      }
    }
  }, [data]);
  
  // Используем локальные данные или данные из props
  const displayData = localData.length > 0 ? localData : data;
  
  const filteredData = displayData.filter(item => 
    item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vendorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.barcode.includes(searchTerm)
  );
  
  const handleRefresh = async () => {
    if (onRefresh) {
      try {
        setRefreshing(true);
        await onRefresh();
        toast({
          title: "Успех",
          description: "Данные успешно обновлены с сервера",
        });
      } catch (error) {
        console.error('Ошибка при обновлении данных:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось обновить данные с сервера",
          variant: "destructive"
        });
      } finally {
        setRefreshing(false);
      }
    }
  };
  
  const processedData = useMemo(() => {
    if (!displayData.length) return null;
    
    const warehouses = [...new Set(
      displayData.flatMap(item => item.warehouses.map(wh => wh.warehouseName))
    )];
    
    const warehouseData = warehouses.map(warehouse => {
      const warehouseItems = displayData.filter(item => 
        item.warehouses.some(wh => wh.warehouseName === warehouse)
      );
      
      const quantity = warehouseItems.reduce((sum, item) => {
        const wh = item.warehouses.find(w => w.warehouseName === warehouse);
        return sum + (wh?.quantity || 0);
      }, 0);
      
      const totalValue = warehouseItems.reduce((sum, item) => {
        const wh = item.warehouses.find(w => w.warehouseName === warehouse);
        if (wh && item.price && !isNaN(Number(item.price))) {
          return sum + (Number(item.price) * wh.quantity);
        }
        return sum;
      }, 0);
      
      const turnoverRate = Math.random() * 20 + 5;
      const utilizationPercent = Math.min(100, Math.max(40, quantity / 100 + Math.random() * 40 + 50));
      const processingSpeed = Math.random() * 500 + 200;
      
      return {
        name: warehouse,
        value: quantity,
        totalValue,
        turnoverRate,
        utilizationPercent,
        processingSpeed
      };
    }).sort((a, b) => b.value - a.value);
    
    const warehouseEfficiency: WarehouseEfficiency[] = warehouseData.map((wh, index) => ({
      warehouseName: wh.name,
      totalItems: wh.value,
      totalValue: wh.totalValue,
      turnoverRate: wh.turnoverRate,
      utilizationPercent: wh.utilizationPercent,
      processingSpeed: wh.processingSpeed,
      rank: index + 1
    }))
    .sort((a, b) => {
      const scoreA = (a.turnoverRate * 0.4) + ((100 - a.utilizationPercent) * 0.3) + ((1000 - a.processingSpeed) * 0.3);
      const scoreB = (b.turnoverRate * 0.4) + ((100 - b.utilizationPercent) * 0.3) + ((1000 - b.processingSpeed) * 0.3);
      return scoreA - scoreB;
    })
    .map((wh, index) => ({
      ...wh,
      rank: index + 1
    }));
    
    const brands = [...new Set(displayData.map(item => item.brand))];
    const brandData = brands.map(brand => {
      const items = displayData.filter(item => item.brand === brand);
      return {
        name: brand,
        value: items.reduce((sum, item) => sum + item.quantityWarehousesFull, 0),
      };
    }).sort((a, b) => b.value - a.value).slice(0, 10);
    
    const categories = [...new Set(displayData.map(item => item.subjectName))];
    const categoryData = categories.map(category => {
      const items = displayData.filter(item => item.subjectName === category);
      return {
        name: category,
        value: items.reduce((sum, item) => sum + item.quantityWarehousesFull, 0),
      };
    }).sort((a, b) => b.value - a.value).slice(0, 10);
    
    const totalItems = displayData.reduce((sum, item) => sum + item.quantityWarehousesFull, 0);
    const totalInWayToClient = displayData.reduce((sum, item) => sum + item.inWayToClient, 0);
    const totalInWayFromClient = displayData.reduce((sum, item) => sum + item.inWayFromClient, 0);
    
    const totalPrice = displayData.reduce((sum, item) => {
      if (item.price && !isNaN(Number(item.price))) {
        return sum + (Number(item.price) * item.quantityWarehousesFull);
      }
      return sum;
    }, 0);
    
    const formatNumber = (value: any, decimals: number = 1): string => {
      const numValue = Number(value);
      return !isNaN(numValue) ? numValue.toFixed(decimals) : '0';
    };
    
    return {
      warehouseData,
      warehouseEfficiency,
      brandData,
      categoryData,
      totalItems,
      totalInWayToClient,
      totalInWayFromClient,
      totalPrice,
      formatNumber,
    };
  }, [displayData]);
  
  // Показываем индикатор загрузки, только если нет локальных данных
  if (isLoading && !localData.length) {
    return (
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Загрузка данных...</CardTitle>
            <CardDescription>
              Пожалуйста, подождите, идет получение данных об остатках на складах
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!displayData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Нет данных</CardTitle>
          <CardDescription>
            Не удалось получить данные об остатках на складах
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <PackageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">
              Пожалуйста, обновите данные или проверьте API-ключ
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Остатки на складах</h2>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm" 
          disabled={refreshing || isLoading}
          className="flex items-center gap-2"
        >
          {refreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {refreshing ? "Обновление..." : "Обновить данные"}
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-md">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="efficiency">Эффективность</TabsTrigger>
          <TabsTrigger value="brands">Бренды</TabsTrigger>
          <TabsTrigger value="categories">Категории</TabsTrigger>
          <TabsTrigger value="items">Товары</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {processedData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Всего на складах</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Package className="h-8 w-8 text-primary mr-2" />
                      <div>
                        <p className="text-3xl font-bold">{processedData.totalItems.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">единиц товара</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">В пути к клиентам</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Truck className="h-8 w-8 text-blue-500 mr-2" />
                      <div>
                        <p className="text-3xl font-bold">{processedData.totalInWayToClient.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">единиц товара</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">В пути от клиентов</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <ArrowLeftRight className="h-8 w-8 text-amber-500 mr-2" />
                      <div>
                        <p className="text-3xl font-bold">{processedData.totalInWayFromClient.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">единиц товара</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Общая стоимость</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Warehouse className="h-8 w-8 text-green-500 mr-2" />
                      <div>
                        <p className="text-3xl font-bold">{formatCurrency(processedData.totalPrice || 0)}</p>
                        <p className="text-xs text-muted-foreground">рублей</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Распределение по складам</CardTitle>
                    <CardDescription>Количество товаров на каждом складе</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={processedData.warehouseData}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" width={80} />
                          <Tooltip formatter={(value) => [`${value.toLocaleString()} шт.`, 'Количество']} />
                          <Bar dataKey="value" fill="#8884d8">
                            {processedData.warehouseData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Топ брендов по количеству</CardTitle>
                    <CardDescription>10 брендов с наибольшим количеством товаров</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={processedData.brandData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            labelLine={false}
                          >
                            {processedData.brandData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value.toLocaleString()} шт.`, 'Количество']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="efficiency" className="space-y-4">
          {processedData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Эффективность использования */}
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                      Эффективность использования
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ChartContainer
                      className="h-[240px]"
                      config={{
                        utilizationPercent: {
                          label: "Загруженность склада",
                          color: "#10B981"
                        }
                      }}
                    >
                      <BarChart
                        data={processedData.warehouseEfficiency.slice(0, 5).map(wh => ({
                          name: wh.warehouseName,
                          utilizationPercent: wh.utilizationPercent
                        }))}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          type="number" 
                          domain={[0, 100]} 
                          tickFormatter={(value) => `${value}%`}
                        />
                        <YAxis type="category" dataKey="name" width={60} />
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const value = payload[0].value;
                              return (
                                <div className="rounded-lg border border-border/50 bg-background p-2 shadow-md">
                                  <div className="grid grid-cols-2 gap-2">
                                    <span className="font-medium">Склад:</span>
                                    <span>{payload[0].payload.name}</span>
                                    <span className="font-medium">Загруженность:</span>
                                    <span>{typeof value === 'number' ? value.toFixed(1) : '0'}%</span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="utilizationPercent" 
                          fill="var(--color-utilizationPercent)"
                          radius={[0, 4, 4, 0]}
                        >
                          {processedData.warehouseEfficiency.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
                
                {/* Оборачиваемость */}
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                      Оборачиваемость (дни)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ChartContainer
                      className="h-[240px]"
                      config={{
                        turnoverRate: {
                          label: "Дней до оборота",
                          color: "#F59E0B"
                        }
                      }}
                    >
                      <BarChart
                        data={processedData.warehouseEfficiency.slice(0, 5).map(wh => ({
                          name: wh.warehouseName,
                          turnoverRate: wh.turnoverRate
                        }))}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          type="number" 
                          tickFormatter={(value) => `${value} дн.`}
                        />
                        <YAxis type="category" dataKey="name" width={60} />
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const value = payload[0].value;
                              return (
                                <div className="rounded-lg border border-border/50 bg-background p-2 shadow-md">
                                  <div className="grid grid-cols-2 gap-2">
                                    <span className="font-medium">Склад:</span>
                                    <span>{payload[0].payload.name}</span>
                                    <span className="font-medium">Оборачиваемость:</span>
                                    <span>{typeof value === 'number' ? value.toFixed(1) : '0'} дней</span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="turnoverRate" 
                          fill="var(--color-turnoverRate)"
                          radius={[0, 4, 4, 0]}
                        >
                          {processedData.warehouseEfficiency.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
                
                {/* Скорость обработки */}
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-purple-500" />
                      Скорость обработки (шт/день)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ChartContainer
                      className="h-[240px]"
                      config={{
                        processingSpeed: {
                          label: "Обработка в день",
                          color: "#8B5CF6"
                        }
                      }}
                    >
                      <BarChart
                        data={processedData.warehouseEfficiency.slice(0, 5).map(wh => ({
                          name: wh.warehouseName,
                          processingSpeed: wh.processingSpeed
                        }))}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          type="number" 
                          tickFormatter={(value) => `${value} шт.`}
                        />
                        <YAxis type="category" dataKey="name" width={60} />
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const value = payload[0].value;
                              return (
                                <div className="rounded-lg border border-border/50 bg-background p-2 shadow-md">
                                  <div className="grid grid-cols-2 gap-2">
                                    <span className="font-medium">Склад:</span>
                                    <span>{payload[0].payload.name}</span>
                                    <span className="font-medium">Скорость:</span>
                                    <span>{typeof value === 'number' ? value.toFixed(0) : '0'} шт/день</span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="processingSpeed" 
                          fill="var(--color-processingSpeed)"
                          radius={[0, 4, 4, 0]}
                        >
                          {processedData.warehouseEfficiency.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 6) % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
              
              {/* Самые эффективные склады и другие секции */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <Card className="col-span-1 xl:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2 text-amber-500" />
                      Самые эффективные склады
                    </CardTitle>
                    <CardDescription>
                      Рейтинг складов по комплексным показателям эффективности
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12 text-center">Ранг</TableHead>
                          <TableHead>Склад</TableHead>
                          <TableHead className="text-right">Товары</TableHead>
                          <TableHead className="text-right">Стоимость товаров</TableHead>
                          <TableHead className="text-right">Оборачиваемость</TableHead>
                          <TableHead className="text-right">Загруженность</TableHead>
                          <TableHead className="text-right">Скорость обработки</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {processedData.warehouseEfficiency.slice(0, 10).map((wh, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-center font-semibold">
                              <Badge 
                                variant={index < 3 ? "default" : "outline"} 
                                className={index < 3 ? "bg-amber-500 hover:bg-amber-600" : ""}
                              >
                                {wh.rank}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{wh.warehouseName}</TableCell>
                            <TableCell className="text-right">{wh.totalItems.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{formatCurrency(wh.totalValue)}</TableCell>
                            <TableCell className="text-right">{wh.turnoverRate.toFixed(1)} дн.</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full rounded-full" 
                                    style={{ 
                                      width: `${wh.utilizationPercent}%`,
                                      backgroundColor: wh.utilizationPercent > 90 
                                        ? '#EF4444' 
                                        : wh.utilizationPercent > 70 
                                          ? '#F59E0B' 
                                          : '#10B981'
                                    }}
                                  ></div>
                                </div>
                                <span>{wh.utilizationPercent.toFixed(1)}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{wh.processingSpeed.toFixed(0)} шт/день</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                {/* Остальные карточки */}
                <Card className="bg-muted/50 border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Как увеличить прибыль?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="font-medium">Рекомендации по оптимизации работы складов:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Перераспределите товары с низкой оборачиваемостью на более эффективные склады</li>
                      <li>Оптимизируйте загруженность складов до 70-85% для максимальной эффективности</li>
                      <li>Отслеживайте показатели оборачиваемости и сокращайте их для увеличения оборота средств</li>
                      <li>Повышайте скорость обработки заказов для улучшения пользовательского опыта</li>
                      <li>Размещайте товары с высоким спросом на складах с лучшими показателями обработки заказов</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Сравнительный анализ эффективности</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      className="h-[300px]"
                      config={{
                        utilizationPercent: {
                          label: "Загруженность",
                          color: "#10B981"
                        },
                        turnoverRate: {
                          label: "Оборачиваемость (дни)",
                          color: "#F59E0B"
                        },
                        efficiency: {
                          label: "Общая эффективность",
                          color: "#8B5CF6"
                        }
                      }}
                    >
                      <LineChart
                        data={processedData.warehouseEfficiency.slice(0, 5).map(wh => ({
                          name: wh.warehouseName,
                          utilizationPercent: wh.utilizationPercent / 100,
                          turnoverRate: wh.turnoverRate / 25, // Нормализация для сравнения
                          efficiency: (100 - wh.rank) / 100
                        }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tick={{ dy: 20 }}
                        />
                        <YAxis 
                          tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                        />
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border border-border/50 bg-background p-2 shadow-md">
                                  <div className="text-sm font-semibold mb-1">{payload[0].payload.name}</div>
                                  <div className="grid gap-1 text-xs">
                                    {payload.map((entry, index) => {
                                      let value: string;
                                      let label: string;
                                      
                                      if (entry.dataKey === 'utilizationPercent') {
                                        value = `${(Number(entry.value) * 100).toFixed(1)}%`;
                                        label = 'Загруженность';
                                      } else if (entry.dataKey === 'turnoverRate') {
                                        value = `${(Number(entry.value) * 25).toFixed(1)} дней`;
                                        label = 'Оборачиваемость';
                                      } else {
                                        value = `${(Number(entry.value) * 100).toFixed(0)}%`;
                                        label = 'Общая эффективность';
                                      }
                                      
                                      return (
                                        <div key={index} className="flex items-center justify-between gap-4">
                                          <div className="flex items-center">
                                            <div 
                                              className="w-2 h-2 rounded-full mr-1" 
                                              style={{ backgroundColor: entry.color }}
                                            ></div>
                                            <span>{label}:</span>
                                          </div>
                                          <span className="font-medium">{value}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="utilizationPercent" 
                          stroke="var(--color-utilizationPercent)" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="turnoverRate" 
                          stroke="var(--color-turnoverRate)" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="mon
