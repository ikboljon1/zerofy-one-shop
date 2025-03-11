
import React, { useMemo } from 'react';
import { addDays, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon, PackageOpen, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { WarehouseCoefficient } from '@/types/supplies';
import { formatCurrency } from '@/utils/formatCurrency';

// Define box type mapping for readability
const BOX_TYPE_NAMES: Record<number, string> = {
  2: 'Короба',
  5: 'Монопаллеты',
  6: 'Суперсейф'
};

interface WarehouseCoefficientsDateCardProps {
  coefficients: WarehouseCoefficient[];
  title?: string;
  selectedWarehouseId?: number;
}

const WarehouseCoefficientsDateCard: React.FC<WarehouseCoefficientsDateCardProps> = ({
  coefficients,
  title = "Коэффициенты приемки",
  selectedWarehouseId
}) => {
  // Filter coefficients by selected warehouse if provided
  const filteredCoefficients = useMemo(() => {
    if (selectedWarehouseId) {
      return coefficients.filter(c => c.warehouseID === selectedWarehouseId);
    }
    return coefficients;
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

  // Group coefficients by date 
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
          <CardTitle className="text-lg">{title}</CardTitle>
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {next14Days.map((date) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const dayCoefficients = groupedCoefficients.get(dateStr) || [];

              if (dayCoefficients.length === 0) return null;

              return (
                <Card key={dateStr} className="bg-card border shadow-sm">
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {format(date, 'd MMMM', { locale: ru })}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 px-4 space-y-3">
                    {dayCoefficients.map((coef, idx) => (
                      <div key={idx} className="space-y-2 pb-2 border-b last:border-0">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline">
                            {BOX_TYPE_NAMES[coef.boxTypeID] || coef.boxTypeName}
                          </Badge>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  {coef.coefficient >= 0 && coef.allowUnload ? (
                                    coef.coefficient === 0 ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <span className="text-amber-500 font-medium">{coef.coefficient}x</span>
                                    )
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {coef.coefficient >= 0 && coef.allowUnload ? (
                                  coef.coefficient === 0 ? (
                                    <p>Бесплатная приемка</p>
                                  ) : (
                                    <p>Платная приемка (коэффициент {coef.coefficient})</p>
                                  )
                                ) : (
                                  <p>Приемка недоступна</p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <div className="text-xs space-y-1.5">
                          {coef.deliveryCoef && (
                            <div className="flex items-center justify-between text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <PackageOpen className="h-3 w-3" />
                                <span>Коэф. логистики:</span>
                              </div>
                              <span className="font-mono">{coef.deliveryCoef}</span>
                            </div>
                          )}
                          
                          {coef.storageCoef && (
                            <div className="flex items-center justify-between text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                <span>Коэф. хранения:</span>
                              </div>
                              <span className="font-mono">{coef.storageCoef}</span>
                            </div>
                          )}
                          
                          {coef.deliveryBaseLiter && (
                            <div className="flex items-center justify-between text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <PackageOpen className="h-3 w-3" />
                                <span>Первый литр:</span>
                              </div>
                              <span className="font-mono">{coef.deliveryBaseLiter} ₽</span>
                            </div>
                          )}
                          
                          {coef.deliveryAdditionalLiter && (
                            <div className="flex items-center justify-between text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <PackageOpen className="h-3 w-3" />
                                <span>Доп. литр:</span>
                              </div>
                              <span className="font-mono">{coef.deliveryAdditionalLiter} ₽</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Бесплатная приемка</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-amber-500 font-medium">1.5x</span>
            <span>Платная приемка</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="h-3 w-3 text-red-500" />
            <span>Недоступно</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WarehouseCoefficientsDateCard;
