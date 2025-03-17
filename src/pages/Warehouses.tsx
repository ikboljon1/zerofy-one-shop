
import React, { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { WarehouseProvider } from '@/contexts/WarehouseContext';
import LimitExceededMessage from '@/components/analytics/components/LimitExceededMessage';
import { ensureStoreSelectionPersistence } from '@/utils/storeUtils';
import { Store as StoreType } from '@/types/store';
import NoStoreSelectedCard from '@/components/warehouses/NoStoreSelectedCard';
import WarehouseTabs from '@/components/warehouses/WarehouseTabs';
import WarehouseMap from '@/components/WarehouseMap';

const Warehouses: React.FC = () => {
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [showHelpGuide, setShowHelpGuide] = useState(
    localStorage.getItem('warehouses_seen_help') !== 'true'
  );

  useEffect(() => {
    const stores = ensureStoreSelectionPersistence();
    const selected = stores.find(store => store.isSelected);
    
    if (selected) {
      setSelectedStore(selected);
    } else if (stores.length > 0) {
      setSelectedStore(stores[0]);
    }
  }, []);

  useEffect(() => {
    if (showHelpGuide) {
      const timer = setTimeout(() => {
        localStorage.setItem('warehouses_seen_help', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showHelpGuide]);

  return (
    <WarehouseProvider>
      <div className="container px-4 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Управление складами и логистикой
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-1">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="max-w-xs">
                    Здесь вы управляете запасами, планируете поставки и анализируете затраты на хранение
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h1>
        </div>

        {showHelpGuide && (
          <div className="mb-4">
            <LimitExceededMessage
              title="Руководство по работе со складами"
              message="Здесь вы можете управлять запасами товаров, планировать поставки и анализировать затраты на хранение."
              onRefresh={() => setShowHelpGuide(false)}
              isLoading={false}
            />
          </div>
        )}

        {!selectedStore ? (
          <NoStoreSelectedCard />
        ) : (
          <>
            <WarehouseTabs selectedStore={selectedStore} />
            <div className="mt-8">
              <WarehouseMap className="mt-6" />
            </div>
          </>
        )}
      </div>
    </WarehouseProvider>
  );
};

export default Warehouses;
