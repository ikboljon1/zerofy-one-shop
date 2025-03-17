
import React from 'react';
import { AlertTriangle, RefreshCw, Coffee, Clock, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
      initial={{
        opacity: 0,
        y: -10
      }} 
      animate={{
        opacity: 1,
        y: 0
      }} 
      transition={{
        duration: 0.3
      }}
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-amber-500">
            <AlertTriangle className="mr-2 h-5 w-5" />
            {title}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-2">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    API Wildberries имеет лимиты на количество запросов. Когда лимит превышен, 
                    мы показываем демо-данные для демонстрации функциональности.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeLeft > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Следующая попытка через: {formatTime(timeLeft)}</span>
              </div>
            )}
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-medium flex items-center">
                <Coffee className="mr-2 h-4 w-4" />
                Руководство по работе с данными
              </h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-medium">1.</span>
                  <span>При превышении лимита API показываются демо-данные для демонстрации функций</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-medium">2.</span>
                  <span>Для анализа рентабельности перейдите в раздел "Инвентарь" и проверьте таблицу</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-medium">3.</span>
                  <span>Для планирования поставок используйте раздел "Поставки" и анализируйте коэффициенты</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-medium">4.</span>
                  <span>Отчеты о платном хранении находятся в разделе "Хранение"</span>
                </li>
              </ul>
            </div>
            
            {getBackoffMessage() && (
              <div className="text-sm text-muted-foreground">
                {getBackoffMessage()}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={onRefresh} 
            disabled={isLoading || timeLeft > 0} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Обновление...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Повторить запрос
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default LimitExceededMessage;
