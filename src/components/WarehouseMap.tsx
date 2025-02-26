
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Info, Truck, WarehouseIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Временный API ключ для демонстрации
// В реальном приложении его нужно хранить в переменных окружения
const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZWRldiIsImEiOiJjbHN1ZWx4bnIxeGl0MmtyejNhczRxN2g3In0.amTKdC9DpzTg_-SfVekXWw';

// Мок-данные для демонстрации
const warehousesData = [
  { id: 1, name: "Московский склад", coordinates: [37.6156, 55.7522], size: "12,000 м²", items: 14500, status: "active" },
  { id: 2, name: "Санкт-Петербургский склад", coordinates: [30.3351, 59.9343], size: "8,000 м²", items: 9800, status: "active" },
  { id: 3, name: "Новосибирский склад", coordinates: [82.9346, 55.0415], size: "5,500 м²", items: 6200, status: "active" },
  { id: 4, name: "Екатеринбургский склад", coordinates: [60.6122, 56.8519], size: "4,500 м²", items: 5100, status: "active" },
  { id: 5, name: "Казанский склад", coordinates: [49.1221, 55.7887], size: "3,800 м²", items: 4300, status: "maintenance" },
  { id: 6, name: "Ростовский склад", coordinates: [39.7015, 47.2357], size: "3,500 м²", items: 3900, status: "low-stock" }
];

// Маршруты между складами
const routes = [
  { origin: 1, destination: 2, volume: "320 единиц/день", transport: "грузовик" },
  { origin: 1, destination: 3, volume: "220 единиц/день", transport: "авиаперевозка" },
  { origin: 1, destination: 4, volume: "180 единиц/день", transport: "грузовик" },
  { origin: 1, destination: 5, volume: "150 единиц/день", transport: "грузовик" },
  { origin: 1, destination: 6, volume: "140 единиц/день", transport: "грузовик" },
  { origin: 2, destination: 3, volume: "90 единиц/день", transport: "грузовик" },
  { origin: 4, destination: 3, volume: "70 единиц/день", transport: "грузовик" },
  { origin: 5, destination: 6, volume: "50 единиц/день", transport: "грузовик" }
];

interface WarehouseMapProps {
  className?: string;
}

const WarehouseMap: React.FC<WarehouseMapProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [customApiKey, setCustomApiKey] = useState<string>(MAPBOX_TOKEN);

  useEffect(() => {
    if (!mapContainer.current || mapLoaded) return;

    try {
      // Инициализация карты
      mapboxgl.accessToken = customApiKey;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [52, 55], // Центр России
        zoom: 3
      });

      // Добавление контролов навигации
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Обработка события загрузки карты
      map.current.on('load', () => {
        setMapLoaded(true);
        
        // Добавляем маркеры для складов
        warehousesData.forEach(warehouse => {
          // Создаем HTML элемент для маркера
          const el = document.createElement('div');
          el.className = 'warehouse-marker';
          el.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="12" fill="${getWarehouseStatusColor(warehouse.status)}" />
            <path d="M17 9.5V17.5H7V9.5L12 5.5L17 9.5Z" fill="white" stroke="white" />
          </svg>`;
          
          el.style.cursor = 'pointer';
          
          // Добавляем обработчик клика
          el.addEventListener('click', () => {
            setSelectedWarehouse(warehouse);
          });
          
          // Создаем и добавляем маркер на карту
          new mapboxgl.Marker(el)
            .setLngLat(warehouse.coordinates as [number, number])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <div>
                    <strong>${warehouse.name}</strong><br>
                    Площадь: ${warehouse.size}<br>
                    Товаров: ${warehouse.items.toLocaleString()}<br>
                    Статус: ${getWarehouseStatusText(warehouse.status)}
                  </div>
                `)
            )
            .addTo(map.current!);
        });
      });
    } catch (error) {
      console.error("Ошибка при инициализации карты:", error);
      setShowApiKeyDialog(true);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [customApiKey, mapLoaded]);

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
      case 'active': return <div className="bg-green-100 p-2 rounded-full"><WarehouseIcon className="h-4 w-4 text-green-600" /></div>;
      case 'maintenance': return <div className="bg-amber-100 p-2 rounded-full"><AlertTriangle className="h-4 w-4 text-amber-600" /></div>;
      case 'low-stock': return <div className="bg-red-100 p-2 rounded-full"><Info className="h-4 w-4 text-red-600" /></div>;
      default: return <div className="bg-gray-100 p-2 rounded-full"><WarehouseIcon className="h-4 w-4 text-gray-600" /></div>;
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Карта складов и логистики</h3>
        <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Info className="h-4 w-4 mr-2" />
              API ключ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>API ключ Mapbox</DialogTitle>
              <DialogDescription>
                Для работы карты требуется действующий API ключ Mapbox. Вы можете получить его бесплатно на сайте mapbox.com.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Сейчас используется временный демонстрационный ключ. В производственной среде рекомендуется использовать собственный ключ.
              </p>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="Введите ваш API ключ Mapbox"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
              />
              <Button 
                onClick={() => {
                  setMapLoaded(false);
                  setShowApiKeyDialog(false);
                }}
                className="w-full"
              >
                Применить
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Складские помещения</h4>
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
              {warehousesData.map(warehouse => (
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
                    {warehouse.items.toLocaleString()} товаров
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
                  <span className="text-muted-foreground">Количество товаров:</span>
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
                  <span className="text-muted-foreground">Координаты:</span>
                  <span>{selectedWarehouse.coordinates.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Загруженность:</span>
                  <span>{Math.floor(Math.random() * 30) + 70}%</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t">
                <h5 className="font-medium mb-2 text-sm">Маршруты</h5>
                <div className="space-y-2">
                  {routes
                    .filter(route => route.origin === selectedWarehouse.id || route.destination === selectedWarehouse.id)
                    .map((route, index) => {
                      const originWarehouse = warehousesData.find(w => w.id === route.origin);
                      const destWarehouse = warehousesData.find(w => w.id === route.destination);
                      
                      return (
                        <div key={index} className="text-sm flex items-center justify-between">
                          <div className="flex items-center">
                            <Truck className="h-3 w-3 mr-2 text-muted-foreground" />
                            <span>
                              {originWarehouse?.name.split(' ')[0]} → {destWarehouse?.name.split(' ')[0]}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">{route.volume}</span>
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
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                <p>Загрузка карты...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .warehouse-marker {
          width: 24px;
          height: 24px;
        }
      `}</style>
    </Card>
  );
};

export default WarehouseMap;
