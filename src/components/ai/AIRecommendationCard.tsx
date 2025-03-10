
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, LightbulbIcon, ShoppingCart, TrendingUp, DollarSign, Award } from "lucide-react";
import { AIRecommendation } from "@/types/ai";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface AIRecommendationCardProps {
  recommendation: AIRecommendation;
  onDismiss?: (id: string) => void;
}

const AIRecommendationCard = ({ recommendation, onDismiss }: AIRecommendationCardProps) => {
  const getIcon = () => {
    switch (recommendation.category) {
      case 'sales':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'expenses':
        return <DollarSign className="h-4 w-4 text-red-500" />;
      case 'products':
        return <ShoppingCart className="h-4 w-4 text-blue-500" />;
      case 'advertising':
        return <Award className="h-4 w-4 text-amber-500" />;
      default:
        return <LightbulbIcon className="h-4 w-4 text-violet-500" />;
    }
  };

  const getImportanceColor = () => {
    switch (recommendation.importance) {
      case 'high':
        return "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300";
      case 'medium':
        return "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/20 dark:text-amber-300";
      case 'low':
        return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300";
    }
  };

  const getCategoryLabel = () => {
    switch (recommendation.category) {
      case 'sales':
        return "Продажи";
      case 'expenses':
        return "Расходы";
      case 'products':
        return "Товары";
      case 'advertising':
        return "Реклама";
      default:
        return "Общее";
    }
  };

  const getImportanceLabel = () => {
    switch (recommendation.importance) {
      case 'high':
        return "Высокая";
      case 'medium':
        return "Средняя";
      case 'low':
        return "Низкая";
    }
  };

  const timeAgo = formatDistanceToNow(new Date(recommendation.timestamp), { 
    addSuffix: true, 
    locale: ru 
  });

  return (
    <Card className="border-l-4 shadow-sm hover:shadow transition-shadow" 
      style={{ borderLeftColor: recommendation.importance === 'high' ? '#ef4444' : recommendation.importance === 'medium' ? '#f59e0b' : '#22c55e' }}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-base">{recommendation.title}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className={getImportanceColor()}>
              {getImportanceLabel()}
            </Badge>
            <Badge variant="outline">
              {getCategoryLabel()}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          {timeAgo}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{recommendation.description}</p>
      </CardContent>
      {(recommendation.actionable || onDismiss) && (
        <CardFooter className="flex justify-end gap-2 pt-0">
          {onDismiss && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDismiss(recommendation.id)}
            >
              Скрыть
            </Button>
          )}
          {recommendation.actionable && recommendation.action && (
            <Button size="sm">
              {recommendation.action}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default AIRecommendationCard;
