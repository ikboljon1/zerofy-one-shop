
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Info, Truck, Warehouse as WarehouseIcon } from 'lucide-react';
import { fetchWarehouses, fetchWarehouseRemains } from '@/services/wildberriesApi';
import { useToast } from '@/hooks/use-toast';

interface WarehouseData {
  id: number;
  name: string;
  coordinates: [number, number];
  size: string;
  items: number;
  status: 'active' | 'maintenance' | 'low-stock';
}

interface WarehouseMapProps {
  className?: string;
  apiKey?: string;
}

// Маппинг координат складов Wildberries (примерные координаты)
const warehouseCoordinates: { [key: string]: [number, number] } = {
  "Подольск": [55.4312, 37.5447],
  "Коледино": [55.3221, 37.5447],
  "Электросталь": [55.7847, 38.4447],
  "Невинномысск": [44.6333, 41.9367],
  // Добавьте другие склады по мере необходимости
};

const WarehouseMap: React.FC<WarehouseMapProps> = ({ className, apiKey }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseData | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadWarehouseData = async () => {
    if (!apiKey) return;

    setIsLoading(true);
    try {
      const warehousesData = await fetchWarehouses(apiKey);
      const remainsData = await fetchWarehouseRemains(apiKey);

      // Обрабатываем данные и создаем объединенный массив
      const processedWarehouses: WarehouseData[] = warehousesData.map(warehouse => {
        const warehouseName = warehouse.name.split(',')[0].trim();
        const coordinates = warehouseCoordinates[warehouseName] || [55.7522, 37.6156]; // Москва по умолчанию

        // Подсчитываем общее количество товаров на складе
        const totalItems = remainsData
          .filter(item => item.warehouses.some(wh => wh.warehouseName === warehouseName))
          .reduce((sum, item) => {
            const warehouseQuantity = item.warehouses.find(wh => wh.warehouseName === warehouseName)?.quantity || 0;
            return sum + warehouseQuantity;
          }, 0);

        // Определяем статус склада
        let status: 'active' | 'maintenance' | 'low-stock' = 'active';
        if (totalItems < 1000) {
          status = 'low-stock';
        }

        return {
          id: warehouse.id,
          name: warehouseName,
          coordinates,
          size: "Нет данных",
          items: totalItems,
          status
        };
      });

      setWarehouses(processedWarehouses);
      console.log('Processed warehouses:', processedWarehouses);

    } catch (error) {
      console.error('Error loading warehouse data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные о складах",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (apiKey) {
      loadWarehouseData();
    }
  }, [apiKey]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Инициализация карты
    map.current = L.map(mapContainer.current).setView([55.7522, 37.6156], 4);

    // Добавление слоя OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || warehouses.length === 0) return;

    // Очищаем существующие маркеры
    map.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.current?.removeLayer(layer);
      }
    });

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
            Товаров: ${warehouse.items.toLocaleString()}<br>
            Статус: ${getWarehouseStatusText(warehouse.status)}
          </div>
        `)
        .addTo(map.current!);

      marker.on('click', () => {
        setSelectedWarehouse(warehouse);
      });
    });

  }, [warehouses]);

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
