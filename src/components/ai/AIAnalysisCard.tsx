
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AIAnalysisResponse } from '@/types/ai';
import { Brain, Clock, AlertTriangle, CheckCircle, Lightbulb, ThumbsUp } from 'lucide-react';

interface AIAnalysisCardProps {
  analysis: AIAnalysisResponse;
}

export default function AIAnalysisCard({ analysis }: AIAnalysisCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getImpactBadge = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Высокое влияние</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Среднее влияние</Badge>;
      case 'low':
        return <Badge variant="outline">Низкое влияние</Badge>;
    }
  };
  
  const getDifficultyBadge = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy':
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">Легко</Badge>;
      case 'medium':
        return <Badge variant="outline">Средне</Badge>;
      case 'hard':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Сложно</Badge>;
    }
  };
  
  const getTimeframeBadge = (timeframe: 'immediate' | 'short-term' | 'long-term') => {
    switch (timeframe) {
      case 'immediate':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">Немедленно</Badge>;
      case 'short-term':
        return <Badge variant="outline">Краткосрочно</Badge>;
      case 'long-term':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">Долгосрочно</Badge>;
    }
  };
  
  const getImportanceBadge = (importance: 'high' | 'medium' | 'low') => {
    switch (importance) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Важно</Badge>;
      case 'medium':
        return <Badge variant="outline">Средне</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">Низкая важность</Badge>;
    }
  };
  
  return (
    <Card className="overflow-hidden border-gradient-to-r border-indigo-200 dark:border-indigo-950/60">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <CardTitle>Анализ данных с помощью ИИ</CardTitle>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            {formatDate(analysis.timestamp)}
          </div>
        </div>
        <CardDescription>
          Анализ проведен с использованием {analysis.metadata.provider} {analysis.metadata.model}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="font-medium text-lg mb-2">Краткое резюме</h3>
          <p className="text-gray-700 dark:text-gray-300">{analysis.analysis.summary}</p>
        </div>
        
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="insights" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Инсайты
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="gap-2">
              <ThumbsUp className="h-4 w-4" />
              Рекомендации
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights">
            <div className="space-y-4">
              {analysis.analysis.insights.map((insight, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/60">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{insight.title}</h4>
                    <div className="flex space-x-2">
                      {getImportanceBadge(insight.importance)}
                      {insight.actionable && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Действенный</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{insight.description}</p>
                  {insight.action && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                      <CheckCircle className="h-4 w-4" />
                      <span>{insight.action}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="recommendations">
            <div className="space-y-4">
              {analysis.analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/60">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{recommendation.title}</h4>
                    <div className="flex flex-wrap gap-2">
                      {getImpactBadge(recommendation.impact)}
                      {getDifficultyBadge(recommendation.difficulty)}
                      {getTimeframeBadge(recommendation.timeframe)}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{recommendation.description}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="bg-gray-50 dark:bg-gray-900/30 flex justify-between text-sm text-muted-foreground px-6 py-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>Результаты анализа ИИ носят рекомендательный характер</span>
        </div>
        <div>
          Токенов: {analysis.metadata.tokensUsed} • Время: {analysis.metadata.processingTime}с
        </div>
      </CardFooter>
    </Card>
  );
}
