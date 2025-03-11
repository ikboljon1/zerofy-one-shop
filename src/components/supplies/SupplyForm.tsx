
import React, { useState, useEffect } from 'react';
import { 
  SupplyFormData, 
  SupplyItem, 
  Warehouse,
  BoxType,
  BOX_TYPES,
  WarehouseCoefficient
} from '@/types/supplies';
import { Plus, Trash2, ArrowRight, FileBarChart2, Package, Search, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface SupplyFormProps {
  warehouses: Warehouse[];
  onSupplySubmit: (data: SupplyFormData) => void;
  isLoading?: boolean;
  coefficients?: WarehouseCoefficient[];
  onWarehouseSelect?: (warehouseId: number) => void;
}

const SupplyForm: React.FC<SupplyFormProps> = ({ 
  warehouses, 
  onSupplySubmit, 
  isLoading = false,
  coefficients = [],
  onWarehouseSelect
}) => {
  const [activeTab, setActiveTab] = useState<string>('manual');
  const [formData, setFormData] = useState<SupplyFormData>({
    selectedWarehouse: undefined,
    selectedBoxType: 'Короба',
    items: [{ barcode: '', quantity: 1 }]
  });
  const [csvContent, setCsvContent] = useState<string>('');

  const handleWarehouseChange = (warehouseId: string) => {
    const warehouseIdNumber = parseInt(warehouseId);
    setFormData(prev => ({
      ...prev,
      selectedWarehouse: warehouseIdNumber
    }));
    
    if (onWarehouseSelect) {
      onWarehouseSelect(warehouseIdNumber);
    }
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
      const lines = csvContent.trim().split('\n');
      const items: SupplyItem[] = [];

      for (const line of lines) {
        const [barcode, quantityStr] = line.split(',').map(item => item.trim());
        
        if (!barcode) {
          continue;
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

  // Get warehouses that accept QR codes
  const getQrAcceptingWarehouses = () => {
    return warehouses.filter(w => w.acceptsQR);
  };

  // Find warehouse coefficient for selected warehouse
  const getSelectedWarehouseCoefficient = () => {
    if (!formData.selectedWarehouse) return null;
    return coefficients.find(c => c.warehouseID === formData.selectedWarehouse);
  };

  const selectedCoefficient = getSelectedWarehouseCoefficient();

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-primary" />
          <CardTitle>Создание поставки FBW</CardTitle>
        </div>
        <CardDescription>
          Проверьте доступность приёмки товаров на складах Wildberries
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Warehouse Selection with Coefficient Info */}
          <div className="space-y-2">
            <label htmlFor="warehouse" className="text-sm font-medium">Склад назначения</label>
            <Select 
              value={formData.selectedWarehouse?.toString() || ''} 
              onValueChange={handleWarehouseChange}
              disabled={isLoading}
            >
              <SelectTrigger id="warehouse" className="bg-background">
                <SelectValue placeholder="Выберите склад" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-md z-[999]" searchable>
                {warehouses.map(warehouse => (
                  <SelectItem 
                    key={warehouse.ID} 
                    value={warehouse.ID.toString()}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <span className="mr-2">{warehouse.name}</span>
                      {warehouse.acceptsQR && 
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-800">QR</Badge>
                      }
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Show coefficient info if warehouse selected */}
            {selectedCoefficient && (
              <div className="mt-2 p-3 bg-accent/30 rounded-md text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Коэффициент приёмки:</span>
                  <span className="font-semibold">{selectedCoefficient.coefficient}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Статус приёмки:</span>
                  <Badge variant={selectedCoefficient.allowUnload ? "success" : "destructive"} className="text-xs">
                    {selectedCoefficient.allowUnload ? "Доступен" : "Закрыт"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Дата актуальности:</span>
                  <span>{new Date(selectedCoefficient.date).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Box Type Selection */}
          <div className="space-y-2">
            <label htmlFor="boxType" className="text-sm font-medium">Тип упаковки</label>
            <Select 
              value={formData.selectedBoxType} 
              onValueChange={handleBoxTypeChange}
              disabled={isLoading}
            >
              <SelectTrigger id="boxType" className="bg-background">
                <SelectValue placeholder="Выберите тип упаковки" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-md z-[999]">
                {Object.keys(BOX_TYPES).map((type) => (
                  <SelectItem key={type} value={type} className="flex items-center">
                    <Box className="h-4 w-4 mr-2 opacity-70" />
                    <span>{type}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Input Methods Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual" disabled={isLoading} className="flex items-center">
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Ручной ввод</span>
              </TabsTrigger>
              <TabsTrigger value="csv" disabled={isLoading} className="flex items-center">
                <FileBarChart2 className="h-4 w-4 mr-1.5" />
                <span>Импорт CSV</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Manual Entry Tab */}
            <TabsContent value="manual" className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">{formData.items.length}</Badge>
                    <label className="text-sm font-medium">Товары</label>
                  </div>
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

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 border rounded-md p-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 border-b pb-2 last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-full bg-accent/50 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
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
                        className="h-10 w-10 hover:bg-destructive/10 hover:text-destructive"
                        disabled={isLoading || formData.items.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* CSV Import Tab */}
            <TabsContent value="csv" className="pt-4">
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2 flex items-center">
                    <FileBarChart2 className="h-4 w-4 mr-1.5" />
                    <span>Импорт из CSV</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-4 p-3 bg-muted/50 rounded-md">
                    <p className="mb-2">Введите данные в формате: <code className="bg-muted px-1 py-0.5 rounded">баркод,количество</code> (по одной паре на строку)</p>
                    <div className="p-2 bg-muted rounded text-xs font-mono">
                      2000000000000,5<br />
                      2000000000001,10<br />
                      2000000000002,3
                    </div>
                  </div>
                  <textarea
                    value={csvContent}
                    onChange={handleCsvContentChange}
                    placeholder="Введите данные в формате CSV..."
                    className="w-full h-40 p-2 border rounded-md focus:ring-1 focus:ring-ring"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={processCsvContent}
                    variant="secondary"
                    disabled={isLoading || !csvContent.trim()}
                    className="flex items-center"
                  >
                    <FileBarChart2 className="h-4 w-4 mr-2" /> Импортировать
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="bg-accent/10 pt-4 pb-4 mt-4">
        <Button 
          type="submit" 
          onClick={handleSubmit} 
          className="w-full flex items-center gap-2"
          disabled={isLoading}
        >
          <span>Проверить доступность</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SupplyForm;
