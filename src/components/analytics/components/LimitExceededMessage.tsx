
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const LimitExceededMessage = () => {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4 mr-2" />
      <AlertTitle>Превышен лимит запросов</AlertTitle>
      <AlertDescription>
        Вы превысили лимит запросов к API. Пожалуйста, подождите некоторое время и попробуйте снова.
      </AlertDescription>
    </Alert>
  );
};

export default LimitExceededMessage;
