
export interface WarehouseCoefficient {
  date: string;
  coefficient: number;
  warehouseID: number;
  warehouseName: string;
  allowUnload: boolean;
  boxTypeName: string;
  boxTypeID: number;
  storageCoef: string | null;
  deliveryCoef: string | null;
  deliveryBaseLiter: string | null;
  deliveryAdditionalLiter: string | null;
  storageBaseLiter: string | null;
  storageAdditionalLiter: string | null;
  isSortingCenter: boolean;
}

export interface SupplyOptionsResponse {
  result: SupplyOption[];
  requestId: string;
}

export interface SupplyOption {
  barcode: string;
  warehouses: WarehouseAvailability[] | null;
  error?: {
    title: string;
    detail: string;
  };
  isError: boolean;
}

export interface WarehouseAvailability {
  warehouseID: number;
  canBox: boolean;
  canMonopallet: boolean;
  canSupersafe: boolean;
}

export interface SupplyItem {
  barcode: string;
  quantity?: number;
}

export interface SupplyFormData {
  items: SupplyItem[];
  selectedWarehouse?: number;
  selectedBoxType?: BoxType;
}

export interface Warehouse {
  ID: number;
  name: string;
  address: string;
  workTime: string;
  acceptsQR: boolean;
}

export interface WildberriesStock {
  lastChangeDate: string;
  warehouseName: string;
  supplierArticle: string;
  nmId: number;
  barcode: string;
  quantity: number;
  inWayToClient: number;
  inWayFromClient: number;
  quantityFull: number;
  category: string;
  subject: string;
  brand: string;
  techSize: string;
  Price: number;
  Discount: number;
  isSupply: boolean;
  isRealization: boolean;
  SCCode: string;
}

export interface StocksByCategory {
  category: string;
  totalItems: number;
  valueRub: number;
  topSellingItem: string;
  averageTurnover: string;
  returns: number;
  inTransit: number;
}

export interface StocksByWarehouse {
  warehouseName: string;
  totalItems: number;
  categories: Record<string, number>;
}

// Adding BoxType and BOX_TYPES enum for SupplyForm
export type BoxType = 'Короба' | 'Монопаллета' | 'Суперсейф';

export const BOX_TYPES: Record<BoxType, string> = {
  'Короба': 'box',
  'Монопаллета': 'monopallet',
  'Суперсейф': 'supersafe'
};

// Updated WarehouseRemainItem interface with the correct properties
// and added the missing warehouses property
export interface WarehouseRemainItem {
  lastChangeDate: string;
  warehouseName: string;
  vendorCode: string; // was supplierArticle
  nmId: number;
  barcode: string;
  brand: string;
  category: string;
  subjectName: string; // was subject
  chrtId: number;
  price: number;
  quantity: number;
  quantityFull: number;
  quantityType: string;
  size: string;
  techSize: string;
  inWayToClient: number;
  inWayFromClient: number;
  isSupply: boolean;
  isRealization: boolean;
  volume?: number;
  quantityWarehousesFull?: number;
  quantityWarehouses?: number;
  photoLink?: string; // Added this property as optional
  // Adding the missing warehouses property as an array of warehouse data
  warehouses: {
    warehouseName: string;
    quantity: number;
  }[];
}

// Add WarehouseEfficiency interface for dashboard charts
export interface WarehouseEfficiency {
  warehouseName: string;
  totalItems: number;
  totalValue: number;
  turnoverRate: number;
  utilizationPercent: number;
  processingSpeed: number;
  rank: number;
}

// For API task responses
export interface CreateTaskResponse {
  data: {
    taskId: string;
  };
}

export interface TaskStatusResponse {
  data: {
    id: string;
    status: string;
  };
}

// Interface for paid storage item from Wildberries API
export interface PaidStorageItem {
  date: string;
  logWarehouseCoef: number;
  officeId: number;
  warehouse: string;
  warehouseCoef: number;
  giId: number;
  chrtId: number;
  size: string;
  barcode: string;
  subject: string;
  brand: string;
  vendorCode: string;
  nmId: number;
  volume: number;
  calcType: string;
  warehousePrice: number;
  barcodesCount: number;
  palletPlaceCode: number;
  palletCount: number;
  originalDate: string;
  loyaltyDiscount: number;
  tariffFixDate: string;
  tariffLowerDate: string;
}
