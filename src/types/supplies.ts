
export interface WarehouseCoefficient {
  date: string;
  coefficient: number;
  warehouseID: number;
  warehouseName: string;
  allowUnload: boolean;
  boxTypeName: string;
  boxTypeID?: number;
  storageCoef: string | null;
  deliveryCoef: string | null;
  deliveryBaseLiter: string | null;
  deliveryAdditionalLiter: string | null;
  storageBaseLiter: string | null;
  storageAdditionalLiter: string | null;
  isSortingCenter: boolean;
}

export interface SupplyItem {
  quantity: number;
  barcode: string;
}

export interface WarehouseOption {
  warehouseID: number;
  canBox: boolean;
  canMonopallet: boolean;
  canSupersafe: boolean;
}

export interface SupplyItemResponse {
  barcode: string;
  warehouses: WarehouseOption[] | null;
  error?: {
    title: string;
    detail: string;
  };
  isError?: boolean;
}

export interface SupplyOptionsResponse {
  result: SupplyItemResponse[];
  requestId?: string;
}

export interface Warehouse {
  ID: number;
  name: string;
  address: string;
  workTime: string;
  acceptsQR: boolean;
}

export type BoxType = 'Короба' | 'Монопаллеты' | 'Суперсейф' | 'QR-поставка с коробами';

export const BOX_TYPES: Record<BoxType, number | undefined> = {
  'Короба': 2,
  'Монопаллеты': 5,
  'Суперсейф': 6,
  'QR-поставка с коробами': undefined
};

export interface SupplyFormData {
  selectedWarehouse: number | null;
  selectedBoxType: BoxType;
  items: SupplyItem[];
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
  topSellingItem?: string;
  averageTurnover?: string;
  returns?: number;
  inTransit?: number;
}

export interface StocksByWarehouse {
  warehouseName: string;
  totalItems: number;
  categories: {
    [category: string]: number;
  };
}

export interface WarehouseRemainTask {
  id: string;
  status: 'new' | 'processing' | 'done' | 'purged' | 'canceled';
}

export interface WarehouseQuantity {
  warehouseName: string;
  quantity: number;
}

export interface WarehouseRemainItem {
  brand: string;
  subjectName: string;
  vendorCode: string;
  nmId: number;
  barcode: string;
  techSize: string;
  volume: number;
  inWayToClient: number;
  inWayFromClient: number;
  quantityWarehousesFull: number;
  warehouses: WarehouseQuantity[];
  price?: number; // Adding optional price property
}

export interface CreateTaskResponse {
  data: {
    taskId: string;
  };
}

export interface TaskStatusResponse {
  data: WarehouseRemainTask;
}
