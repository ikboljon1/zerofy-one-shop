import React, { useState } from 'react';
import { Warehouse, SupplyFormData, SupplyItem, BoxType, BOX_TYPES } from '@/types/supplies';
import { Button } from '@/components/ui/button';
import { Store } from '@/types/store';

interface SupplyFormProps {
  warehouses: Warehouse[];
  selectedStore?: Store | null;
}

const SupplyForm: React.FC<SupplyFormProps> = ({ 
  warehouses,
  selectedStore
}) => {
  const [formData, setFormData] = useState<SupplyFormData>({
    items: [{ barcode: '' }],
  });

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { barcode: '' }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems.splice(index, 1);
      return { ...prev, items: newItems };
    });
  };

  const handleBarcodeChange = (index: number, barcode: string) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], barcode };
      return { ...prev, items: newItems };
    });
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], quantity };
      return { ...prev, items: newItems };
    });
  };

  const handleWarehouseChange = (warehouseId: number) => {
    setFormData(prev => ({ ...prev, selectedWarehouse: warehouseId }));
  };

  const handleBoxTypeChange = (boxType: BoxType) => {
    setFormData(prev => ({ ...prev, selectedBoxType: boxType }));
  };

  const handleSubmit = () => {
    // Handle form submission logic here
    console.log('Form Data:', formData);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Создание поставки</h2>
      
      {/* Warehouse Selection */}
      <div>
        <label htmlFor="warehouse" className="block text-sm font-medium text-gray-700">
          Выберите склад:
        </label>
        <select
          id="warehouse"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          onChange={(e) => handleWarehouseChange(Number(e.target.value))}
        >
          <option value="">-- Выберите склад --</option>
          {warehouses.map(warehouse => (
            <option key={warehouse.ID} value={warehouse.ID}>
              {warehouse.name}
            </option>
          ))}
        </select>
      </div>

      {/* Box Type Selection */}
      <div>
        <label htmlFor="boxType" className="block text-sm font-medium text-gray-700">
          Выберите тип короба:
        </label>
        <select
          id="boxType"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          onChange={(e) => handleBoxTypeChange(e.target.value as BoxType)}
        >
          <option value="">-- Выберите тип --</option>
          {Object.keys(BOX_TYPES).map(key => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>

      {/* Items List */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Список товаров:
        </label>
        {formData.items.map((item, index) => (
          <div key={index} className="flex space-x-2 mb-2">
            <input
              type="text"
              placeholder="Штрихкод"
              value={item.barcode}
              onChange={(e) => handleBarcodeChange(index, e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
            <input
              type="number"
              placeholder="Количество"
              onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-24 sm:text-sm border-gray-300 rounded-md"
            />
            <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveItem(index)}>
              Удалить
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={handleAddItem}>
          Добавить товар
        </Button>
      </div>

      <Button type="button" onClick={handleSubmit}>
        Создать поставку
      </Button>
    </div>
  );
};

export default SupplyForm;
