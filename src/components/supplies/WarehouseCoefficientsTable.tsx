
import React, { useState, useMemo } from 'react';
import { WarehouseCoefficient } from '@/types/supplies';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  CheckCircle, 
  XCircle,
  TruckIcon, 
  PackageOpen, 
  DollarSign,
  CalendarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface WarehouseCoefficientsTableProps {
  coefficients: WarehouseCoefficient[];
  selectedWarehouseId?: number;
}

const WarehouseCoefficientsTable: React.FC<WarehouseCoefficientsTableProps> = ({ 
  coefficients, 
  selectedWarehouseId 
}) => {
  const [showLogistics, setShowLogistics] = useState(true);
  
  // Filter coefficients by selected warehouse if provided
  const filteredCoefficients = useMemo(() => {
    if (!selectedWarehouseId) return coefficients;
    return coefficients.filter(c => c.warehouseID === selectedWarehouseId);
  }, [coefficients, selectedWarehouseId]);
  
  // Get the next 14 days from today
  const next14Days = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      days.push(addDays(today, i));
    }
    
    return days;
  }, []);

  // Group coefficients by date and box type
  const groupedCoefficients = useMemo(() => {
    const grouped = new Map<string, WarehouseCoefficient[]>();
    
    filteredCoefficients.forEach(coef => {
      const date = coef.date.split('T')[0];
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)?.push(coef);
    });
    
    return grouped;
  }, [filteredCoefficients]);

  if (filteredCoefficients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Нет данных о коэффициентах</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {selectedWarehouseId 
              ? "Нет данных о коэффициентах приемки для выбранного склада"
              : "Выберите склад для просмотра коэффициентов приёмки"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Коэффициенты приемки</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowLogistics(!showLogistics)}
        >
          {showLogistics ? 'Скрыть логистику' : 'Показать логистику'}
        </Button>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {next14Days.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayCoefficients = groupedCoefficients.get(dateStr) || [];

            if (dayCoefficients.length === 0) return null;

            return (
              <Card key={dateStr} className="relative">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {format(date, 'd MMMM', { locale: ru })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dayCoefficients.map((coef, idx) => (
                    <div key={idx} className="space-y-2 pb-2 border-b last:border-0">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{coef.boxTypeName}</Badge>
                        <div className="flex items-center gap-2">
                          {coef.coefficient >= 0 && coef.allowUnload ? (
                            <>
                              {coef.coefficient === 0 ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <span className="text-amber-500 font-medium">{coef.coefficient}x</span>
                              )}
                            </>
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>

                      {showLogistics && (
                        <div className="text-sm space-y-1 mt-2">
                          {coef.deliveryCoef && (
                            <div className="flex items-center justify-between text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <TruckIcon className="h-3 w-3" />
                                <span>Коэф. логистики:</span>
                              </div>
                              <span>{coef.deliveryCoef}</span>
                            </div>
                          )}
                          {coef.deliveryBaseLiter && (
                            <div className="flex items-center justify-between text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <PackageOpen className="h-3 w-3" />
                                <span>Первый литр:</span>
                              </div>
                              <span>{coef.deliveryBaseLiter} ₽</span>
                            </div>
                          )}
                          {coef.deliveryAdditionalLiter && (
                            <div className="flex items-center justify-between text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <PackageOpen className="h-3 w-3" />
                                <span>За доп. литр:</span>
                              </div>
                              <span>{coef.deliveryAdditionalLiter} ₽</span>
                            </div>
                          )}
                          {coef.storageBaseLiter && (
                            <div className="flex items-center justify-between text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                <span>Хранение:</span>
                              </div>
                              <span>{coef.storageBaseLiter} ₽</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Бесплатная приемка</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-amber-500 font-medium">1.5x</span>
          <span>Платная приемка</span>
        </div>
        <div className="flex items-center gap-1">
          <XCircle className="h-4 w-4 text-red-500" />
          <span>Недоступно</span>
        </div>
      </div>
    </div>
  );
};

export default WarehouseCoefficientsTable;
