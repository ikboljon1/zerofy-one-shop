import axios from 'axios';

// Общий базовый URL для всех запросов к API
axios.defaults.baseURL = '/api';

// Функция для получения списка складов
export const getWarehouses = async (storeId: string) => {
  try {
    const response = await axios.get(`/warehouses?storeId=${storeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    throw error;
  }
};

// Функция для получения информации о конкретном складе по ID
export const getWarehouseById = async (id: string) => {
  try {
    const response = await axios.get(`/warehouses/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching warehouse with ID ${id}:`, error);
    throw error;
  }
};

// Функция для создания нового склада
export const createWarehouse = async (warehouseData: any) => {
  try {
    const response = await axios.post('/warehouses', warehouseData);
    return response.data;
  } catch (error) {
    console.error('Error creating warehouse:', error);
    throw error;
  }
};

// Функция для обновления информации о складе
export const updateWarehouse = async (id: string, warehouseData: any) => {
  try {
    const response = await axios.put(`/warehouses/${id}`, warehouseData);
    return response.data;
  } catch (error) {
    console.error(`Error updating warehouse with ID ${id}:`, error);
    throw error;
  }
};

// Функция для удаления склада
export const deleteWarehouse = async (id: string) => {
  try {
    const response = await axios.delete(`/warehouses/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting warehouse with ID ${id}:`, error);
    throw error;
  }
};

// suppliesApi.ts

// Функция для получения списка поставок
export const getSupplies = async (storeId: string) => {
  try {
    const response = await axios.get(`/supplies?storeId=${storeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching supplies:', error);
    throw error;
  }
};

// Функция для получения информации о конкретной поставке по ID
export const getSupplyById = async (id: string) => {
  try {
    const response = await axios.get(`/supplies/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching supply with ID ${id}:`, error);
    throw error;
  }
};

// Функция для создания новой поставки
export const createSupply = async (supplyData: any) => {
  try {
    const response = await axios.post('/supplies', supplyData);
    return response.data;
  } catch (error) {
    console.error('Error creating supply:', error);
    throw error;
  }
};

// Функция для обновления информации о поставке
export const updateSupply = async (id: string, supplyData: any) => {
  try {
    const response = await axios.put(`/supplies/${id}`, supplyData);
    return response.data;
  } catch (error) {
    console.error(`Error updating supply with ID ${id}:`, error);
    throw error;
  }
};

// Функция для удаления поставки
export const deleteSupply = async (id: string) => {
  try {
    const response = await axios.delete(`/supplies/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting supply with ID ${id}:`, error);
    throw error;
  }
};

// Функция для получения списка товаров
export const getProducts = async (storeId: string) => {
  try {
    const response = await axios.get(`/products?storeId=${storeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Функция для получения информации о конкретном товаре по ID
export const getProductById = async (id: string) => {
  try {
    const response = await axios.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }
};

// Функция для создания нового товара
export const createProduct = async (productData: any) => {
  try {
    const response = await axios.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Функция для обновления информации о товаре
export const updateProduct = async (id: string, productData: any) => {
  try {
    const response = await axios.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error(`Error updating product with ID ${id}:`, error);
    throw error;
  }
};

// Функция для удаления товара
export const deleteProduct = async (id: string) => {
  try {
    const response = await axios.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product with ID ${id}:`, error);
    throw error;
  }
};

// ordersApi.ts

// Функция для получения списка заказов
export const getOrders = async (storeId: string) => {
  try {
    const response = await axios.get(`/orders?storeId=${storeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Функция для получения информации о конкретном заказе по ID
export const getOrderById = async (id: string) => {
  try {
    const response = await axios.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order with ID ${id}:`, error);
    throw error;
  }
};

// Функция для создания нового заказа
export const createOrder = async (orderData: any) => {
  try {
    const response = await axios.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Функция для обновления информации о заказе
export const updateOrder = async (id: string, orderData: any) => {
  try {
    const response = await axios.put(`/orders/${id}`, orderData);
    return response.data;
  } catch (error) {
    console.error(`Error updating order with ID ${id}:`, error);
    throw error;
  }
};

// Функция для удаления заказа
export const deleteOrder = async (id: string) => {
  try {
    const response = await axios.delete(`/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting order with ID ${id}:`, error);
    throw error;
  }
};

// Функция для получения списка складов для конкретного магазина
export const getWarehousesByStoreId = async (storeId: string) => {
  try {
    const response = await axios.get(`/warehouses?storeId=${storeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching warehouses for store:', error);
    throw error;
  }
};

// Функция для переключения предпочтительного склада
// Исправляем ошибку TS2693: 'number' only refers to a type, but is being used as a value here
export const togglePreferredWarehouse = async (
  warehouseId: number,
  storeId: string
): Promise<boolean> => {
  try {
    // Используем числовое значение вместо типа number
    const response = await axios.post('/api/warehouses/preferred', {
      warehouseId,
      storeId,
    });
    return response.data.success;
  } catch (error) {
    console.error('Error toggling preferred warehouse status:', error);
    return false;
  }
};
