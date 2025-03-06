
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
