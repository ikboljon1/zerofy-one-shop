
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, AlertTriangle, Info, AlertCircle, Loader2, Brain, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIRecommendation } from "@/services/aiAnalysisService";

interface AIRecommendationsProps {
  recommendations: AIRecommendation[];
  isLoading: boolean;
  onRefresh: () => void;
  aiModelError?: string | null;
}

const AIRecommendations = ({ recommendations, isLoading, onRefresh, aiModelError }: AIRecommendationsProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("all");
  
  const getIconForType = (type: string) => {
    switch (type) {
      case 'success':
        return <Lightbulb className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getBgColorForType = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30';
      case 'error':
        return 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30';
      default:
        return 'bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30';
    }
  };
  
  const getBadgeColorForCategory = (category: string) => {
    switch (category) {
      case 'sales':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'products':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'expenses':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'warehouses':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
    }
  };
  
  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'sales':
        return 'Продажи';
      case 'products':
        return 'Товары';
      case 'expenses':
        return 'Расходы';
      case 'warehouses':
        return 'Склады';
      default:
        return 'Общее';
    }
  };
  
  const filteredRecommendations = activeTab === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === activeTab);

  const categories = ['all', ...new Set(recommendations.map(r => r.category))];
  
  if (isLoading) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg font-medium">Анализируем ваши данные...</p>
          <p className="text-sm text-muted-foreground mt-2">Пожалуйста, подождите. Это может занять несколько секунд.</p>
        </div>
      </Card>
    );
  }
  
  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="w-full h-[200px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Нет доступных рекомендаций</p>
          <p className="text-sm text-muted-foreground mt-2">
            Пожалуйста, обновите данные или выберите другой период для анализа.
          </p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={onRefresh}
          >
            Обновить анализ
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI-рекомендации</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh} 
            className="px-2.5"
          >
            Обновить
          </Button>
        </div>
        <CardDescription>
          Персонализированные рекомендации на основе анализа ваших данных
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center mb-4">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground mr-3">Фильтр:</span>
            <TabsList>
              <TabsTrigger value="all" className="text-xs">Все</TabsTrigger>
              {categories.filter(c => c !== 'all').map(category => (
                <TabsTrigger key={category} value={category} className="text-xs">
                  {getCategoryTitle(category)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-4">
                {filteredRecommendations.map((rec, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${getBgColorForType(rec.type)}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {getIconForType(rec.type)}
                        <h3 className="font-medium">{rec.title}</h3>
                      </div>
                      <Badge className={getBadgeColorForCategory(rec.category)}>
                        {getCategoryTitle(rec.category)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{rec.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-5 px-6">
        <p className="text-sm text-muted-foreground">
          Данные обновлены: {new Date().toLocaleString()}
        </p>
      </CardFooter>
    </Card>
  );
};

export default AIRecommendations;
