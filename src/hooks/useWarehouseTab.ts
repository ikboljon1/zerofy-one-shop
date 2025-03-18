
import { useState, useCallback } from 'react';

type WarehouseTab = 'inventory' | 'supplies' | 'storage';

export const useWarehouseTab = () => {
  const [activeTab, setActiveTab] = useState<WarehouseTab>('inventory');

  const handleTabChange = useCallback((tab: WarehouseTab) => {
    setActiveTab(tab);
  }, []);

  return {
    activeTab,
    handleTabChange
  };
};
