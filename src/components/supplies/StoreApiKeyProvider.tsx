
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Store } from '@/types/store';
import { getSelectedStore } from '@/utils/storeUtils';
import { Button } from '@/components/ui/button';
import { AlertTriangle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

interface StoreApiKeyContextType {
  apiKey: string;
  isLoading: boolean;
  store: Store | null;
  error: string | null;
}

const StoreApiKeyContext = createContext<StoreApiKeyContextType>({
  apiKey: '',
  isLoading: true,
  store: null,
  error: null
});

export const useStoreApiKey = () => useContext(StoreApiKeyContext);

interface StoreApiKeyProviderProps {
  children: React.ReactNode;
}

const StoreApiKeyProvider: React.FC<StoreApiKeyProviderProps> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSelectedStore = () => {
      try {
        const selectedStore = getSelectedStore();
        setStore(selectedStore);
        
        if (selectedStore && selectedStore.apiKey) {
          setApiKey(selectedStore.apiKey);
          setError(null);
        } else {
          // Fallback to localStorage for backwards compatibility
          const savedKey = localStorage.getItem('wb_api_key');
          if (savedKey) {
            setApiKey(savedKey);
            setError(null);
          } else {
            setError('Не выбран магазин или отсутствует API-ключ');
          }
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных магазина:', err);
        setError('Не удалось загрузить данные магазина');
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные магазина",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSelectedStore();

    // Listen for store selection changes
    const handleStoreUpdate = () => {
      loadSelectedStore();
    };

    window.addEventListener('stores-updated', handleStoreUpdate);
    window.addEventListener('store-selection-changed', handleStoreUpdate);

    return () => {
      window.removeEventListener('stores-updated', handleStoreUpdate);
      window.removeEventListener('store-selection-changed', handleStoreUpdate);
    };
  }, []);

  if (error && !isLoading) {
    return (
      <Alert variant="destructive" className="my-4">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          {error}. Для работы с этим разделом необходимо выбрать магазин Wildberries в разделе "Магазины".
          <Button 
            variant="link" 
            className="text-destructive-foreground p-0 h-auto ml-2 underline"
            onClick={() => window.location.href = '/dashboard'}
          >
            Перейти к выбору магазина
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!apiKey && !isLoading) {
    return (
      <Alert variant="default" className="bg-yellow-900/20 border-yellow-800/30 text-yellow-300 my-4">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertDescription>
          Для работы с этим разделом необходимо выбрать магазин Wildberries в разделе "Магазины".
          <Button 
            variant="link" 
            className="text-yellow-400 p-0 h-auto ml-2"
            onClick={() => window.location.href = '/dashboard'}
          >
            Перейти к выбору магазина
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <StoreApiKeyContext.Provider value={{ apiKey, isLoading, store, error }}>
      {children}
    </StoreApiKeyContext.Provider>
  );
};

export default StoreApiKeyProvider;
