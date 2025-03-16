
import React from 'react';
import { AlertTriangle, RefreshCw, Coffee, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface LimitExceededMessageProps {
  onRefresh: () => void;
  isLoading?: boolean;
  message?: string;
  title?: string;
  retryAfter?: number; // Time in seconds until next retry
  retryCount?: number; // Number of retry attempts made
}

const LimitExceededMessage: React.FC<LimitExceededMessageProps> = ({
  onRefresh,
  isLoading = false,
  message = "Превышен лимит запросов к API Wildberries. Пожалуйста, повторите попытку через несколько минут или используйте кешированные данные.",
  title = "Превышен лимит запросов",
  retryAfter,
  retryCount = 0
}) => {
  const [timeLeft, setTimeLeft] = React.useState<number>(retryAfter || 0);
  
  React.useEffect(() => {
    if (!retryAfter) return;
    
    setTimeLeft(retryAfter);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [retryAfter]);
  
  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getBackoffMessage = () => {
    if (retryCount === 0) return "";
    if (retryCount === 1) return "Первая попытка не удалась. Пробуем еще раз через некоторое время.";
    if (retryCount === 2) return "Вторая попытка не удалась. Увеличиваем интервал ожидания.";
    return `Попытка ${retryCount} не удалась. Пожалуйста, подождите ${formatTime(timeLeft)} перед следующей попыткой.`;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-amber-300 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/50 dark:to-slate-900/80 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {title}
          </CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-2 text-center">
            <div className="relative mb-4">
              <motion.div
                animate={{ 
                  rotate: [0, 10, 0, -10, 0],
                  scale: [1, 1.05, 1, 1.05, 1] 
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                <AlertTriangle className="h-12 w-12 text-amber-500" />
              </motion.div>
              {timeLeft > 0 && (
                <div className="absolute -bottom-2 -right-2">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              )}
            </div>
            
            {retryCount > 0 && (
              <p className="text-amber-600 dark:text-amber-300 mb-3">
                {getBackoffMessage()}
              </p>
            )}
            
            {timeLeft > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="text-lg font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded">
                  {formatTime(timeLeft)}
                </div>
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  до следующей попытки
                </span>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              API Wildberries ограничивает количество запросов в минуту. Система автоматически повторит запрос после истечения времени ожидания.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Button
                variant="outline"
                className="border-amber-300 bg-white/80 dark:border-amber-700 dark:bg-slate-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all duration-300"
                onClick={onRefresh}
                disabled={isLoading || timeLeft > 0}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Обновление...
                  </>
                ) : timeLeft > 0 ? (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Ожидание ({formatTime(timeLeft)})
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Повторить сейчас
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all duration-300"
                onClick={() => {
                  onRefresh();
                }}
                disabled={isLoading}
              >
                <Coffee className="h-4 w-4 mr-2" />
                Использовать кеш
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-amber-500/70 dark:text-amber-500/50 justify-center">
          Кешированные данные позволят вам продолжить работу без ожидания
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default LimitExceededMessage;
