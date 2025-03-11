
import React from 'react';
import { WarehouseCoefficient, Warehouse } from '@/types/supplies';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, TrendingDown, Clock, Package } from 'lucide-react';

interface WarehouseCoefficientsCardProps {
  coefficients: WarehouseCoefficient[];
  warehouses: Warehouse[];
  selectedWarehouseId?: number;
}

const WarehouseCoefficientsCard: React.FC<WarehouseCoefficientsCardProps> = ({
  coefficients,
  warehouses,
  selectedWarehouseId
}) => {
  // Filter coefficients if selectedWarehouseId is provided
  const displayCoefficients = selectedWarehouseId 
    ? coefficients.filter(coef => coef.warehouseID === selectedWarehouseId)
    : coefficients.sort((a, b) => a.coefficient - b.coefficient);

  // Limit display to top 10 if no warehouse is selected
  const limitedCoefficients = selectedWarehouseId 
    ? displayCoefficients 
    : displayCoefficients.slice(0, 10);

  const getWarehouseName = (warehouseId: number): string => {
    const warehouse = warehouses.find(w => w.ID === warehouseId);
    return warehouse?.name || `Склад ${warehouseId}`;
  };

  return (
    <Card className="shadow-md h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Building2 className="h-5 w-5 mr-2 text-primary" />
          Коэффициенты приемки
        </CardTitle>
        <CardDescription>
          {selectedWarehouseId 
            ? `Информация о доступности приемки на выбранном складе` 
            : `Склады с наиболее выгодными условиями приемки`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {limitedCoefficients.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            Нет данных о коэффициентах приемки
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {limitedCoefficients.map((coef) => (
              <Card 
                key={`${coef.warehouseID}-${coef.boxTypeID}`}
                className={`overflow-hidden border-l-4 ${
                  coef.allowUnload 
                    ? (coef.coefficient === 0 ? "border-l-green-500" : "border-l-amber-500") 
                    : "border-l-red-500"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-sm">{getWarehouseName(coef.warehouseID)}</h3>
                    <Badge 
                      variant={coef.allowUnload ? (coef.coefficient === 0 ? "success" : "outline") : "destructive"}
                      className="text-xs"
                    >
                      {coef.allowUnload 
                        ? (coef.coefficient === 0 ? "Бесплатно" : `Коэф: ${coef.coefficient}x`) 
                        : "Закрыт"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      <span>Тип упаковки:</span>
                    </div>
                    <div className="text-foreground">{coef.boxTypeName}</div>
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Дата обновления:</span>
                    </div>
                    <div className="text-foreground">
                      {new Date(coef.date).toLocaleDateString()}
                    </div>
                    
                    {coef.deliveryCoef && (
                      <>
                        <div className="flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />
                          <span>Доставка:</span>
                        </div>
                        <div className="text-foreground">{coef.deliveryCoef}x</div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {!selectedWarehouseId && displayCoefficients.length > 10 && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Показаны 10 из {displayCoefficients.length} доступных складов</p>
            <p>Выберите конкретный склад для просмотра всех деталей</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WarehouseCoefficientsCard;
