
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface APIKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
  isLoading?: boolean;
  message?: string;
  error?: string;
}

const APIKeyInput: React.FC<APIKeyInputProps> = ({ onApiKeySubmit, isLoading = false, message, error }) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      // Save to localStorage so it persists between refreshes
      localStorage.setItem('wb_api_key', apiKey);
      onApiKeySubmit(apiKey);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  // Check if there's a saved key in localStorage
  React.useEffect(() => {
    const savedKey = localStorage.getItem('wb_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <KeyRound className="mr-2 h-5 w-5" />
          API-ключ Wildberries
        </CardTitle>
        <CardDescription>
          {message || "Введите API-ключ от личного кабинета Wildberries для получения данных об остатках"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid gap-4">
            <Input
              type="password"
              placeholder="Введите API-ключ..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            {error ? (
              <Alert variant="destructive" className="bg-red-900/20 border-red-800/30 text-red-300">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <Alert variant="default" className="bg-yellow-900/20 border-yellow-800/30 text-yellow-300">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription>
                  Рекомендуется выбрать магазин в разделе "Магазины" вместо ручного ввода ключа
                </AlertDescription>
              </Alert>
            )}
            <p className="text-xs text-muted-foreground">
              API-ключ можно получить в личном кабинете Wildberries в разделе "Настройки &gt; Доступ к API".
              Ключ должен иметь доступ к категории "Аналитика".
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading || !apiKey.trim() || saved}>
            {isLoading ? (
              <>Загрузка...</>
            ) : saved ? (
              <>Сохранено ✓</>
            ) : (
              <>Сохранить ключ</>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default APIKeyInput;
