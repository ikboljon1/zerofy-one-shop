
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Clock, AlertTriangle } from 'lucide-react';

const SupplyForm: React.FC = () => {
  return (
    <Card className="shadow-md overflow-hidden border-primary/10">
      <CardHeader className="pb-3 bg-muted/30">
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-primary" />
          <CardTitle>Создание поставки FBW</CardTitle>
        </div>
        <CardDescription>
          Автоматизированная подготовка поставок на склады Wildberries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 items-center">
          <div className="bg-amber-100 rounded-full p-2 flex-shrink-0">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-medium text-amber-800 mb-1">Функция находится в разработке</h3>
            <p className="text-sm text-amber-700">
              Мы работаем над созданием удобного интерфейса для формирования поставок. Скоро вы сможете создавать поставки непосредственно через наш сервис.
            </p>
          </div>
        </div>
        
        <div className="bg-muted/30 rounded-lg p-4 mt-4">
          <div className="flex gap-2 text-sm text-muted-foreground items-start">
            <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p>
              В текущий момент вы можете просматривать коэффициенты приемки складов и выбирать наиболее выгодный для вашей поставки. Создавать сами поставки необходимо через личный кабинет WB.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplyForm;
