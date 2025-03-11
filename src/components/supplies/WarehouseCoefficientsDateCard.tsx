
import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  XCircle, 
  TruckIcon, 
  PackageOpen, 
  DollarSign,
  ChevronDown,
  ChevronUp,
  CalendarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { WarehouseCoefficient } from '@/types/supplies';

interface WarehouseCoefficientsDateCardProps {
  coefficients: WarehouseCoefficient[];
  title?: string;
}

const WarehouseCoefficientsDateCard: React.FC<WarehouseCoefficientsDateCardProps> = ({ 
  coefficients,
  title = "Коэффициенты приемки по дням"
}) => {
  const [expandedDates, setExpandedDates] = useState<string[]>([]);

  // Get the next 14 days from today
  const next14Days = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  });

  const toggleDate = (date: string) => {
    setExpandedDates(prev => 
      prev.includes(date) 
        ? prev.filter(d => d !== date)
        : [...prev, date]
    );
  };

  const getCoefficientsForDate = (date: string) => {
    return coefficients.filter(c => c.date.startsWith(date));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {next14Days.map(date => {
              const dateCoefficients = getCoefficientsForDate(date);
              if (dateCoefficients.length === 0) return null;

              const isExpanded = expandedDates.includes(date);

              return (
                <Card key={date} className="border border-border/50 shadow-sm">
                  <CardHeader className="pb-2">
                    <Button
                      variant="ghost"
                      className="w-full flex justify-between items-center p-0 h-auto hover:bg-transparent"
                      onClick={() => toggleDate(date)}
                    >
                      <span className="font-medium">
                        {format(new Date(date), 'd MMMM', { locale: ru })}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="space-y-4">
                      {dateCoefficients.map((coef, idx) => (
                        <div key={`${coef.warehouseID}-${idx}`} className="space-y-2 pb-3 border-b last:border-0">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{coef.boxTypeName}</Badge>
                            <div className="flex items-center gap-2">
                              {coef.coefficient >= 0 && coef.allowUnload ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      {coef.coefficient === 0 ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <span className="text-amber-500 font-medium">
                                          {coef.coefficient}x
                                        </span>
                                      )}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        {coef.coefficient === 0 
                                          ? 'Бесплатная приемка' 
                                          : `Платная приемка (коэффициент ${coef.coefficient})`
                                        }
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <XCircle className="h-4 w-4 text-red-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Приемка недоступна</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </div>

                          <div className="text-sm space-y-1.5 mt-2 p-2 bg-muted/20 rounded-md">
                            {coef.storageCoef && (
                              <div className="flex items-center justify-between text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <PackageOpen className="h-3 w-3" />
                                  <span>Коэф. хранения:</span>
                                </div>
                                <span className="font-mono text-xs">{coef.storageCoef}</span>
                              </div>
                            )}
                            
                            {coef.deliveryCoef && (
                              <div className="flex items-center justify-between text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <TruckIcon className="h-3 w-3" />
                                  <span>Коэф. логистики:</span>
                                </div>
                                <span className="font-mono text-xs">{coef.deliveryCoef}</span>
                              </div>
                            )}

                            {coef.deliveryBaseLiter && (
                              <div className="flex items-center justify-between text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  <span>Первый литр:</span>
                                </div>
                                <span className="font-mono text-xs">{coef.deliveryBaseLiter} ₽</span>
                              </div>
                            )}

                            {coef.deliveryAdditionalLiter && (
                              <div className="flex items-center justify-between text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  <span>За доп. литр:</span>
                                </div>
                                <span className="font-mono text-xs">
                                  {coef.deliveryAdditionalLiter} ₽
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default WarehouseCoefficientsDateCard;
