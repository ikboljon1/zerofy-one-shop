import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Check, ExternalLink, AlertTriangle, TrendingUp, DollarSign, ShoppingBag, Megaphone, Info, Clock, Calendar } from "lucide-react";
import { AIRecommendation } from "@/types/ai";
import { Badge } from "@/components/ui/badge";

interface AIRecommendationCardProps {
  recommendation?: AIRecommendation;
  onDismiss?: (id: string) => void;
  compact?: boolean;
  comingSoon?: boolean;
}

const AIRecommendationCard = ({ recommendation, onDismiss, compact = false, comingSoon = false }: AIRecommendationCardProps) => {
  const [showActions, setShowActions] = useState(false);
  
  // Coming soon display mode
  if (comingSoon) {
    if (compact) {
      return (
        <div className="p-3 border rounded-lg bg-card hover:shadow-sm transition-shadow">
          <div className="flex gap-2">
            <div className="p-1.5 rounded-full self-start bg-purple-100 text-purple-700">
              <Clock className="h-4 w-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">Скоро появится</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                AI-анализ данных станет доступен в ближайшее время
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-12 h-12 mb-3 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Скоро появится</h3>
            <p className="text-muted-foreground max-w-md mb-4">
              AI-анализ данных станет доступен в ближайшее время. Мы работаем над улучшением алгоритмов для обеспечения более точных рекомендаций.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Ожидаемый запуск: скоро</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // If no recommendation provided, return nothing
  if (!recommendation) {
    return null;
  }
  
  // Format timestamp to readable date
  const formattedDate = new Date(recommendation.timestamp).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Select icon based on category
  const getIcon = () => {
    switch (recommendation.category) {
      case 'sales':
        return <TrendingUp className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />;
      case 'expenses':
        return <DollarSign className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />;
      case 'products':
        return <ShoppingBag className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />;
      case 'advertising':
        return <Megaphone className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />;
      default:
        return <Info className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />;
    }
  };
  
  // Get color for importance
  const getImportanceColor = () => {
    switch (recommendation.importance) {
      case 'high':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    }
  };

  
  if (compact) {
    return (
      <div className="p-3 border rounded-lg bg-card hover:shadow-sm transition-shadow">
        <div className="flex gap-2">
          <div className={`p-1.5 rounded-full self-start ${
            recommendation.category === 'sales' ? 'bg-blue-100 text-blue-700' :
            recommendation.category === 'expenses' ? 'bg-red-100 text-red-700' :
            recommendation.category === 'products' ? 'bg-green-100 text-green-700' :
            recommendation.category === 'advertising' ? 'bg-purple-100 text-purple-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-sm truncate">{recommendation.title}</h3>
              <Badge variant="outline" className={`${getImportanceColor()} text-xs shrink-0`}>
                {recommendation.importance === 'high' ? 'Важно' : 
                 recommendation.importance === 'medium' ? 'Средне' : 'Низко'}
              </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{recommendation.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${
            recommendation.category === 'sales' ? 'bg-blue-100 text-blue-700' :
            recommendation.category === 'expenses' ? 'bg-red-100 text-red-700' :
            recommendation.category === 'products' ? 'bg-green-100 text-green-700' :
            recommendation.category === 'advertising' ? 'bg-purple-100 text-purple-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {getIcon()}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-lg">{recommendation.title}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getImportanceColor()}>
                  {recommendation.importance === 'high' ? 'Важно' : 
                   recommendation.importance === 'medium' ? 'Средне' : 'Низко'}
                </Badge>
                {onDismiss && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => onDismiss(recommendation.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <p className="text-muted-foreground mb-2">{recommendation.description}</p>
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground">{formattedDate}</span>
              
              {recommendation.actionable && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8" 
                  onClick={() => setShowActions(!showActions)}
                >
                  {showActions ? 'Скрыть действия' : 'Показать действия'}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {recommendation.actionable && showActions && recommendation.action && (
          <div className="mt-4 p-3 bg-muted rounded-md border">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <p className="text-sm font-medium">Рекомендуемое действие:</p>
            </div>
            <p className="text-sm text-muted-foreground ml-7">{recommendation.action}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRecommendationCard;
