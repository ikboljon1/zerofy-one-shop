
import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Имитация данных для демонстрации
const MOCK_PRODUCT_DATA = [
  { id: 1, name: "Футболка черная", sales: 245, revenue: 73500, profit: 22050 },
  { id: 2, name: "Джинсы классические", sales: 189, revenue: 113400, profit: 45360 },
  { id: 3, name: "Куртка зимняя", sales: 124, revenue: 167400, profit: 58590 },
  { id: 4, name: "Кроссовки спортивные", sales: 203, revenue: 101500, profit: 35525 },
  { id: 5, name: "Рубашка белая", sales: 167, revenue: 41750, profit: 16700 },
  { id: 6, name: "Шапка вязаная", sales: 231, revenue: 34650, profit: 17325 },
  { id: 7, name: "Перчатки кожаные", sales: 118, revenue: 29500, profit: 11800 },
  { id: 8, name: "Сумка дорожная", sales: 92, revenue: 55200, profit: 22080 },
];

const MOCK_CATEGORY_DATA = [
  { id: 1, name: "Одежда", sales: 601, revenue: 228650, profit: 84100 },
  { id: 2, name: "Обувь", sales: 203, revenue: 101500, profit: 35525 },
  { id: 3, name: "Аксессуары", sales: 441, revenue: 119350, profit: 51205 },
];

const AnalyticsDetails = () => {
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState<Date>(() => subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [productData, setProductData] = useState(MOCK_PRODUCT_DATA);
  const [categoryData, setCategoryData] = useState(MOCK_CATEGORY_DATA);

  const fetchData = async () => {
    setIsLoading(true);
    console.log("Fetching details for period:", dateFrom, "to", dateTo);
    
    try {
      // В будущем здесь будет запрос к API
      // const response = await fetch(`/api/analytics/details?from=${from}&to=${to}`);
      // const data = await response.json();
      
      // Имитация задержки запроса
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Обновляем случайные данные для демонстрации
      const updatedProductData = productData.map(product => ({
        ...product,
        sales: Math.round(product.sales * (0.8 + Math.random() * 0.4)),
        revenue: Math.round(product.revenue * (0.8 + Math.random() * 0.4)),
        profit: Math.round(product.profit * (0.8 + Math.random() * 0.4))
      }));
      
      const updatedCategoryData = categoryData.map(category => ({
        ...category,
        sales: Math.round(category.sales * (0.8 + Math.random() * 0.4)),
        revenue: Math.round(category.revenue * (0.8 + Math.random() * 0.4)),
        profit: Math.round(category.profit * (0.8 + Math.random() * 0.4))
      }));
      
      setProductData(updatedProductData);
      setCategoryData(updatedCategoryData);
      
      toast({
        title: "Данные обновлены",
        description: `Период: ${format(dateFrom, 'dd.MM.yyyy')} - ${format(dateTo, 'dd.MM.yyyy')}`,
      });
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить детальную аналитику",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-auto justify-start text-left font-normal",
                !dateFrom && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, "PPP") : <span>Выберите дату</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={(date) => {
                console.log("Selected details date from:", date);
                if (date) setDateFrom(date);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-auto justify-start text-left font-normal",
                !dateTo && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo ? format(dateTo, "PPP") : <span>Выберите дату</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={(date) => {
                console.log("Selected details date to:", date);
                if (date) setDateTo(date);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <Button 
          onClick={fetchData} 
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Загрузка...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Обновить
            </>
          )}
        </Button>
      </div>
      
      <div className="grid gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Продажи по категориям</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3">Категория</th>
                  <th className="text-right pb-3">Продажи (шт)</th>
                  <th className="text-right pb-3">Выручка</th>
                  <th className="text-right pb-3">Прибыль</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((category) => (
                  <tr key={category.id} className="border-b hover:bg-muted/50">
                    <td className="py-3">{category.name}</td>
                    <td className="py-3 text-right">{category.sales}</td>
                    <td className="py-3 text-right">{category.revenue.toLocaleString('ru-RU')} ₽</td>
                    <td className="py-3 text-right">{category.profit.toLocaleString('ru-RU')} ₽</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="py-3">Итого</td>
                  <td className="py-3 text-right">
                    {categoryData.reduce((sum, item) => sum + item.sales, 0)}
                  </td>
                  <td className="py-3 text-right">
                    {categoryData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="py-3 text-right">
                    {categoryData.reduce((sum, item) => sum + item.profit, 0).toLocaleString('ru-RU')} ₽
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Продажи по товарам</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3">Товар</th>
                  <th className="text-right pb-3">Продажи (шт)</th>
                  <th className="text-right pb-3">Выручка</th>
                  <th className="text-right pb-3">Прибыль</th>
                </tr>
              </thead>
              <tbody>
                {productData.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-muted/50">
                    <td className="py-3">{product.name}</td>
                    <td className="py-3 text-right">{product.sales}</td>
                    <td className="py-3 text-right">{product.revenue.toLocaleString('ru-RU')} ₽</td>
                    <td className="py-3 text-right">{product.profit.toLocaleString('ru-RU')} ₽</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDetails;
