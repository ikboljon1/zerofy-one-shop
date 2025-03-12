
import { Store } from "@/types/store";
import { StoreCard } from "./StoreCard";

interface StoresGridProps {
  stores: Store[];
  onToggleSelection: (id: string) => void;
  onDelete: (id: string) => void;
  onRefreshStats: (store: Store) => void;
  isLoading: boolean;
  canDelete: boolean;
}

export function StoresGrid({ 
  stores, 
  onToggleSelection, 
  onDelete, 
  onRefreshStats,
  isLoading,
  canDelete 
}: StoresGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stores.map((store) => (
        <StoreCard
          key={store.id}
          store={store}
          onToggleSelection={onToggleSelection}
          onDelete={onDelete}
          onRefreshStats={onRefreshStats}
          isLoading={isLoading}
          canDelete={canDelete}
        />
      ))}
    </div>
  );
}
