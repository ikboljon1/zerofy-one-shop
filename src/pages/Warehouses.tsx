
import React, { useState } from 'react';
import WarehouseMap from '@/components/WarehouseMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WarehouseIcon, TruckIcon, BarChart3Icon, ClipboardListIcon, PackageSearch, ArrowUpDown, Clock, DollarSign } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { inventoryData, warehousesData, warehouseAnalyticsData } from '@/components/analytics/data/demoData';
import { BarChart, ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#6366F1'];

const Warehouses: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="container px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Управление складами и логистикой</h1>
      </div>

      <Tabs defaultValue="map" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
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
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <WarehouseMap />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PackageSearch className="h-5 w-5 mr-2" />
                  Обзор инвентаря
                </CardTitle>
                <CardDescription>
                  Статистика по категориям товаров на всех складах
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Категория</TableHead>
                      <TableHead>Количество</TableHead>
                      <TableHead>Стоимость (₽)</TableHead>
                      <TableHead>Товар-лидер</TableHead>
                      <TableHead>Ср. оборот</TableHead>
                      <TableHead>Возвраты</TableHead>
                      <TableHead>В пути</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryData.map((item, index) => (
                      <TableRow 
                        key={index}
                        className={`cursor-pointer ${selectedCategory === item.category ? 'bg-primary/5' : ''}`}
                        onClick={() => setSelectedCategory(item.category)}
                      >
                        <TableCell className="font-medium">{item.category}</TableCell>
                        <TableCell>{item.totalItems.toLocaleString()}</TableCell>
                        <TableCell>{item.valueRub.toLocaleString()}</TableCell>
                        <TableCell>{item.topSellingItem}</TableCell>
                        <TableCell>{item.averageTurnover}</TableCell>
                        <TableCell>{item.returns}</TableCell>
                        <TableCell>{item.inTransit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Распределение по категориям</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="totalItems"
                      nameKey="category"
                      label={({name}) => name.split(' ')[0]}
                      labelLine={false}
                    >
                      {inventoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {selectedCategory && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Размещение {selectedCategory} по складам</CardTitle>
                <CardDescription>
                  Распределение товаров выбранной категории
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={warehousesData.map(w => ({
                        name: w.name.split(' ')[0],
                        value: Math.floor(Math.random() * 3000) + 500
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => value.toLocaleString()} />
                      <Bar dataKey="value" name="Количество" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
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
      </Tabs>
    </div>
  );
};

export default Warehouses;
