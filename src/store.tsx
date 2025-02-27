
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Store } from '@/types/store';
import { loadStores } from '@/utils/storeUtils';

interface StoreContextType {
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
  stores: Store[];
  updateStores: () => void;
}

const StoreContext = createContext<StoreContextType>({
  selectedStore: null,
  setSelectedStore: () => {},
  stores: [],
  updateStores: () => {}
});

export const useStore = () => useContext(StoreContext);

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const updateStores = () => {
    const loadedStores = loadStores();
    setStores(loadedStores);
    
    // Автоматически выбираем магазин, если он выбран в списке
    const selected = loadedStores.find(store => store.isSelected);
    if (selected) {
      setSelectedStore(selected);
    } else if (loadedStores.length > 0 && !selectedStore) {
      // Если нет выбранного, но есть магазины, выбираем первый
      setSelectedStore(loadedStores[0]);
    }
  };

  useEffect(() => {
    updateStores();
  }, []);

  return (
    <StoreContext.Provider value={{ selectedStore, setSelectedStore, stores, updateStores }}>
      {children}
    </StoreContext.Provider>
  );
};
