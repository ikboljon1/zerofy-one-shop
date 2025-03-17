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
  return <motion.div initial={{
    opacity: 0,
    y: -10
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.3
  }}>
      
    </motion.div>;
};
export default LimitExceededMessage;