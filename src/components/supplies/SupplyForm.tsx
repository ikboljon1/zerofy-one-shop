
import React, { useState, useEffect } from 'react';
import { 
  SupplyFormData, 
  SupplyItem, 
  Warehouse,
  BoxType,
  BOX_TYPES
} from '@/types/supplies';
import { Plus, Trash2, ArrowRight, FileBarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface SupplyFormProps {
  warehouses: Warehouse[];
  onSupplySubmit: (data: SupplyFormData) => void;
  isLoading?: boolean;
}

const SupplyForm: React.FC<SupplyFormProps> = ({ warehouses, onSupplySubmit, isLoading = false }) => {
  const [activeTab, setActiveTab] = useState<string>('manual');
  const [formData, setFormData] = useState<SupplyFormData>({
    selectedWarehouse: undefined,
    selectedBoxType: 'Короба',
    items: [{ barcode: '', quantity: 1 }]
  });
  const [csvContent, setCsvContent] = useState<string>('');

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

    if (formData.items.length === 0) {
      toast.error('Добавьте хотя бы один товар');
      return;
    }

    onSupplySubmit(formData);
  };

  const handleCsvContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCsvContent(e.target.value);
  };

  const processCsvContent = () => {
    if (!csvContent.trim()) {
      toast.error('Введите данные в формате CSV');
      return;
    }

    try {
      // Split by lines and process
      const lines = csvContent.trim().split('\n');
      const items: SupplyItem[] = [];

      for (const line of lines) {
        const [barcode, quantityStr] = line.split(',').map(item => item.trim());
        
        if (!barcode) {
          continue; // Skip empty lines
        }

        const quantity = parseInt(quantityStr) || 1;
        if (quantity < 1 || quantity > 999999) {
          toast.warning(`Некорректное количество для баркода ${barcode}. Будет использовано значение 1.`);
        }

        items.push({
          barcode,
          quantity: Math.min(999999, Math.max(1, quantity))
        });
      }

      if (items.length === 0) {
        toast.error('Не удалось распознать ни одного товара');
        return;
      }

      if (items.length > 5000) {
        toast.error('Превышено максимальное количество товаров (5000)');
        items.splice(5000);
      }

      setFormData(prev => ({
        ...prev,
        items
      }));

      toast.success(`Успешно импортировано ${items.length} товаров`);
      setActiveTab('manual');
    } catch (error) {
      console.error('Ошибка при обработке CSV:', error);
      toast.error('Ошибка при обработке данных. Проверьте формат ввода.');
    }
  };

  const clearForm = () => {
    setFormData({
      selectedWarehouse: undefined,
      selectedBoxType: 'Короба',
      items: [{ barcode: '', quantity: 1 }]
    });
    setCsvContent('');
  };

  const getQrAcceptingWarehouses = () => {
    return warehouses.filter(w => w.acceptsQR);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Создание поставки FBW</CardTitle>
        <CardDescription>
          Проверьте доступность приёмки товаров на складах Wildberries
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="warehouse" className="text-sm font-medium">Склад назначения</label>
            <Select 
              value={formData.selectedWarehouse?.toString() || ''} 
              onValueChange={handleWarehouseChange}
              disabled={isLoading}
            >
              <SelectTrigger id="warehouse">
                <SelectValue placeholder="Выберите склад" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map(warehouse => (
                  <SelectItem 
                    key={warehouse.ID} 
                    value={warehouse.ID.toString()}
                    className="flex items-center"
                  >
                    <span>
                      {warehouse.name}
                      {warehouse.acceptsQR && <span className="ml-2 text-xs bg-green-100 text-green-800 py-0.5 px-1.5 rounded">QR</span>}
                    </span>
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
              disabled={isLoading}
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual" disabled={isLoading}>Ручной ввод</TabsTrigger>
              <TabsTrigger value="csv" disabled={isLoading}>Импорт CSV</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Товары ({formData.items.length})</label>
                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={clearForm}
                      className="h-8"
                      disabled={isLoading || (formData.items.length === 1 && !formData.items[0].barcode)}
                    >
                      Очистить
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addItem}
                      className="h-8"
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Добавить товар
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="Баркод"
                        value={item.barcode}
                        onChange={(e) => handleBarcodeChange(index, e.target.value)}
                        className="flex-grow"
                        disabled={isLoading}
                      />
                      <Input
                        type="number"
                        placeholder="Кол-во"
                        value={item.quantity}
                        min={1}
                        max={999999}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className="w-24"
                        disabled={isLoading}
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeItem(index)}
                        className="h-10 w-10"
                        disabled={isLoading || formData.items.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="csv" className="pt-4">
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Импорт из CSV</div>
                  <div className="text-sm text-muted-foreground mb-4">
                    Введите данные в формате: баркод,количество (по одной паре на строку)
                    <br />
                    Пример:<br />
                    <code className="text-xs bg-muted p-1 rounded">
                      2000000000000,5<br />
                      2000000000001,10<br />
                      2000000000002,3
                    </code>
                  </div>
                  <textarea
                    value={csvContent}
                    onChange={handleCsvContentChange}
                    placeholder="Введите данные в формате CSV..."
                    className="w-full h-40 p-2 border rounded-md"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={processCsvContent}
                    variant="secondary"
                    disabled={isLoading || !csvContent.trim()}
                  >
                    <FileBarChart2 className="h-4 w-4 mr-2" /> Импортировать
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          onClick={handleSubmit} 
          className="w-full"
          disabled={isLoading}
        >
          Проверить доступность <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SupplyForm;
