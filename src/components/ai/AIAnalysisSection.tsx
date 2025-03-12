
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Calendar, Clock, Lightbulb, TrendingUp, TrendingDown, PercentSquare, Wallet, PackageOpen, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIAnalysisSectionProps {
  storeId?: string;
  analyticsData?: any;
  dateFrom?: Date;
  dateTo?: Date;
}

const AIAnalysisSection = ({ storeId, analyticsData, dateFrom, dateTo }: AIAnalysisSectionProps = {}) => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border p-4 bg-muted/20">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <h3 className="font-medium">Анализ рентабельности хранения</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                AI анализирует данные о товарах с низкой оборачиваемостью и высокими затратами на хранение, предлагая оптимальные стратегии для увеличения доходности
              </p>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="flex flex-col items-center justify-center p-2 bg-background rounded-md">
                  <TrendingUp className="h-5 w-5 text-green-500 mb-1" />
                  <span className="text-xs font-medium">Высокая<br/>маржа</span>
                  <span className="text-sm font-bold text-green-500 mt-1">23.5%</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 bg-background rounded-md">
                  <Wallet className="h-5 w-5 text-amber-500 mb-1" />
                  <span className="text-xs font-medium">Затраты на<br/>хранение</span>
                  <span className="text-sm font-bold text-amber-500 mt-1">156.3K ₽</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 bg-background rounded-md">
                  <ShoppingCart className="h-5 w-5 text-blue-500 mb-1" />
                  <span className="text-xs font-medium">Медленные<br/>продажи</span>
                  <span className="text-sm font-bold text-blue-500 mt-1">18 ед/нед</span>
                </div>
              </div>
              
              <Button className="w-full" variant="outline" size="sm">
                Подробный отчет <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <div className="rounded-lg border p-4 bg-muted/20">
              <div className="flex items-center gap-2 mb-3">
                <PercentSquare className="h-5 w-5 text-blue-500" />
                <h3 className="font-medium">Рекомендации по ценообразованию</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Система предлагает оптимальные ценовые стратегии на основе анализа спроса, конкурентной среды и исторических данных о продажах
              </p>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center p-2 bg-background rounded-md">
                  <div className="flex items-center gap-2">
                    <PackageOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Футболка хлопковая летняя</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">-12%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 bg-background rounded-md">
                  <div className="flex items-center gap-2">
                    <PackageOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Кроссовки беговые</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">+8%</span>
                  </div>
                </div>
              </div>
              
              <Button className="w-full" variant="outline" size="sm">
                Все рекомендации <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalysisSection;
