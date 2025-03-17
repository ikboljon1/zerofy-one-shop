
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWarehouse } from '@/contexts/WarehouseContext';

interface SupplyFormProps {
  onWarehouseSelect?: (warehouseId: number) => void;
}

const SupplyForm: React.FC<SupplyFormProps> = ({ onWarehouseSelect }) => {
  const { wbWarehouses } = useWarehouse();
  const [formData, setFormData] = useState({
    productCount: '',
    totalWeight: '',
    totalVolume: '',
    selectedWarehouse: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, selectedWarehouse: value }));
    
    // Передаем выбранный склад в родительский компонент
    if (onWarehouseSelect) {
      onWarehouseSelect(Number(value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Данные формы:', formData);
    // Здесь будет логика для обработки данных формы поставки
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Параметры поставки</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productCount">Количество товаров (шт)</Label>
            <Input
              id="productCount"
              name="productCount"
              type="number"
              placeholder="Например: 100"
              value={formData.productCount}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="totalWeight">Общий вес (кг)</Label>
            <Input
              id="totalWeight"
              name="totalWeight"
              type="number"
              step="0.1"
              placeholder="Например: 25.5"
              value={formData.totalWeight}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="totalVolume">Общий объем (м³)</Label>
            <Input
              id="totalVolume"
              name="totalVolume"
              type="number"
              step="0.01"
              placeholder="Например: 0.5"
              value={formData.totalVolume}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="selectedWarehouse">Склад назначения</Label>
            <Select 
              value={formData.selectedWarehouse} 
              onValueChange={handleSelectChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите склад" />
              </SelectTrigger>
              <SelectContent>
                {wbWarehouses.map(warehouse => (
                  <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full">Рассчитать параметры поставки</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SupplyForm;
