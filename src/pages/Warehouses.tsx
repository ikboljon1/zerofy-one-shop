
import React from 'react';
import WarehouseMap from '@/components/WarehouseMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WarehouseIcon, TruckIcon, BarChart3Icon, ClipboardListIcon } from 'lucide-react';

const Warehouses: React.FC = () => {
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
          <Card>
            <CardHeader>
              <CardTitle>Статистика инвентаря</CardTitle>
              <CardDescription>
                Обзор товаров на складах и их статусы
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
          <Card>
            <CardHeader>
              <CardTitle>Аналитика складов</CardTitle>
              <CardDescription>
                Детальный анализ работы складов и логистических процессов
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
      </Tabs>
    </div>
  );
};

export default Warehouses;
