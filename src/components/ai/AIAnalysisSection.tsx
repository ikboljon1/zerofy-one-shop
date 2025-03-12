
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Calendar, Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIAnalysisSectionProps {
  storeId?: string;
  analyticsData?: any;
  dateFrom?: Date;
  dateTo?: Date;
  hasAccess?: boolean; // Добавляем проверку доступа к функции
}

const AIAnalysisSection = ({ 
  storeId, 
  analyticsData, 
  dateFrom, 
  dateTo, 
  hasAccess = false 
}: AIAnalysisSectionProps = {}) => {
  // Если нет доступа к AI-функциям, показываем блокированный интерфейс
  if (!hasAccess) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-muted-foreground" />
                <CardTitle>AI-анализ данных</CardTitle>
              </div>
            </div>
            <CardDescription>
              Автоматический анализ данных и рекомендации по оптимизации работы магазина
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Функция недоступна</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                AI-анализ данных доступен только на тарифе "Бизнес". 
                Обновите свой тарифный план для доступа к этой функции.
              </p>
              <Button variant="outline">Обновить тариф</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              <CardTitle>AI-анализ данных</CardTitle>
            </div>
          </div>
          <CardDescription>
            Автоматический анализ данных и рекомендации по оптимизации работы магазина
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Скоро появится</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              AI-анализ данных станет доступен в ближайшее время. 
              Мы работаем над улучшением алгоритмов для обеспечения более точных рекомендаций.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Ожидаемый запуск: скоро</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalysisSection;
