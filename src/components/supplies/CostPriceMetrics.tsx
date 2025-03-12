import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatCurrency";
import { Store } from "@/types/store";
import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, Wallet, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface CostPriceMetricsProps {
  selectedStore?: Store | null;
}

interface ProductData {
  nmId?: number;
  subject?: string;
  subject_name?: string;
  quantity?: number;
  costPrice?: number;
}

interface ProductSale {
  subject_name: string;
  quantity: number;
  nm_id?: number;
}

interface CostPriceData {
  totalCostPrice: number;
  totalSoldItems: number;
  avgCostPrice: number;
  lastUpdateDate: string;
}

const CostPriceMetrics: React.FC<CostPriceMetricsProps> = ({ selectedStore }) => {
  const [totalCostPrice, setTotalCostPrice] = useState<number>(0);
  const [totalSoldItems, setTotalSoldItems] = useState<number>(0);
  const [avgCostPrice, setAvgCostPrice] = useState<number>(0);
  const [lastUpdateDate, setLastUpdateDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCalculatingCostPrice, setIsCalculatingCostPrice] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedStore) {
      loadCostPriceData();
    } else {
      resetData();
    }
  }, [selectedStore]);

  const resetData = () => {
    setTotalCostPrice(0);
    setTotalSoldItems(0);
    setAvgCostPrice(0);
    setLastUpdateDate(null);
  };

  const loadCostPriceData = async () => {
    if (!selectedStore) return;

    setIsLoading(true);
    
    const savedMetrics = localStorage.getItem(`costPriceMetrics_${selectedStore.id}`);
    if (savedMetrics) {
      try {
        const parsedMetrics = JSON.parse(savedMetrics);
        console.log("Используем кэшированные данные о себестоимости из localStorage:", parsedMetrics);
        setTotalCostPrice(parsedMetrics.totalCostPrice);
        setTotalSoldItems(parsedMetrics.totalSoldItems);
        setAvgCostPrice(parsedMetrics.avgCostPrice);
        setLastUpdateDate(parsedMetrics.lastUpdateDate);
        setIsLoading(false);
      } catch (e) {
        console.error("Ошибка при разборе данных из localStorage:", e);
      }
    }
    
    try {
      const response = await axios.get(`http://localhost:3001/api/cost-price/${selectedStore.id}`);
      if (response.data && response.status === 200) {
        console.log("Получены данные из базы данных:", response.data);
        
        const dbDataTimestamp = new Date(response.data.lastUpdateDate).getTime();
        const localDataTimestamp = savedMetrics ? new Date(JSON.parse(savedMetrics).lastUpdateDate).getTime() : 0;
        
        if (!savedMetrics || dbDataTimestamp > localDataTimestamp) {
          setTotalCostPrice(response.data.totalCostPrice);
          setTotalSoldItems(response.data.totalSoldItems);
          setAvgCostPrice(response.data.avgCostPrice);
          setLastUpdateDate(response.data.lastUpdateDate);
          
          localStorage.setItem(`costPriceMetrics_${selectedStore.id}`, JSON.stringify({
            totalCostPrice: response.data.totalCostPrice,
            totalSoldItems: response.data.totalSoldItems,
            avgCostPrice: response.data.avgCostPrice,
            lastUpdateDate: response.data.lastUpdateDate,
            timestamp: new Date().getTime()
          }));
          
          toast({
            title: "Данные обновлены",
            description: "Получены свежие данные о себестоимости из базы данных",
          });
        }
      }
    } catch (error) {
      console.error("Ошибка загрузки данных из базы данных:", error);
      
      if (!savedMetrics) {
        calculateFromLocalStorage();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromDatabase = async (storeId: string): Promise<CostPriceData | null> => {
    try {
      const response = await axios.get(`http://localhost:3001/api/cost-price/${storeId}`);
      if (response.data && response.status === 200) {
        return {
          totalCostPrice: response.data.totalCostPrice,
          totalSoldItems: response.data.totalSoldItems,
          avgCostPrice: response.data.avgCostPrice,
          lastUpdateDate: response.data.lastUpdateDate
        };
      }
      return null;
    } catch (error) {
      console.error("Ошибка загрузки данных из базы:", error);
      return null;
    }
  };

  const saveToDatabase = async (storeId: string, data: CostPriceData) => {
    try {
      await axios.post('http://localhost:3001/api/cost-price', {
        storeId,
        totalCostPrice: data.totalCostPrice,
        totalSoldItems: data.totalSoldItems,
        avgCostPrice: data.avgCostPrice,
        lastUpdateDate: data.lastUpdateDate
      });
      console.log("Данные о себестоимости сохранены в базу данных");
    } catch (error) {
      console.error("Ошибка сохранения данных в базу:", error);
      
      localStorage.setItem(`costPriceMetrics_${storeId}`, JSON.stringify({
        totalCostPrice: data.totalCostPrice,
        totalSoldItems: data.totalSoldItems,
        avgCostPrice: data.avgCostPrice,
        lastUpdateDate: data.lastUpdateDate,
        timestamp: new Date().getTime()
      }));
      console.log("Данные сохранены в localStorage в качестве резервной копии");
    }
  };

  const calculateFromLocalStorage = async () => {
    if (!selectedStore) return;

    setIsCalculatingCostPrice(true);
    
    try {
      const costPrices = JSON.parse(localStorage.getItem(`costPrices_${selectedStore.id}`) || "{}");
      console.log("Загруженные данные о себестоимости:", costPrices);
      
      const analyticsData = JSON.parse(localStorage.getItem(`marketplace_analytics_${selectedStore.id}`) || "{}");
      
      if (!analyticsData?.data?.productSales || analyticsData.data.productSales.length === 0) {
        console.log("Нет данных о продажах товаров в аналитике");
        toast({
          title: "Нет данных о продажах",
          description: "Не найдены данные о продажах товаров в аналитике",
          variant: "default",
        });
        setIsCalculatingCostPrice(false);
        return;
      }
      
      const productSales: ProductSale[] = analyticsData.data.productSales;
      const productReturns = analyticsData.data.productReturns || [];
      
      console.log(`Найдено ${productSales.length} категорий продаж и ${productReturns.length} возвратов`);
      
      let totalCost = 0;
      let totalItems = 0;
      let processedCategories = 0;
      let skippedCategories = 0;
      
      const returnsMap = new Map();
      productReturns.forEach((return_item: any) => {
        const nmId = return_item.nm_id || return_item.nmId;
        if (nmId) {
          const currentCount = returnsMap.get(nmId) || 0;
          returnsMap.set(nmId, currentCount + (return_item.quantity || 1));
        }
      });
      
      for (const sale of productSales) {
        if (!sale.nm_id) {
          console.log(`Пропускаем категорию "${sale.subject_name}" - нет nm_id`);
          skippedCategories++;
          continue;
        }
        
        const nmId = Number(sale.nm_id);
        const returns = returnsMap.get(nmId) || 0;
        const quantity = (sale.quantity || 0) - returns;
        
        if (quantity <= 0) {
          console.log(`Пропускаем категорию "${sale.subject_name}" после учета возвратов (${returns} возвратов)`);
          continue;
        }
        
        console.log(`Обработка товара с nmId ${nmId}, категория: "${sale.subject_name}", количество: ${quantity} (возвраты: ${returns})`);
        
        let costPrice = costPrices[nmId];
        if (!costPrice) {
          const product = products.find((p: any) => Number(p.nmId) === nmId);
          if (product?.costPrice > 0) {
            costPrice = product.costPrice;
            costPrices[nmId] = costPrice;
            localStorage.setItem(`costPrices_${selectedStore.id}`, JSON.stringify(costPrices));
          }
        }
        
        if (costPrice > 0) {
          const categoryCost = costPrice * quantity;
          totalCost += categoryCost;
          totalItems += quantity;
          processedCategories++;
          
          console.log(`Успешно рассчитано для "${sale.subject_name}": ${quantity} x ${costPrice} = ${categoryCost}`);
        } else {
          console.log(`Не удалось определить себестоимость для nmId ${nmId}`);
          skippedCategories++;
        }
      }
      
      console.log(`Обработано ${processedCategories} категорий, пропущено ${skippedCategories} категорий`);
      console.log(`Общая себестоимость: ${totalCost}, Всего проданных товаров: ${totalItems}`);
      
      const avgCost = totalItems > 0 ? totalCost / totalItems : 0;
      const currentDate = new Date().toISOString();
      
      setTotalCostPrice(totalCost);
      setTotalSoldItems(totalItems);
      setAvgCostPrice(avgCost);
      setLastUpdateDate(currentDate);
      
      if (analyticsData && analyticsData.data && analyticsData.data.currentPeriod && analyticsData.data.currentPeriod.expenses) {
        analyticsData.data.currentPeriod.expenses.costPrice = totalCost;
        localStorage.setItem(`marketplace_analytics_${selectedStore.id}`, JSON.stringify(analyticsData));
        console.log(`Обновлены данные аналитики с себестоимостью: ${totalCost}`);
      }
      
      const costPriceData = {
        totalCostPrice: totalCost,
        totalSoldItems: totalItems,
        avgCostPrice: avgCost,
        lastUpdateDate: currentDate
      };
      
      await saveToDatabase(selectedStore.id, costPriceData);
      
      localStorage.setItem(`costPriceMetrics_${selectedStore.id}`, JSON.stringify({
        ...costPriceData,
        timestamp: new Date().getTime()
      }));
      
      if (processedCategories > 0) {
        toast({
          title: "Расчет выполнен",
          description: `Успешно рассчитана себестоимость для ${processedCategories} категорий товаров`,
          variant: "default",
        });
      }
      
      if (skippedCategories > 0) {
        toast({
          title: "Внимание",
          description: `Не удалось определить себестоимость для ${skippedCategories} категорий товаров`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Ошибка расчета себестоимости из localStorage:", error);
      toast({
        title: "Ошибка расчета данных",
        description: "Произошла ошибка при расчете данных о себестоимости",
        variant: "destructive",
      });
    } finally {
      setIsCalculatingCostPrice(false);
    }
  };

  const refreshData = () => {
    if (selectedStore) {
      loadCostPriceData();
    }
  };

  const calculateCostPrice = () => {
    if (selectedStore) {
      calculateFromLocalStorage();
    }
  };

  if (!selectedStore) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Статистика себестоимости</h2>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
              <span className="text-xs text-muted-foreground">Загрузка...</span>
            </div>
          ) : (
            <>
              {lastUpdateDate && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Обновлено: {new Date(lastUpdateDate).toLocaleString('ru-RU')}
                </Badge>
              )}
              <button 
                onClick={refreshData}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Обновить данные"
                disabled={isLoading || isCalculatingCostPrice}
              >
                <RefreshCw className={`h-4 w-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center text-blue-700 dark:text-blue-400">
              <DollarSign className="mr-2 h-4 w-4" />
              Общая себестоимость
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {formatCurrency(totalCostPrice)}
            </div>
            <p className="text-sm text-blue-600/70 dark:text-blue-400/70 mt-1">
              Для всех проданных товаров
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center text-green-700 dark:text-green-400">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Продано товаров
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {totalSoldItems}
            </div>
            <p className="text-sm text-green-600/70 dark:text-green-400/70 mt-1">
              Общее количество проданных единиц
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center text-amber-700 dark:text-amber-400">
              <Wallet className="mr-2 h-4 w-4" />
              Средняя себестоимость
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
              {formatCurrency(avgCostPrice)}
            </div>
            <p className="text-sm text-amber-600/70 dark:text-amber-400/70 mt-1">
              На единицу проданного товара
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-4">
        <Button 
          onClick={calculateCostPrice}
          disabled={isCalculatingCostPrice}
          className="w-full md:w-auto"
          variant="outline"
        >
          {isCalculatingCostPrice ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-b-2 border-current"></div>
              Расчет себестоимости...
            </>
          ) : (
            <>Рассчитать себестоимость товаров</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CostPriceMetrics;
