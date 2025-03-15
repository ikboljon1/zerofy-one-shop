
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Info, Truck, WarehouseIcon, ShieldAlert, CheckCircle, Timer, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchWarehouses, 
  fetchLogisticsRoutes,
  updateWarehouseStatus,
  addWarehouseRestock,
  type WarehouseData,
  type LogisticsRoute
} from '@/services/warehouseApi';

interface WarehouseMapProps {
  className?: string;
}

const WarehouseMap: React.FC<WarehouseMapProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseData | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [routes, setRoutes] = useState<LogisticsRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Функция для загрузки данных о складах и маршрутах
  const loadWarehouseData = async () => {
    try {
      setIsLoading(true);
      
      // Получаем API ключ из localStorage (в реальном приложении)
      // или используем тестовый ключ для демонстрации
      const apiKey = localStorage.getItem('warehouse_api_key') || 'demo_api_key';
      
      // Загружаем данные о складах
      const warehouseData = await fetchWarehouses(apiKey);
      setWarehouses(warehouseData);
      
      // Загружаем данные о маршрутах логистики
      const logisticsData = await fetchLogisticsRoutes(apiKey);
      setRoutes(logisticsData);
      
      // Если есть данные, устанавливаем первый склад как выбранный по умолчанию
      if (warehouseData.length > 0) {
        setSelectedWarehouse(warehouseData[0]);
      }
      
      toast({
        title: "Данные загружены",
        description: "Информация о складах и маршрутах успешно загружена",
      });
    } catch (error) {
      console.error('Error loading warehouse data:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить данные о складах",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка данных при первой отрисовке компонента
  useEffect(() => {
    loadWarehouseData();
  }, []);

  // Инициализация карты после загрузки данных
  useEffect(() => {
    if (!mapContainer.current || map.current || warehouses.length === 0 || routes.length === 0) return;

    // Инициализация карты
    map.current = L.map(mapContainer.current).setView([55.7522, 37.6156], 4);

    // Добавление слоя OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    // Создание пользовательской иконки маркера
    const createCustomIcon = (status: string) => {
      return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${getWarehouseStatusColor(status)}; width: 24px; height: 24px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 9.5V17.5H7V9.5L12 5.5L17 9.5Z" fill="white" stroke="white" />
          </svg>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
    };

    // Добавление маркеров для складов
    warehouses.forEach(warehouse => {
      const marker = L.marker(warehouse.coordinates as L.LatLngExpression, {
        icon: createCustomIcon(warehouse.status)
      })
        .bindPopup(`
          <div>
            <strong>${warehouse.name}</strong><br>
            Площадь: ${warehouse.size}<br>
            Товаров: ${warehouse.items.toLocaleString()}<br>
            Статус: ${getWarehouseStatusText(warehouse.status)}
          </div>
        `)
        .addTo(map.current!);

      marker.on('click', () => {
        setSelectedWarehouse(warehouse);
      });
    });

    // Добавление линий маршрутов
    routes.forEach(route => {
      const origin = warehouses.find(w => w.id === route.origin);
      const destination = warehouses.find(w => w.id === route.destination);

      if (origin && destination) {
        const routeColor = route.status === 'active' ? '#6B7280' : '#EF4444';
        const dashStyle = route.transport === 'авиаперевозка' ? '8, 8' : '5, 10';
        
        L.polyline([origin.coordinates, destination.coordinates], {
          color: routeColor,
          weight: 2,
          opacity: 0.5,
          dashArray: dashStyle
        }).addTo(map.current!);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [warehouses, routes]);

  const getWarehouseStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return '#10B981';
      case 'maintenance': return '#F59E0B';
      case 'low-stock': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getWarehouseStatusText = (status: string): string => {
    switch (status) {
      case 'active': return 'Активен';
      case 'maintenance': return 'На обслуживании';
      case 'low-stock': return 'Низкий запас';
      default: return 'Неизвестно';
    }
  };

  const getWarehouseStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <div className="bg-green-100 p-2 rounded-full"><CheckCircle className="h-4 w-4 text-green-600" /></div>;
      case 'maintenance': return <div className="bg-amber-100 p-2 rounded-full"><Timer className="h-4 w-4 text-amber-600" /></div>;
      case 'low-stock': return <div className="bg-red-100 p-2 rounded-full"><ShieldAlert className="h-4 w-4 text-red-600" /></div>;
      default: return <div className="bg-gray-100 p-2 rounded-full"><WarehouseIcon className="h-4 w-4 text-gray-600" /></div>;
    }
  };

  const getRouteStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <div className="bg-green-100 p-1 rounded-full"><CheckCircle className="h-3 w-3 text-green-600" /></div>;
      case 'delayed': return <div className="bg-red-100 p-1 rounded-full"><AlertTriangle className="h-3 w-3 text-red-600" /></div>;
      default: return <div className="bg-gray-100 p-1 rounded-full"><Info className="h-3 w-3 text-gray-600" /></div>;
    }
  };

  // Обработчик обновления статуса склада
  const handleUpdateStatus = async (warehouseId: number, newStatus: 'active' | 'maintenance' | 'low-stock') => {
    try {
      const apiKey = localStorage.getItem('warehouse_api_key') || 'demo_api_key';
      const success = await updateWarehouseStatus(apiKey, warehouseId, newStatus);
      
      if (success) {
        // Обновляем данные локально
        const updatedWarehouses = warehouses.map(warehouse => 
          warehouse.id === warehouseId ? { ...warehouse, status: newStatus } : warehouse
        );
        setWarehouses(updatedWarehouses);
        
        // Если обновлен выбранный склад, обновляем и его
        if (selectedWarehouse && selectedWarehouse.id === warehouseId) {
          setSelectedWarehouse({ ...selectedWarehouse, status: newStatus });
        }
        
        toast({
          title: "Статус обновлен",
          description: "Статус склада успешно изменен",
        });
      } else {
        throw new Error("Не удалось обновить статус");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус склада",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-[500px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Загрузка данных о складах...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Карта складов и логистики</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Складские помещения</h4>
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
              {warehouses.map(warehouse => (
                <div 
                  key={warehouse.id} 
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedWarehouse?.id === warehouse.id ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}
                  onClick={() => setSelectedWarehouse(warehouse)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{warehouse.name}</span>
                    {getWarehouseStatusIcon(warehouse.status)}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {warehouse.items.toLocaleString()} товаров • {warehouse.fillRate}% заполнения
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedWarehouse && (
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">{selectedWarehouse.name}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Площадь:</span>
                  <span>{selectedWarehouse.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Товаров:</span>
                  <span>{selectedWarehouse.items.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Статус:</span>
                  <span className={`font-medium ${
                    selectedWarehouse.status === 'active' ? 'text-green-600' :
                    selectedWarehouse.status === 'maintenance' ? 'text-amber-600' :
                    'text-red-600'
                  }`}>
                    {getWarehouseStatusText(selectedWarehouse.status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Загруженность:</span>
                  <span>{selectedWarehouse.fillRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Управляющий:</span>
                  <span>{selectedWarehouse.manager}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Последняя поставка:</span>
                  <span>{selectedWarehouse.lastRestock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Осн. категория:</span>
                  <span>{selectedWarehouse.mostStockedCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Время обработки:</span>
                  <span>{selectedWarehouse.avgProcessingTime}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t">
                <h5 className="font-medium mb-2 text-sm">Маршруты</h5>
                <div className="space-y-2">
                  {routes
                    .filter(route => route.origin === selectedWarehouse.id || route.destination === selectedWarehouse.id)
                    .map((route, index) => {
                      const originWarehouse = warehouses.find(w => w.id === route.origin);
                      const destWarehouse = warehouses.find(w => w.id === route.destination);
                      
                      const isOutgoing = route.origin === selectedWarehouse.id;
                      const partnerWarehouse = isOutgoing ? destWarehouse : originWarehouse;
                      
                      return (
                        <div key={index} className="text-sm flex items-center justify-between">
                          <div className="flex items-center">
                            <Truck className="h-3 w-3 mr-2 text-muted-foreground" />
                            <span>
                              {isOutgoing ? 'Отправка → ' : 'Получение ← '}
                              {partnerWarehouse?.name.split(' ')[0]}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">{route.volume}</span>
                            {getRouteStatusIcon(route.status)}
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="col-span-1 md:col-span-3 h-[500px] relative rounded-lg overflow-hidden border">
          <div ref={mapContainer} className="absolute inset-0" />
          <style>
            {`
              .custom-marker {
                background: none;
                border: none;
              }
            `}
          </style>
        </div>
      </div>
    </Card>
  );
};

export default WarehouseMap;
