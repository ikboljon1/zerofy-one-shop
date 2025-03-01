import { useEffect, useState } from "react";
import { Store } from "@/types/store";
import { loadStores } from "@/utils/storeUtils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StoresProps {
  onStoreSelect?: (store: Store) => void;
}

const Stores = ({ onStoreSelect }: StoresProps) => {
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    const loadedStores = loadStores();
    setStores(loadedStores);
  }, []);

  const handleSelectStore = (store: Store) => {
    if (onStoreSelect) {
      onStoreSelect(store);
    }
  };

  return (
    <div className="space-y-4">
      {stores.map((store) => (
        <Card key={store.id} className="flex justify-between items-center p-4">
          <div>
            <h3 className="text-lg font-semibold">{store.name}</h3>
            <p className="text-sm text-muted-foreground">{store.marketplace}</p>
          </div>
          <Button onClick={() => handleSelectStore(store)}>Выбрать</Button>
        </Card>
      ))}
    </div>
  );
};

export default Stores;
