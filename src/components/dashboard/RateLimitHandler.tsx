
import React from 'react';
import { AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface RateLimitHandlerProps {
  isVisible: boolean;
  onRetry: () => void;
  isRetrying: boolean;
  retryCount: number;
  nextRetryTime?: Date;
}

const RateLimitHandler: React.FC<RateLimitHandlerProps> = ({
  isVisible,
  onRetry,
  isRetrying,
  retryCount,
  nextRetryTime
}) => {
  const [timeLeft, setTimeLeft] = React.useState<number>(0);
  
  React.useEffect(() => {
    if (!nextRetryTime) return;
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = nextRetryTime.getTime() - now.getTime();
      return Math.max(0, Math.floor(difference / 1000));
    };
    
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [nextRetryTime]);
  
  if (!isVisible) return null;
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getBackoffMessage = () => {
    if (retryCount === 0) return "";
    if (retryCount === 1) return "Первая попытка не удалась. Пробуем еще раз...";
    if (retryCount === 2) return "Вторая попытка не удалась. Увеличиваем интервал ожидания...";
    return `Попытка ${retryCount} не удалась. Пожалуйста, подождите перед следующей попыткой.`;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <Card className="border-amber-300 dark:border-amber-800 bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-950/50 dark:to-slate-900/80 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertCircle className="h-5 w-5" />
            Превышен лимит запросов API Wildberries
          </CardTitle>
          <CardDescription>
            API Wildberries временно ограничило доступ из-за слишком большого количества запросов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              {getBackoffMessage()}
            </p>
            
            {nextRetryTime && timeLeft > 0 && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mt-2">
                <Clock className="h-4 w-4" />
                <span>Следующая попытка через: {formatTime(timeLeft)}</span>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground mt-2">
              Система автоматически повторит запрос с увеличивающимся интервалом ожидания.
              Во время ожидания будут использоваться кешированные данные.
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline"
            className="mr-2"
            onClick={onRetry}
            disabled={isRetrying || (timeLeft > 0)}
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Повторная попытка...
              </>
            ) : timeLeft > 0 ? (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Ожидание ({formatTime(timeLeft)})
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Повторить попытку
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default RateLimitHandler;
