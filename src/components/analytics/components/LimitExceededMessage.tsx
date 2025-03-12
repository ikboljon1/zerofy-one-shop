
import React from 'react';
import { AlertTriangle, RefreshCw, Coffee, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface LimitExceededMessageProps {
  onRefresh: () => void;
  isLoading?: boolean;
  message?: string;
  title?: string;
}

const LimitExceededMessage: React.FC<LimitExceededMessageProps> = ({
  onRefresh,
  isLoading = false,
  message = "Превышен лимит запросов к API Wildberries. Пожалуйста, повторите попытку через несколько минут или используйте кешированные данные.",
  title = "Превышен лимит запросов"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-amber-300 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/50 dark:to-slate-900/80 shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-6">
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
                <AlertTriangle className="h-16 w-16 text-amber-500" />
              </motion.div>
              <div className="absolute -bottom-2 -right-2">
                <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-amber-700 dark:text-amber-400 mb-3">{title}</h3>
            
            <p className="text-amber-600 dark:text-amber-300 mb-4 max-w-md">
              {message}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Button
                variant="outline"
                className="border-amber-300 bg-white/80 dark:border-amber-700 dark:bg-slate-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all duration-300"
                onClick={onRefresh}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Обновление...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Обновить данные
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all duration-300"
                onClick={() => {
                  // Используем кешированные данные
                  onRefresh();
                }}
                disabled={isLoading}
              >
                <Coffee className="h-4 w-4 mr-2" />
                Использовать кеш
              </Button>
            </div>
            
            <div className="mt-6 text-xs text-amber-500/70 dark:text-amber-500/50">
              Кешированные данные позволят вам продолжить работу без ожидания
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LimitExceededMessage;
