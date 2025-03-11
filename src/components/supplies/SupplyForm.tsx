
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Clock, AlertTriangle, Hourglass, LucideWrench } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SupplyForm: React.FC = () => {
  return (
    <Card className="shadow-md overflow-hidden border-primary/10 bg-gradient-to-b from-background to-background/80">
      <CardHeader className="pb-3 bg-muted/20">
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-primary" />
          <CardTitle>Создание поставки FBW</CardTitle>
        </div>
        <CardDescription>
          Автоматизированная подготовка поставок на склады Wildberries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="bg-accent/15 border border-accent/20 rounded-lg p-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mb-3">
            <Hourglass className="h-6 w-6 text-primary/80" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Скоро будет доступно</h3>
          <p className="text-muted-foreground mb-3">
            Мы работаем над созданием удобного интерфейса для формирования поставок напрямую через наш сервис.
            Эта функция будет доступна в ближайшее время.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full">
            <LucideWrench className="h-3.5 w-3.5" />
            <span>В разработке</span>
          </div>
        </div>
        
        <Alert variant="default" className="bg-amber-50/10 border-amber-200/30 text-amber-800/90">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-700">Рекомендация</AlertTitle>
          <AlertDescription className="text-amber-700/90 text-sm">
            В текущий момент вы можете просматривать коэффициенты приемки складов и выбирать наиболее выгодный для вашей поставки. Создавать сами поставки необходимо через личный кабинет WB.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default SupplyForm;
