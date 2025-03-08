
import React, { useState, useEffect } from 'react';
import { 
  SupplyFormData, 
  BoxType, 
  BOX_TYPES, 
  SupplyItem, 
  Warehouse
} from '@/types/supplies';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface SupplyFormProps {
  warehouses: Warehouse[];
  onSupplySubmit: (data: SupplyFormData) => void;
}

const SupplyForm: React.FC<SupplyFormProps> = ({ warehouses, onSupplySubmit }) => {
  const [formData, setFormData] = useState<SupplyFormData>({
    selectedWarehouse: null,
    selectedBoxType: 'Короба',
    items: [{ barcode: '', quantity: 1 }]
  });

  const handleWarehouseChange = (warehouseId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedWarehouse: parseInt(warehouseId)
    }));
  };

  const handleBoxTypeChange = (boxType: string) => {
    setFormData(prev => ({
      ...prev,
      selectedBoxType: boxType as BoxType
    }));
  };

  const handleBarcodeChange = (index: number, value: string) => {
    const newItems = [...formData.items];
    newItems[index].barcode = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleQuantityChange = (index: number, value: string) => {
    const quantity = parseInt(value) || 1;
    const newItems = [...formData.items];
    newItems[index].quantity = Math.min(999999, Math.max(1, quantity));
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    if (formData.items.length >= 5000) {
      toast.error('Превышено максимальное количество товаров (5000)');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { barcode: '', quantity: 1 }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length <= 1) {
      toast.error('Должен быть хотя бы один товар');
      return;
    }
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка валидности данных
    if (!formData.selectedWarehouse) {
      toast.error('Выберите склад');
      return;
    }

    if (formData.items.some(item => !item.barcode.trim())) {
      toast.error('Заполните все баркоды');
      return;
    }

    onSupplySubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Создание поставки FBW</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="warehouse" className="text-sm font-medium">Склад назначения</label>
            <Select 
              value={formData.selectedWarehouse?.toString() || ''} 
              onValueChange={handleWarehouseChange}
            >
              <SelectTrigger id="warehouse">
                <SelectValue placeholder="Выберите склад" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map(warehouse => (
                  <SelectItem key={warehouse.ID} value={warehouse.ID.toString()}>
                    {warehouse.name} ({warehouse.acceptsQR ? 'QR' : 'Стандарт'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="boxType" className="text-sm font-medium">Тип упаковки</label>
            <Select 
              value={formData.selectedBoxType} 
              onValueChange={handleBoxTypeChange}
            >
              <SelectTrigger id="boxType">
                <SelectValue placeholder="Выберите тип упаковки" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(BOX_TYPES).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Товары ({formData.items.length})</label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addItem}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" /> Добавить товар
              </Button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="Баркод"
                    value={item.barcode}
                    onChange={(e) => handleBarcodeChange(index, e.target.value)}
                    className="flex-grow"
                  />
                  <Input
                    type="number"
                    placeholder="Кол-во"
                    value={item.quantity}
                    min={1}
                    max={999999}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    className="w-24"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeItem(index)}
                    className="h-10 w-10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" onClick={handleSubmit} className="w-full">
          Проверить доступность <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SupplyForm;
