
import { useState } from "react";
import { ShoppingBag, Package2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddStoreDialog } from "./stores/AddStoreDialog";
import { EmptyStoreState } from "./stores/EmptyStoreState";
import { StoresGrid } from "./stores/StoresGrid";
import { useStores } from "@/hooks/useStores";

interface StoresProps {
  onStoreSelect?: (store: { id: string; apiKey: string }) => void;
}

export default function Stores({ onStoreSelect }: StoresProps) {
  const {
    stores,
    isLoading,
    canDeleteStores,
    storeLimit,
    handleAddStore,
    handleToggleSelection,
    handleRefreshStats,
    handleDeleteStore,
  } = useStores(onStoreSelect);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Магазины</h2>
          <Badge variant="outline" className="flex items-center gap-1.5 ml-2 bg-blue-950/30 text-blue-400 border-blue-800">
            <Package2 className="h-3.5 w-3.5" />
            <span>{stores.length}/{storeLimit}</span>
          </Badge>
        </div>
        <AddStoreDialog
          isOpen={isOpen}
          isLoading={isLoading}
          onOpenChange={setIsOpen}
          onAddStore={handleAddStore}
          storeCount={stores.length}
          storeLimit={storeLimit}
        />
      </div>

      {stores.length === 0 ? (
        <EmptyStoreState storeLimit={storeLimit} />
      ) : (
        <StoresGrid
          stores={stores}
          onToggleSelection={handleToggleSelection}
          onDelete={handleDeleteStore}
          onRefreshStats={handleRefreshStats}
          isLoading={isLoading}
          canDelete={canDeleteStores}
        />
      )}
    </div>
  );
}
