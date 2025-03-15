
import axios from 'axios';
import { Warehouse, WarehouseCoefficient, PaidStorageItem } from '@/types/supplies';

// Fetch warehouses data
export const fetchWarehouses = async (apiKey: string): Promise<Warehouse[]> => {
  try {
    // In a real app, this would call the actual API
    // For now, we'll return mock data
    console.log('Fetching warehouses with API key:', apiKey);
    
    // Simulating API response with mock data
    const mockWarehouses: Warehouse[] = Array(5).fill(null).map((_, index) => ({
      ID: 1000 + index,
      name: `Склад ${index + 1}`,
      address: `г. Москва, ул. Складская, д. ${index + 1}`,
      workTime: "09:00-18:00",
      acceptsQR: true,
      geoPoint: {
        lat: 55.7 + (Math.random() * 0.5),
        lon: 37.6 + (Math.random() * 0.5)
      },
      isWB: true,
      isWithinFitCargo: index % 2 === 0,
      isBoxOnly: false,
    }));
    
    return mockWarehouses;
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    throw error;
  }
};

// Fetch acceptance coefficients
export const fetchAcceptanceCoefficients = async (apiKey: string): Promise<WarehouseCoefficient[]> => {
  try {
    console.log('Fetching acceptance coefficients with API key:', apiKey);
    
    // Simulating API response with mock data
    const mockCoefficients: WarehouseCoefficient[] = Array(5).fill(null).map((_, index) => ({
      warehouseID: 1000 + index,
      warehouseName: `Склад ${index + 1}`,
      allowUnload: true,
      boxTypeName: "Короб",
      boxTypeID: 1,
      date: new Date().toISOString().split('T')[0],
      coefficient: 1 + (index % 3) / 10,
      storageCoef: "1.0",
      deliveryCoef: "1.0",
      deliveryBaseLiter: "10.0",
      deliveryAdditionalLiter: "5.0",
      storageBaseLiter: "8.0",
      storageAdditionalLiter: "4.0",
      isSortingCenter: false
    }));
    
    return mockCoefficients;
  } catch (error) {
    console.error('Error fetching acceptance coefficients:', error);
    throw error;
  }
};

// Fetch full paid storage report
export const fetchFullPaidStorageReport = async (apiKey: string, dateFrom: string, dateTo: string): Promise<PaidStorageItem[]> => {
  try {
    console.log('Fetching paid storage report with API key:', apiKey, 'from:', dateFrom, 'to:', dateTo);
    
    // Simulating API response with mock data
    const mockStorageData: PaidStorageItem[] = Array(10).fill(null).map((_, index) => ({
      date: new Date(Date.now() - (index % 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      logWarehouseCoef: 1,
      officeId: 500 + (index % 3),
      warehouse: ['Коледино', 'Подольск', 'Электросталь'][index % 3],
      warehouseCoef: 1.5 + (index % 5) / 10,
      giId: 100000 + index,
      chrtId: 200000 + index,
      size: ['S', 'M', 'L', 'XL', 'XXL'][index % 5],
      barcode: `2000000${index}`,
      subject: ['Футболка', 'Джинсы', 'Куртка', 'Обувь', 'Аксессуары'][index % 5],
      brand: ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance'][index % 5],
      vendorCode: `A${1000 + index}`,
      nmId: 300000 + index,
      volume: 0.5 + (index % 10) / 10,
      calcType: 'короба: без габаритов',
      warehousePrice: 5 + (index % 20),
      barcodesCount: 1 + (index % 5),
      palletPlaceCode: 0,
      palletCount: 0,
      originalDate: new Date(Date.now() - (index % 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      loyaltyDiscount: index % 3 === 0 ? (2 + index % 5) : 0,
      tariffFixDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tariffLowerDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));
    
    return mockStorageData;
  } catch (error) {
    console.error('Error fetching paid storage report:', error);
    throw error;
  }
};

// Get preferred warehouses
export const getPreferredWarehouses = async (apiKey: string): Promise<number[]> => {
  try {
    console.log('Getting preferred warehouses with API key:', apiKey);
    
    // Simulating API response with mock data
    return [1001, 1003]; // Example preferred warehouse IDs
  } catch (error) {
    console.error('Error getting preferred warehouses:', error);
    throw error;
  }
};

// Toggle preferred warehouse
export const togglePreferredWarehouse = async (apiKey: string, warehouseId: number, isPreferred: boolean): Promise<boolean> => {
  try {
    console.log('Toggling preferred warehouse with API key:', apiKey, 'warehouse ID:', warehouseId, 'preferred:', isPreferred);
    
    // Simulating API response
    return true; // Success
  } catch (error) {
    console.error('Error toggling preferred warehouse:', error);
    throw error;
  }
};

// Add more API functions as needed for other functionality
