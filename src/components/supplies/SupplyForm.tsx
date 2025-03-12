
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
  // Using individual state variables for each field
  const [productName, setProductName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [quantity, setQuantity] = useState('');
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');
  const [supplyType, setSupplyType] = useState('Короба');
  
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
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="barcode">Штрихкод (необязательно)</Label>
            <Input 
              id="barcode" 
              placeholder="Введите штрихкод товара" 
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
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
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supply-type">Тип поставки</Label>
              <Select value={supplyType} onValueChange={setSupplyType}>
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
              onChange={(e) => setWeight(e.target.value)}
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
              onChange={(e) => setVolume(e.target.value)}
            />
          </div>
          
          <Button 
            type="button" 
            className="w-full flex items-center gap-2" 
            onClick={handleCalculate}
          >
            <Calculator className="h-4 w-4" />
            Рассчитать
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SupplyForm;
