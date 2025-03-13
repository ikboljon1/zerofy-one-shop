
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Store } from '@/types/store';
import { getSelectedStore } from '@/utils/storeUtils';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StoreApiKeyContextType {
  apiKey: string;
  isLoading: boolean;
  store: Store | null;
}

const StoreApiKeyContext = createContext<StoreApiKeyContextType>({
  apiKey: '',
  isLoading: true,
  store: null,
});

export const useStoreApiKey = () => useContext(StoreApiKeyContext);

interface StoreApiKeyProviderProps {
  children: React.ReactNode;
}

const StoreApiKeyProvider: React.FC<StoreApiKeyProviderProps> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadSelectedStore = () => {
      const selectedStore = getSelectedStore();
      setStore(selectedStore);
      
      if (selectedStore && selectedStore.apiKey) {
        setApiKey(selectedStore.apiKey);
      } else {
        // Fallback to localStorage for backwards compatibility
        const savedKey = localStorage.getItem('wb_api_key');
        if (savedKey) {
          setApiKey(savedKey);
        }
      }
      
      setIsLoading(false);
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
    <StoreApiKeyContext.Provider value={{ apiKey, isLoading, store }}>
      {children}
    </StoreApiKeyContext.Provider>
  );
};

export default StoreApiKeyProvider;
