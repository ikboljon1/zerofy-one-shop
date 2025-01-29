import { useState } from "react";
import { Package } from "lucide-react";
import ProductsList from "@/components/ProductsList";

const Products = () => {
  const [selectedStore, setSelectedStore] = useState<{id: string; apiKey: string} | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5" />
        <h1 className="text-2xl font-semibold">Товары</h1>
      </div>
      
      <ProductsList selectedStore={selectedStore} />
    </div>
  );
};

export default Products;