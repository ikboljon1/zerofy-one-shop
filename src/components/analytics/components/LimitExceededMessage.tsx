
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LimitExceededMessageProps {
  onUpgrade?: () => void;
}

const LimitExceededMessage: React.FC<LimitExceededMessageProps> = ({ onUpgrade }) => {
  return (
    <Card className="border-2 border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-500">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
          Превышен лимит аналитики
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-yellow-700 dark:text-yellow-400">
          Вы достигли лимита по количеству запросов аналитики для вашего текущего тарифа. 
          Для доступа к полной аналитике, пожалуйста, обновите ваш тарифный план.
        </p>
        
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            className="bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-700"
            onClick={onUpgrade}
          >
            Обновить тариф
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LimitExceededMessage;
