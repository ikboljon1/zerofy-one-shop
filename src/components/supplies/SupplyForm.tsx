
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Package, ClipboardList, Calculator } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';

const SupplyForm: React.FC = () => {
  // Используем отдельные состояния для каждого поля
  const [productName, setProductName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [quantity, setQuantity] = useState('');
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');
  const [supplyType, setSupplyType] = useState('Короба');
  
  // Функции обработчики для каждого поля
  const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductName(e.target.value);
  };
  
  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBarcode(e.target.value);
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(e.target.value);
  };
  
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeight(e.target.value);
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(e.target.value);
  };
  
  const handleSupplyTypeChange = (value: string) => {
    setSupplyType(value);
  };
  
  const handleCalculate = () => {
    if (!quantity || !weight || !volume) {
      toast.error('Пожалуйста, заполните все обязательные поля', {
        duration: 3000,
      });
      return;
    }
    
    // Perform calculation or validation
    toast.success('Расчет выполнен успешно!', {
      duration: 3000,
    });
  };
  
  const handleReset = () => {
    // Сбросить все поля формы
    setProductName('');
    setBarcode('');
    setQuantity('');
    setWeight('');
    setVolume('');
    setSupplyType('Короба');
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          Расчет поставки
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Наименование товара</Label>
            <Input 
              id="product-name" 
              placeholder="Введите название товара" 
              value={productName}
              onChange={handleProductNameChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="barcode">Штрихкод (необязательно)</Label>
            <Input 
              id="barcode" 
              placeholder="Введите штрихкод товара" 
              value={barcode}
              onChange={handleBarcodeChange}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Количество (шт.)</Label>
              <Input 
                id="quantity" 
                type="number" 
                placeholder="0" 
                value={quantity}
                onChange={handleQuantityChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supply-type">Тип поставки</Label>
              <Select value={supplyType} onValueChange={handleSupplyTypeChange}>
                <SelectTrigger id="supply-type">
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Короба">Короба</SelectItem>
                  <SelectItem value="Монопаллеты">Монопаллеты</SelectItem>
                  <SelectItem value="Суперсейф">Суперсейф</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="weight" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Вес (кг)
            </Label>
            <Input 
              id="weight" 
              type="number" 
              placeholder="0.00" 
              step="0.01" 
              value={weight}
              onChange={handleWeightChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="volume" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Объем (м³)
            </Label>
            <Input 
              id="volume" 
              type="number" 
              placeholder="0.00" 
              step="0.01" 
              value={volume}
              onChange={handleVolumeChange}
            />
          </div>
          
          <div className="flex gap-3">
            <Button 
              type="button" 
              className="flex-1 flex items-center gap-2" 
              onClick={handleCalculate}
            >
              <Calculator className="h-4 w-4" />
              Рассчитать
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1" 
              onClick={handleReset}
            >
              Очистить
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SupplyForm;
