import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Info, Truck, WarehouseIcon, ShieldAlert, CheckCircle, Timer, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Warehouse, WarehouseCoefficient } from '@/types/supplies';

// Update WarehouseMap props to match those passed in Warehouses.tsx
export interface WarehouseMapProps {
  warehouses: Warehouse[];
  coefficients: WarehouseCoefficient[];
  isLoading: boolean;
  className?: string;
}

const WarehouseMap: React.FC<WarehouseMapProps> = ({ warehouses, coefficients, isLoading, className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!mapContainer.current || map.current || warehouses.length === 0) return;

    // Initialize map
    map.current = L.map(mapContainer.current).setView([55.7522, 37.6156], 4);

    // Add OpenStreetMap layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    // Создание пользовательской иконки маркера
    const createCustomIcon = (status: boolean) => {
      return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${status ? '#10B981' : '#EF4444'}; width: 24px; height: 24px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 9.5V17.5H7V9.5L12 5.5L17 9.5Z" fill="white" stroke="white" />
          </svg>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
    };

    // Add markers for warehouses
    warehouses.forEach(warehouse => {
      const marker = L.marker(
        [warehouse.geoPoint.lat, warehouse.geoPoint.lon],
        {
          icon: createCustomIcon(warehouse.acceptsQR)
        }
      ).bindPopup(`
          <div>
            <strong>${warehouse.name}</strong><br>
            Адрес: ${warehouse.address}<br>
            Принимает QR: ${warehouse.acceptsQR ? 'Да' : 'Нет'}<br>
          </div>
        `).addTo(map.current!);

      marker.on('click', () => {
        setSelectedWarehouse(warehouse);
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
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
        <h3 className="text-lg font-semibold">Карта складов Wildberries</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Складские помещения</h4>
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
              {warehouses.map(warehouse => (
                <div 
                  key={warehouse.ID} 
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedWarehouse?.ID === warehouse.ID ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}
                  onClick={() => setSelectedWarehouse(warehouse)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{warehouse.name}</span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {warehouse.address}
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
                  <span className="text-muted-foreground">Адрес:</span>
                  <span>{selectedWarehouse.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Время работы:</span>
                  <span>{selectedWarehouse.workTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Приемка по QR:</span>
                  <span>{selectedWarehouse.acceptsQR ? 'Да' : 'Нет'}</span>
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
