
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import PeriodSelector, { Period } from "./PeriodSelector";
import { fetchWildberriesStats } from "@/services/wildberriesApi";
import { loadStores } from "@/utils/storeUtils";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatCurrency";

interface FinancialData {
  category: string;
  amount: number;
  description?: string;
}

const FinancialReports = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [period, setPeriod] = useState<Period>("today");
  const [isLoading, setIsLoading] = useState(false);
  const [incomeData, setIncomeData] = useState<FinancialData[]>([]);
  const [expensesData, setExpensesData] = useState<FinancialData[]>([]);
  const [deductionsData, setDeductionsData] = useState<FinancialData[]>([]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const stores = loadStores();
      const selectedStore = stores.find(s => s.isSelected);
      
      if (!selectedStore) {
        toast({
          title: "Внимание",
          description: "Выберите основной магазин в разделе 'Магазины'",
          variant: "destructive"
        });
        return;
      }

      // Расчет дат на основе выбранного периода
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let startDate = new Date(todayStart);
      
      switch (period) {
        case "today":
          startDate = new Date(todayStart);
          break;
        case "yesterday":
          startDate = new Date(todayStart);
          startDate.setDate(startDate.getDate() - 1);
          break;
        case "week":
          startDate = new Date(todayStart);
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "2weeks":
          startDate = new Date(todayStart);
          startDate.setDate(startDate.getDate() - 14);
          break;
        case "4weeks":
          startDate = new Date(todayStart);
          startDate.setDate(startDate.getDate() - 28);
          break;
      }

      const result = await fetchWildberriesStats(selectedStore.apiKey, startDate, now);
      
      if (result) {
        // Данные о доходах
        const income: FinancialData[] = [
          { 
            category: "Продажи", 
            amount: result.currentPeriod.sales,
            description: "Общая сумма продаж"
          },
          { 
            category: "К перечислению", 
            amount: result.currentPeriod.transferred,
            description: "Сумма к перечислению за товар" 
          }
        ];
        setIncomeData(income);
        
        // Данные о расходах
        const expenses: FinancialData[] = [
          { 
            category: "Логистика", 
            amount: result.currentPeriod.expenses.logistics,
            description: "Стоимость логистики" 
          },
          { 
            category: "Хранение", 
            amount: result.currentPeriod.expenses.storage,
            description: "Стоимость хранения" 
          },
          { 
            category: "Штрафы", 
            amount: result.currentPeriod.expenses.penalties,
            description: "Штрафы за отчетный период" 
          },
          { 
            category: "Приемка", 
            amount: result.currentPeriod.expenses.acceptance,
            description: "Стоимость платной приемки" 
          },
          { 
            category: "Реклама", 
            amount: result.currentPeriod.expenses.advertising,
            description: "Рекламные расходы" 
          }
        ];
        setExpensesData(expenses);
        
        // Данные по удержаниям и компенсациям
        if (result.deductionsData && result.deductionsData.length > 0) {
          const deductions = result.deductionsData.map(item => ({
            category: item.name,
            amount: item.value,
            description: item.isNegative ? "Удержание" : "Компенсация"
          }));
          setDeductionsData(deductions);
        } else {
          setDeductionsData([]);
        }
        
        toast({
          title: "Успех",
          description: "Финансовые данные успешно загружены",
        });
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить финансовые данные",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  // Расчет суммы по всем удержаниям и компенсациям, включая отрицательные значения
  const calculateDeductionsTotal = () => {
    return deductionsData.reduce((sum, item) => sum + item.amount, 0);
  };

  return (
    <div className="space-y-4">
      <div className={`mb-4 ${isMobile ? 'w-full' : 'flex items-center gap-4'}`}>
        <PeriodSelector value={period} onChange={setPeriod} />
        {isLoading && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Загрузка данных...
          </div>
        )}
        <div className="flex-grow"></div>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Доходы</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Категория</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
                <TableHead className="hidden md:table-cell">Описание</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomeData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                  <TableCell className="hidden md:table-cell">{item.description}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-green-50 dark:bg-green-900/10">
                <TableCell className="font-bold">Чистая прибыль</TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(incomeData.reduce((sum, item) => sum + item.amount, 0) - 
                    expensesData.reduce((sum, item) => sum + item.amount, 0))}
                </TableCell>
                <TableCell className="hidden md:table-cell">Доходы минус расходы</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Расходы</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Категория</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
                <TableHead className="hidden md:table-cell">Описание</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expensesData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                  <TableCell className="hidden md:table-cell">{item.description}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                <TableCell className="font-bold">Итого расходы</TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(expensesData.reduce((sum, item) => sum + item.amount, 0))}
                </TableCell>
                <TableCell className="hidden md:table-cell">Общая сумма расходов</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {deductionsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Удержания и компенсации</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[240px]">Категория</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                  <TableHead className="hidden md:table-cell">Тип</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deductionsData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.category}</TableCell>
                    <TableCell className={`text-right ${item.amount < 0 ? 'text-red-500' : ''}`}>
                      {formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{item.description}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                  <TableCell className="font-bold">Итого</TableCell>
                  <TableCell className={`text-right font-bold ${calculateDeductionsTotal() < 0 ? 'text-red-500' : ''}`}>
                    {formatCurrency(calculateDeductionsTotal())}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">Общий баланс удержаний и компенсаций</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialReports;
