
import React, { useState } from 'react';
import { WarehouseRemainItem } from '@/types/supplies';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PackageIcon, TruckIcon, ArrowLeftRight, Search, Package, Truck } from 'lucide-react';
import { BarChart, ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';

interface WarehouseRemainsProps {
  data: WarehouseRemainItem[];
  isLoading: boolean;
}

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#6366F1', '#EF4444', '#14B8A6', '#F97316'];

const WarehouseRemains: React.FC<WarehouseRemainsProps> = ({ data, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filter data based on search term
  const filteredData = data.filter(item => 
    item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vendorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.barcode.includes(searchTerm)
  );
  
  // Process data for charts
  const processedData = React.useMemo(() => {
    if (!data.length) return null;
    
    // Get unique warehouses
    const warehouses = [...new Set(
      data.flatMap(item => item.warehouses.map(wh => wh.warehouseName))
    )];
    
    // Total quantities by warehouse
    const warehouseData = warehouses.map(warehouse => {
      const quantity = data.reduce((sum, item) => {
        const wh = item.warehouses.find(w => w.warehouseName === warehouse);
        return sum + (wh?.quantity || 0);
      }, 0);
      
      return {
        name: warehouse,
        value: quantity,
      };
    }).sort((a, b) => b.value - a.value);
    
    // Total quantities by brand (top 10)
    const brands = [...new Set(data.map(item => item.brand))];
    const brandData = brands.map(brand => {
      const items = data.filter(item => item.brand === brand);
      return {
        name: brand,
        value: items.reduce((sum, item) => sum + item.quantityWarehousesFull, 0),
      };
    }).sort((a, b) => b.value - a.value).slice(0, 10);
    
    // Total quantities by category
    const categories = [...new Set(data.map(item => item.subjectName))];
    const categoryData = categories.map(category => {
      const items = data.filter(item => item.subjectName === category);
      return {
        name: category,
        value: items.reduce((sum, item) => sum + item.quantityWarehousesFull, 0),
      };
    }).sort((a, b) => b.value - a.value).slice(0, 10);
    
    // Overall statistics
    const totalItems = data.reduce((sum, item) => sum + item.quantityWarehousesFull, 0);
    const totalInWayToClient = data.reduce((sum, item) => sum + item.inWayToClient, 0);
    const totalInWayFromClient = data.reduce((sum, item) => sum + item.inWayFromClient, 0);
    
    return {
      warehouseData,
      brandData,
      categoryData,
      totalItems,
      totalInWayToClient,
      totalInWayFromClient,
    };
  }, [data]);
  
  if (isLoading) {
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
  
  if (!data.length) {
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="brands">Бренды</TabsTrigger>
          <TabsTrigger value="categories">Категории</TabsTrigger>
          <TabsTrigger value="items">Товары</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {processedData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        
        <TabsContent value="brands" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Остатки по брендам</CardTitle>
              <CardDescription>Распределение товаров по брендам</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  type="search"
                  placeholder="Поиск по бренду..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Бренд</TableHead>
                    <TableHead>Количество SKU</TableHead>
                    <TableHead>Всего на складах</TableHead>
                    <TableHead>В пути к клиентам</TableHead>
                    <TableHead>В пути от клиентов</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...new Set(filteredData.map(item => item.brand))].map(brand => {
                    const items = filteredData.filter(item => item.brand === brand);
                    const totalQuantity = items.reduce((sum, item) => sum + item.quantityWarehousesFull, 0);
                    const totalInWayToClient = items.reduce((sum, item) => sum + item.inWayToClient, 0);
                    const totalInWayFromClient = items.reduce((sum, item) => sum + item.inWayFromClient, 0);
                    
                    return (
                      <TableRow key={brand}>
                        <TableCell className="font-medium">{brand}</TableCell>
                        <TableCell>{items.length}</TableCell>
                        <TableCell>{totalQuantity.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <TruckIcon className="h-4 w-4 text-blue-500 mr-1" />
                            {totalInWayToClient.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <ArrowLeftRight className="h-4 w-4 text-amber-500 mr-1" />
                            {totalInWayFromClient.toLocaleString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Остатки по категориям</CardTitle>
              <CardDescription>Распределение товаров по категориям</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  type="search"
                  placeholder="Поиск по категории..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Категория</TableHead>
                    <TableHead>Количество SKU</TableHead>
                    <TableHead>Всего на складах</TableHead>
                    <TableHead>Бренды</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...new Set(filteredData.map(item => item.subjectName))].map(subject => {
                    const items = filteredData.filter(item => item.subjectName === subject);
                    const totalQuantity = items.reduce((sum, item) => sum + item.quantityWarehousesFull, 0);
                    const brands = [...new Set(items.map(item => item.brand))];
                    
                    return (
                      <TableRow key={subject}>
                        <TableCell className="font-medium">{subject}</TableCell>
                        <TableCell>{items.length}</TableCell>
                        <TableCell>{totalQuantity.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {brands.slice(0, 3).map(brand => (
                              <Badge key={brand} variant="outline">{brand}</Badge>
                            ))}
                            {brands.length > 3 && (
                              <Badge variant="outline">+{brands.length - 3}</Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Список товаров</CardTitle>
              <CardDescription>Детальная информация по товарам на складах</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  type="search"
                  placeholder="Поиск по товару..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Артикул</TableHead>
                    <TableHead>Бренд</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Размер</TableHead>
                    <TableHead>Всего</TableHead>
                    <TableHead>Склады</TableHead>
                    <TableHead>В пути</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{item.vendorCode}</div>
                          <div className="text-xs text-muted-foreground">WB: {item.nmId}</div>
                        </div>
                      </TableCell>
                      <TableCell>{item.brand}</TableCell>
                      <TableCell>{item.subjectName}</TableCell>
                      <TableCell>{item.techSize === "0" ? "Без размера" : item.techSize}</TableCell>
                      <TableCell>{item.quantityWarehousesFull}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {item.warehouses.map((wh, idx) => (
                            <div key={idx} className="text-xs">
                              {wh.warehouseName}: <span className="font-medium">{wh.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <TruckIcon className="h-3 w-3 text-blue-500 mr-1" />
                            <span className="text-xs">К клиенту: {item.inWayToClient}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <ArrowLeftRight className="h-3 w-3 text-amber-500 mr-1" />
                            <span className="text-xs">От клиента: {item.inWayFromClient}</span>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WarehouseRemains;
