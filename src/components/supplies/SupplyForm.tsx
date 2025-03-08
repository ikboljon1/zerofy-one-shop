
import React, { useState } from 'react';
import { 
  Warehouse,
  SupplyItem,
  SupplyFormData
} from '@/services/suppliesApi';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface SupplyFormProps {
  warehouses: Warehouse[];
  onSupplySubmit: (data: SupplyFormData) => void;
}

const SupplyForm: React.FC<SupplyFormProps> = ({ warehouses, onSupplySubmit }) => {
  const [formData, setFormData] = useState<SupplyFormData>({
    selectedWarehouse: '',
    items: [{ article: '', quantity: 1 }]
  });

  const handleWarehouseChange = (warehouseId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedWarehouse: warehouseId
    }));
  };

  const handleBarcodeChange = (index: number, value: string) => {
    const newItems = [...formData.items];
    newItems[index].article = value;
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
      toast({
        title: "Внимание",
        description: "Превышено максимальное количество товаров (5000)",
        variant: "destructive"
      });
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { article: '', quantity: 1 }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length <= 1) {
      toast({
        title: "Внимание",
        description: "Должен быть хотя бы один товар",
        variant: "destructive"
      });
      return;
    }
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка валидности данных
    if (!formData.selectedWarehouse) {
      toast({
        title: "Внимание",
        description: "Выберите склад",
        variant: "destructive"
      });
      return;
    }

    if (formData.items.some(item => !item.article.trim())) {
      toast({
        title: "Внимание",
        description: "Заполните все баркоды",
        variant: "destructive"
      });
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
              value={formData.selectedWarehouse || ''} 
              onValueChange={handleWarehouseChange}
            >
              <SelectTrigger id="warehouse">
                <SelectValue placeholder="Выберите склад" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map(warehouse => (
                  <SelectItem key={warehouse.ID} value={warehouse.ID}>
                    {warehouse.name} ({warehouse.acceptsQR ? 'QR' : 'Стандарт'})
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
                    value={item.article}
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
