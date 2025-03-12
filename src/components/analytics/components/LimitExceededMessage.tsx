
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LimitExceededMessageProps {
  onRefresh: () => void;
  isLoading?: boolean;
  message?: string;
  title?: string;
}

const LimitExceededMessage: React.FC<LimitExceededMessageProps> = ({
  onRefresh,
  isLoading = false,
  message = "Превышен лимит запросов к API. Пожалуйста, повторите попытку позже или обновите данные из кэша.",
  title = "Превышен лимит запросов"
}) => {
  return (
    <Card className="border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-xl font-semibold text-amber-700 dark:text-amber-400 mb-2">{title}</h3>
          <p className="text-amber-600 dark:text-amber-300 mb-6 max-w-md">
            {message}
          </p>
          <Button
            variant="outline"
            className="border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900"
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
        </div>
      </CardContent>
    </Card>
  );
};

export default LimitExceededMessage;
