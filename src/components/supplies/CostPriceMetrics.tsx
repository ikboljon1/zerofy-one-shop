
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatCurrency";
import { Store } from "@/types/store";
import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, Wallet } from "lucide-react";
import { getCostPriceByNmId, getCostPriceBySubjectName } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

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

interface SalesByCategory {
  [key: string]: number;
}

const CostPriceMetrics: React.FC<CostPriceMetricsProps> = ({ selectedStore }) => {
  const [totalCostPrice, setTotalCostPrice] = useState<number>(0);
  const [totalSoldItems, setTotalSoldItems] = useState<number>(0);
  const [avgCostPrice, setAvgCostPrice] = useState<number>(0);
  const [lastUpdateDate, setLastUpdateDate] = useState<string | null>(null);
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

    try {
      // Загружаем данные о товарах
      const products: ProductData[] = JSON.parse(localStorage.getItem(`products_${selectedStore.id}`) || "[]");
      if (products.length === 0) {
        console.log("Товары не найдены в localStorage");
        return;
      }

      console.log("Пример загруженных товаров:", products.slice(0, 3).map((p: ProductData) => ({
        nmId: p.nmId,
        subject: p.subject || p.subject_name,
        costPrice: p.costPrice,
        quantity: p.quantity
      })));

      // Загружаем аналитические данные
      const analyticsData = JSON.parse(localStorage.getItem(`marketplace_analytics_${selectedStore.id}`) || "{}");
      
      // Если аналитических данных нет, используем только данные о товарах
      if (!analyticsData || !analyticsData.data || !analyticsData.data.productSales) {
        console.log("Аналитические данные не найдены в localStorage");
        
        let totalCost = 0;
        let itemsSold = 0;
        
        for (const product of products) {
          const quantity = product.quantity || 0;
          let costPrice = product.costPrice || 0;
          
          if (costPrice === 0 && product.nmId) {
            costPrice = await getCostPriceByNmId(product.nmId, selectedStore.id);
          }
          
          if (costPrice === 0 && (product.subject || product.subject_name)) {
            costPrice = await getCostPriceBySubjectName(
              product.subject || product.subject_name || "", 
              selectedStore.id
            );
          }
          
          if (quantity > 0 && costPrice > 0) {
            totalCost += quantity * costPrice;
            itemsSold += quantity;
            console.log(`Товар nmId=${product.nmId}, категория=${product.subject || product.subject_name}, количество=${quantity}, себестоимость=${costPrice}`);
          }
        }
        
        console.log(`Используем только данные о товарах. Общая себестоимость: ${totalCost}, Всего товаров: ${itemsSold}`);
        setTotalCostPrice(totalCost);
        setTotalSoldItems(itemsSold);
        setAvgCostPrice(itemsSold > 0 ? totalCost / itemsSold : 0);
        setLastUpdateDate(new Date().toISOString());
        return;
      }
      
      console.log("Используем аналитические данные для расчета себестоимости");
      
      // Получаем данные о продажах по категориям (subject_name)
      const productSales = analyticsData.data.productSales || [];
      console.log(`Найдено ${productSales.length} категорий товаров в аналитике`);
      
      if (productSales.length === 0) {
        console.log("Нет данных о продажах товаров в аналитике");
        return;
      }
      
      // Создаем карту соответствия категорий и товаров
      const categoryToProductsMap: Record<string, ProductData[]> = {};
      
      // Группируем товары по категориям
      for (const product of products) {
        const category = product.subject || product.subject_name;
        if (category) {
          if (!categoryToProductsMap[category]) {
            categoryToProductsMap[category] = [];
          }
          categoryToProductsMap[category].push(product);
        }
      }
      
      console.log("Карта соответствия категорий и товаров:", Object.keys(categoryToProductsMap));
      
      let totalCost = 0;
      let totalItems = 0;
      
      // Обрабатываем продажи по категориям
      for (const categorySale of productSales) {
        const category = categorySale.subject_name;
        const quantitySold = categorySale.quantity || 0;
        
        if (!category || quantitySold <= 0) {
          console.log(`Пропускаем категорию без названия или с нулевым количеством: ${JSON.stringify(categorySale)}`);
          continue;
        }
        
        console.log(`Обрабатываем категорию: ${category}, продано: ${quantitySold} шт.`);
        
        // Ищем товары данной категории
        const categoryProducts = categoryToProductsMap[category] || [];
        console.log(`Найдено ${categoryProducts.length} товаров в категории ${category}`);
        
        if (categoryProducts.length === 0) {
          // Если товаров категории не найдено, пробуем получить себестоимость по имени категории
          const categoryCostPrice = await getCostPriceBySubjectName(category, selectedStore.id);
          
          if (categoryCostPrice > 0) {
            const categoryTotalCost = categoryCostPrice * quantitySold;
            totalCost += categoryTotalCost;
            totalItems += quantitySold;
            console.log(`Используем себестоимость по категории ${category}: ${categoryCostPrice} * ${quantitySold} = ${categoryTotalCost}`);
          } else {
            console.log(`Не удалось определить себестоимость для категории ${category}`);
            
            // Показываем уведомление о невозможности рассчитать себестоимость для категории
            toast({
              title: "Внимание",
              description: `Не удалось определить себестоимость для категории "${category}". Добавьте эту категорию товарам в разделе "Товары".`,
              variant: "warning"
            });
          }
          continue;
        }
        
        // Рассчитываем среднюю себестоимость товаров в категории
        let categoryTotalCostPrice = 0;
        let categoryProductsWithCost = 0;
        
        for (const product of categoryProducts) {
          let costPrice = product.costPrice || 0;
          
          if (costPrice === 0 && product.nmId) {
            costPrice = await getCostPriceByNmId(product.nmId, selectedStore.id);
          }
          
          if (costPrice > 0) {
            categoryTotalCostPrice += costPrice;
            categoryProductsWithCost++;
          }
        }
        
        const averageCategoryPrice = categoryProductsWithCost > 0 
          ? categoryTotalCostPrice / categoryProductsWithCost 
          : 0;
        
        if (averageCategoryPrice > 0) {
          const categoryTotalCost = averageCategoryPrice * quantitySold;
          totalCost += categoryTotalCost;
          totalItems += quantitySold;
          console.log(`Средняя себестоимость для категории ${category}: ${averageCategoryPrice} * ${quantitySold} = ${categoryTotalCost}`);
        } else {
          console.log(`Не удалось рассчитать среднюю себестоимость для категории ${category}`);
        }
      }
      
      console.log(`Общая себестоимость: ${totalCost}, Всего проданных товаров: ${totalItems}`);
      setTotalCostPrice(totalCost);
      setTotalSoldItems(totalItems);
      setAvgCostPrice(totalItems > 0 ? totalCost / totalItems : 0);
      
      setLastUpdateDate(new Date().toISOString());
      
      // Сохраняем рассчитанную себестоимость в localStorage
      if (analyticsData.data && analyticsData.data.currentPeriod && analyticsData.data.currentPeriod.expenses) {
        analyticsData.data.currentPeriod.expenses.costPrice = totalCost;
        localStorage.setItem(`marketplace_analytics_${selectedStore.id}`, JSON.stringify(analyticsData));
        console.log("Обновлены данные о себестоимости в localStorage");
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных о себестоимости:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось рассчитать данные о себестоимости товаров",
        variant: "destructive"
      });
    }
  };

  if (!selectedStore) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Статистика себестоимости</h2>
        {lastUpdateDate && (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Последнее обновление: {new Date(lastUpdateDate).toLocaleString('ru-RU')}
          </Badge>
        )}
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
    </div>
  );
};

export default CostPriceMetrics;
