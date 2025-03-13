
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound, ArrowRight, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useStoreApiKey } from './StoreApiKeyProvider';

interface APIKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
  isLoading?: boolean;
  message?: string;
}

const APIKeyInput: React.FC<APIKeyInputProps> = ({ onApiKeySubmit, isLoading = false, message }) => {
  const { apiKey, store, error } = useStoreApiKey();

  useEffect(() => {
    if (apiKey) {
      onApiKeySubmit(apiKey);
    }
  }, [apiKey, onApiKeySubmit]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <KeyRound className="mr-2 h-5 w-5" />
          API-ключ Wildberries
        </CardTitle>
        <CardDescription>
          {message || "Используется API-ключ выбранного магазина для получения данных"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          ) : store ? (
            <Alert variant="default" className="bg-green-900/20 border-green-800/30 text-green-300">
              <KeyRound className="h-4 w-4 text-green-500" />
              <AlertDescription>
                Используется API-ключ магазина: <strong>{store.name}</strong>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="default" className="bg-yellow-900/20 border-yellow-800/30 text-yellow-300">
              <ArrowRight className="h-4 w-4 text-yellow-500" />
              <AlertDescription>
                Выберите магазин в разделе "Магазины" для автоматического использования API-ключа
              </AlertDescription>
            </Alert>
          )}
          <p className="text-xs text-muted-foreground">
            API-ключ можно получить в личном кабинете Wildberries в разделе "Настройки &gt; Доступ к API".
            Ключ должен иметь доступ к категории "Аналитика".
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default APIKeyInput;
