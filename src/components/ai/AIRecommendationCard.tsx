
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIRecommendation } from "@/types/ai";
import { CircleAlert, CircleCheck, Lightbulb, X, AlertTriangle, TrendingUp, Package, Receipt, BanknoteIcon, Megaphone } from "lucide-react";

interface AIRecommendationCardProps {
  recommendation: AIRecommendation;
  onDismiss?: (id: string) => void;
  compact?: boolean;
}

const AIRecommendationCard = ({ recommendation, onDismiss, compact = false }: AIRecommendationCardProps) => {
  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'text-red-500 bg-red-100 dark:bg-red-900/20';
      case 'medium':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low':
        return 'text-green-500 bg-green-100 dark:bg-green-900/20';
      default:
        return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sales':
        return <TrendingUp className="h-4 w-4" />;
      case 'products':
        return <Package className="h-4 w-4" />;
      case 'expenses':
        return <Receipt className="h-4 w-4" />;
      case 'advertising':
        return <Megaphone className="h-4 w-4" />;
      case 'general':
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };
  
  const getCategoryText = (category: string) => {
    switch (category) {
      case 'sales':
        return 'Продажи';
      case 'products':
        return 'Товары';
      case 'expenses':
        return 'Расходы';
      case 'advertising':
        return 'Реклама';
      case 'general':
      default:
        return 'Общее';
    }
  };

  const formattedDate = new Date(recommendation.timestamp).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  if (compact) {
    return (
      <Card className="overflow-hidden border relative">
        <div className={`absolute top-0 left-0 w-1 h-full ${recommendation.importance === 'high' ? 'bg-red-500' : recommendation.importance === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
        <CardContent className="p-3 pl-4">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h4 className="font-medium text-sm">{recommendation.title}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{recommendation.description}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Badge variant="outline" className="text-xs flex items-center gap-1 py-0">
                {getCategoryIcon(recommendation.category)}
                <span className="hidden sm:inline">{getCategoryText(recommendation.category)}</span>
              </Badge>
              {onDismiss && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => onDismiss(recommendation.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className={`h-1.5 w-full ${recommendation.importance === 'high' ? 'bg-red-500' : recommendation.importance === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{recommendation.title}</CardTitle>
          {onDismiss && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 -mr-2 -mt-2" 
              onClick={() => onDismiss(recommendation.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription className="flex items-center gap-2 pt-1">
          <Badge variant="outline" className="flex items-center gap-1 py-1">
            {getCategoryIcon(recommendation.category)}
            {getCategoryText(recommendation.category)}
          </Badge>
          <Badge 
            variant="outline" 
            className={`flex items-center gap-1 py-1 ${getImportanceColor(recommendation.importance)}`}
          >
            {recommendation.importance === 'high' ? (
              <AlertTriangle className="h-3.5 w-3.5" />
            ) : recommendation.importance === 'medium' ? (
              <CircleAlert className="h-3.5 w-3.5" />
            ) : (
              <CircleCheck className="h-3.5 w-3.5" />
            )}
            {recommendation.importance === 'high' 
              ? 'Высокий приоритет' 
              : recommendation.importance === 'medium' 
                ? 'Средний приоритет' 
                : 'Низкий приоритет'}
          </Badge>
          <span className="text-muted-foreground text-xs">{formattedDate}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{recommendation.description}</p>
      </CardContent>
      {recommendation.actionable && recommendation.action && (
        <CardFooter className="pt-0">
          <div className="w-full rounded-md bg-purple-50 dark:bg-purple-900/10 p-3 border border-purple-200 dark:border-purple-800">
            <div className="flex gap-2 items-start">
              <Lightbulb className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h5 className="font-medium text-sm mb-1">Рекомендуемое действие</h5>
                <p className="text-sm text-muted-foreground">{recommendation.action}</p>
              </div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default AIRecommendationCard;
