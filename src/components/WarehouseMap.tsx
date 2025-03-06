
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Info, Truck, WarehouseIcon } from 'lucide-react';

// Мок-данные для демонстрации
const warehousesData = [
  { id: 1, name: "Московский склад", coordinates: [55.7522, 37.6156], size: "12,000 м²", items: 14500, status: "active" },
  { id: 2, name: "Санкт-Петербургский склад", coordinates: [59.9343, 30.3351], size: "8,000 м²", items: 9800, status: "active" },
  { id: 3, name: "Новосибирский склад", coordinates: [55.0415, 82.9346], size: "5,500 м²", items: 6200, status: "active" },
  { id: 4, name: "Екатеринбургский склад", coordinates: [56.8519, 60.6122], size: "4,500 м²", items: 5100, status: "active" },
  { id: 5, name: "Казанский склад", coordinates: [55.7887, 49.1221], size: "3,800 м²", items: 4300, status: "maintenance" },
  { id: 6, name: "Ростовский склад", coordinates: [47.2357, 39.7015], size: "3,500 м²", items: 3900, status: "low-stock" }
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
  const map = useRef<L.Map | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

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
    warehousesData.forEach(warehouse => {
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
      const origin = warehousesData.find(w => w.id === route.origin);
      const destination = warehousesData.find(w => w.id === route.destination);

      if (origin && destination) {
        L.polyline([origin.coordinates, destination.coordinates], {
          color: '#6B7280',
          weight: 2,
          opacity: 0.5,
          dashArray: '5, 10'
        }).addTo(map.current!);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

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
