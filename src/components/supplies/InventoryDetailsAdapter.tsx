
import React from 'react';
import InventoryDetails from './InventoryDetails';
import { 
  WildberriesStock as ApiWildberriesStock,
  StocksByCategory as ApiStocksByCategory
} from '@/services/suppliesApi';
import {
  WildberriesStock as TypesWildberriesStock,
  StocksByCategory as TypesStocksByCategory
} from '@/types/supplies';

// Adapter component to convert API types to component-expected types
interface InventoryDetailsAdapterProps {
  stocks: ApiWildberriesStock[];
  categorySummary: ApiStocksByCategory[];
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
}

const InventoryDetailsAdapter: React.FC<InventoryDetailsAdapterProps> = ({
  stocks,
  categorySummary,
  selectedCategory,
  onSelectCategory
}) => {
  // Convert API WildberriesStock to component-expected format
  const adaptedStocks: TypesWildberriesStock[] = stocks.map(stock => ({
    lastChangeDate: stock.dateUpdate,
    warehouseName: stock.warehouse,
    supplierArticle: stock.article,
    nmId: parseInt(stock.id),
    barcode: stock.barcode,
    quantity: stock.quantity,
    inWayToClient: 0, // Default value since API version doesn't have this
    inWayFromClient: 0, // Default value since API version doesn't have this
    quantityFull: stock.quantity, // Same as quantity if no way values
    category: stock.category,
    subject: stock.name,
    brand: "", // Default value
    techSize: "0", // Default value
    Price: 0, // Default value
    Discount: 0, // Default value
    isSupply: true, // Default value
    isRealization: false, // Default value
    SCCode: "" // Default value
  }));

  // Convert API StocksByCategory to component-expected format
  const adaptedCategorySummary: TypesStocksByCategory[] = categorySummary.map(cat => ({
    category: cat.name,
    totalItems: cat.count,
    valueRub: 0, // Default value since API version doesn't have this
    topSellingItem: "", // Default value
    averageTurnover: "0 days", // Default value
    returns: 0, // Default value
    inTransit: 0 // Default value
  }));

  return (
    <InventoryDetails
      stocks={adaptedStocks}
      categorySummary={adaptedCategorySummary}
      selectedCategory={selectedCategory}
      onSelectCategory={onSelectCategory}
    />
  );
};

export default InventoryDetailsAdapter;
