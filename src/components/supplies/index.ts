
// Fix exports by using default imports
import SupplyForm from './SupplyForm';
import WarehouseCoefficientsTable from './WarehouseCoefficientsTable';
import WarehouseRemains from './WarehouseRemains';
import StorageProfitabilityAnalysis from './StorageProfitabilityAnalysis';
import PaidStorageCostReport from './PaidStorageCostReport';
import WarehouseCoefficientsCard from './WarehouseCoefficientsCard';
import WarehouseCoefficientsDateCard from './WarehouseCoefficientsDateCard';
import { SalesDataDialog } from './SalesDataDialog';
// Adding missing CostPriceMetrics export for Products.tsx
import CostPriceMetrics from '../CostPriceMetrics';

export {
  SupplyForm,
  WarehouseCoefficientsTable,
  WarehouseRemains,
  StorageProfitabilityAnalysis,
  PaidStorageCostReport,
  WarehouseCoefficientsCard,
  WarehouseCoefficientsDateCard,
  SalesDataDialog,
  CostPriceMetrics
};
