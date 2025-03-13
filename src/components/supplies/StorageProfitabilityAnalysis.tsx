
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRightIcon, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SalesDataProvider from './SalesDataProvider';

interface StorageProfitabilityResult {
  daysToBreakEven: number;
  isCurrentStorageProfitable: boolean;
  optimalOrderQuantity: number;
  profitLossPerDay: number;
}

const StorageProfitabilityAnalysis: React.FC = () => {
  const { toast } = useToast();
  const [dailySales, setDailySales] = useState<number>(10);
  const [productCost, setProductCost] = useState<number>(500);
  const [storageCost, setStorageCost] = useState<number>(5);
  const [shippingCost, setShippingCost] = useState<number>(100);
  const [currentStock, setCurrentStock] = useState<number>(100);
  const [productName, setProductName] = useState<string>('Футболка Nike');
  const [result, setResult] = useState<StorageProfitabilityResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>('analysis');
  const [apiKey, setApiKey] = useState<string>('');

  // Get API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('wb_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const calculateProfitability = () => {
    if (!dailySales || !productCost || !storageCost || !shippingCost) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }

    // Calculate days to break even
    const daysToBreakEven = Math.ceil(shippingCost / (storageCost * currentStock));

    // Calculate if current storage is profitable
    const dailyStorageCost = storageCost * currentStock;
    const dailyRevenue = dailySales * productCost * 0.1; // Assuming 10% profit margin
    const profitLossPerDay = dailyRevenue - dailyStorageCost;
    const isCurrentStorageProfitable = profitLossPerDay > 0;

    // Calculate optimal order quantity
    // Using simple EOQ formula: sqrt(2 * Daily Sales * Shipping Cost / Storage Cost)
    const optimalOrderQuantity = Math.ceil(Math.sqrt((2 * dailySales * shippingCost) / storageCost));

    setResult({
      daysToBreakEven,
      isCurrentStorageProfitable,
      optimalOrderQuantity,
      profitLossPerDay
    });

    // Save to localStorage
    try {
      const savedAnalyses = JSON.parse(localStorage.getItem('storage_profitability_analyses') || '[]');
      const newAnalysis = {
        id: Date.now(),
        date: new Date().toISOString(),
        productName,
        dailySales,
        productCost,
        storageCost,
        shippingCost,
        currentStock,
        result: {
          daysToBreakEven,
          isCurrentStorageProfitable,
          optimalOrderQuantity,
          profitLossPerDay
        }
      };
      
      savedAnalyses.unshift(newAnalysis);
      localStorage.setItem('storage_profitability_analyses', JSON.stringify(savedAnalyses.slice(0, 10)));
      
      toast({
        title: "Анализ сохранен",
        description: "Результаты анализа сохранены в истории",
      });
    } catch (error) {
      console.error('Failed to save analysis to localStorage', error);
    }
  };

  const handleDataReceived = (data: any) => {
    if (data && data.productInfo) {
      const { productName, dailySales, storageCost, nmId } = data.productInfo;
      setProductName(productName || `Товар #${nmId}` || 'Неизвестный товар');
      setDailySales(dailySales || 10);
      setStorageCost(storageCost || 5);
      
      // Оставляем остальные поля без изменений или заполняем их разумными значениями
      if (!productCost) setProductCost(500);
      if (!shippingCost) setShippingCost(100);
      if (!currentStock) setCurrentStock(Math.max(20, dailySales * 5)); // Примерно запас на 5 дней
      
      toast({
        title: "Данные загружены",
        description: `Загружены данные для товара: ${productName || `Товар #${nmId}`}`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analysis">Анализ прибыльности хранения</TabsTrigger>
          <TabsTrigger value="history">История анализов</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Анализ прибыльности хранения</CardTitle>
              <SalesDataProvider 
                apiKey={apiKey}
                onDataReceived={handleDataReceived}
              >
                <></>
              </SalesDataProvider>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Наименование товара</Label>
                  <Input 
                    id="productName" 
                    value={productName} 
                    onChange={(e) => setProductName(e.target.value)} 
                    placeholder="Например, Футболка Nike" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dailySales">Среднее количество продаж в день (шт)</Label>
                  <Input 
                    id="dailySales" 
                    type="number" 
                    value={dailySales} 
                    onChange={(e) => setDailySales(Number(e.target.value))} 
                    placeholder="10" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productCost">Стоимость товара (₽)</Label>
                  <Input 
                    id="productCost" 
                    type="number" 
                    value={productCost} 
                    onChange={(e) => setProductCost(Number(e.target.value))} 
                    placeholder="500" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storageCost">Стоимость хранения единицы товара в день (₽)</Label>
                  <Input 
                    id="storageCost" 
                    type="number" 
                    value={storageCost} 
                    onChange={(e) => setStorageCost(Number(e.target.value))} 
                    placeholder="5" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippingCost">Стоимость поставки (₽)</Label>
                  <Input 
                    id="shippingCost" 
                    type="number" 
                    value={shippingCost} 
                    onChange={(e) => setShippingCost(Number(e.target.value))} 
                    placeholder="100" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentStock">Текущие остатки на складе (шт)</Label>
                  <Input 
                    id="currentStock" 
                    type="number" 
                    value={currentStock} 
                    onChange={(e) => setCurrentStock(Number(e.target.value))} 
                    placeholder="100" 
                  />
                </div>
              </div>
              
              <button 
                className="w-full mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" 
                onClick={calculateProfitability}
              >
                Рассчитать прибыльность хранения
              </button>
              
              {result && (
                <div className="mt-6 p-4 rounded-md border border-border bg-card dark:bg-slate-900">
                  <h3 className="text-lg font-semibold mb-3">Результаты анализа:</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Текущее хранение:</span>
                      <span className={`font-medium ${result.isCurrentStorageProfitable ? 'text-green-500' : 'text-red-500'}`}>
                        {result.isCurrentStorageProfitable ? 'Прибыльное' : 'Убыточное'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Прибыль/убыток в день:</span>
                      <span className={`font-medium ${result.profitLossPerDay >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {result.profitLossPerDay.toFixed(2)} ₽
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Дней до окупаемости поставки:</span>
                      <span className="font-medium">{result.daysToBreakEven}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Оптимальное количество для поставки:</span>
                      <span className="font-medium">{result.optimalOrderQuantity} шт</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="text-sm text-muted-foreground">
                        {result.isCurrentStorageProfitable 
                          ? 'Ваши текущие остатки товара оптимальны для прибыльного хранения на складе.'
                          : 'Рекомендуется уменьшить количество единиц товара на складе для снижения расходов на хранение.'
                        }
                        <div className="mt-1">
                          Оптимальный размер поставки: <span className="font-medium">{result.optimalOrderQuantity} шт</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>История анализов прибыльности хранения</CardTitle>
            </CardHeader>
            <CardContent>
              <HistoryList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Component for displaying history of profitability analyses
const HistoryList: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  
  useEffect(() => {
    try {
      const savedAnalyses = JSON.parse(localStorage.getItem('storage_profitability_analyses') || '[]');
      setHistory(savedAnalyses);
    } catch (error) {
      console.error('Failed to load analyses from localStorage', error);
      setHistory([]);
    }
  }, []);
  
  if (history.length === 0) {
    return <div className="text-center py-6 text-muted-foreground">История анализов пуста</div>;
  }
  
  return (
    <div className="space-y-4">
      {history.map((analysis) => (
        <div key={analysis.id} className="p-4 rounded-md border border-border bg-card">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">{analysis.productName}</h3>
            <span className="text-xs text-muted-foreground">
              {new Date(analysis.date).toLocaleDateString()} {new Date(analysis.date).toLocaleTimeString()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>Продаж в день: <span className="font-medium">{analysis.dailySales} шт</span></div>
            <div>Стоимость хранения: <span className="font-medium">{analysis.storageCost} ₽/день</span></div>
            <div>Стоимость поставки: <span className="font-medium">{analysis.shippingCost} ₽</span></div>
            <div>Текущие остатки: <span className="font-medium">{analysis.currentStock} шт</span></div>
          </div>
          <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
            <span>Статус: 
              <span className={`ml-1 font-medium ${analysis.result.isCurrentStorageProfitable ? 'text-green-500' : 'text-red-500'}`}>
                {analysis.result.isCurrentStorageProfitable ? 'Прибыльное' : 'Убыточное'}
              </span>
            </span>
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">Оптимальное количество:</span>
              <div className="flex items-center bg-muted px-2 py-1 rounded-md">
                <span className="font-medium">{analysis.result.optimalOrderQuantity} шт</span>
                <ArrowRightIcon className="h-3 w-3 mx-1" />
                <Save className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StorageProfitabilityAnalysis;
