
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import PeriodSelector, { Period } from "./PeriodSelector";
import { fetchWildberriesStats, fetchAllReportDetails } from "@/services/wildberriesApi";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// Интерфейс для данных отчета детализации Wildberries
interface ReportDetailItem {
  realizationreport_id: number;
  date_from: string;
  date_to: string;
  create_dt: string;
  currency_name: string;
  suppliercontract_code: string | null;
  rrd_id: number;
  gi_id: number;
  subject_name: string;
  nm_id: number;
  brand_name: string;
  sa_name: string;
  ts_name: string;
  barcode: string;
  doc_type_name: string;
  quantity: number;
  retail_price: number;
  retail_amount: number;
  sale_percent: number;
  commission_percent: number;
  office_name: string;
  supplier_oper_name: string;
  order_dt: string;
  sale_dt: string;
  rr_dt: string;
  shk_id: number;
  retail_price_withdisc_rub: number;
  delivery_amount: number;
  return_amount: number;
  delivery_rub: number;
  gi_box_type_name: string;
  product_discount_for_report: number;
  supplier_promo: number;
  rid: number;
  ppvz_spp_prc: number;
  ppvz_kvw_prc_base: number;
  ppvz_kvw_prc: number;
  sup_rating_prc_up: number;
  is_kgvp_v2: number;
  ppvz_sales_commission: number;
  ppvz_for_pay: number;
  ppvz_reward: number;
  acquiring_fee: number;
  acquiring_percent: number;
  payment_processing: string;
  acquiring_bank: string;
  ppvz_vw: number;
  ppvz_vw_nds: number;
  ppvz_office_name: string;
  ppvz_office_id: number;
  ppvz_supplier_id: number;
  ppvz_supplier_name: string;
  ppvz_inn: string;
  declaration_number: string;
  bonus_type_name: string | null;
  sticker_id: string;
  site_country: string;
  penalty: number;
  additional_payment: number;
  rebill_logistic_cost: number;
  rebill_logistic_org: string;
  storage_fee: number;
  deduction: number;
  acceptance: number;
  [key: string]: any; // Для любых других полей, которые могут быть в API
}

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
  const [detailedReportData, setDetailedReportData] = useState<ReportDetailItem[]>([]);
  const [activeTab, setActiveTab] = useState("summary");

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

      // Получаем сводные данные
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

      // Получаем детализированные данные отчета
      try {
        const detailedReport = await fetchAllReportDetails(selectedStore.apiKey, startDate, now);
        if (detailedReport && detailedReport.length > 0) {
          setDetailedReportData(detailedReport);
        } else {
          // Если нет данных, используем демо-данные для отображения структуры
          setDetailedReportData([{
            realizationreport_id: 1234567,
            date_from: "2022-10-17",
            date_to: "2022-10-23",
            create_dt: "2022-10-24",
            currency_name: "руб",
            suppliercontract_code: null,
            rrd_id: 1232610467,
            gi_id: 123456,
            dlv_prc: 1.8,
            fix_tariff_date_from: "2024-10-23",
            fix_tariff_date_to: "2024-11-18",
            subject_name: "Мини-печи",
            nm_id: 1234567,
            brand_name: "BlahBlah",
            sa_name: "MAB123",
            ts_name: "0",
            barcode: "1231312352310",
            doc_type_name: "Продажа",
            quantity: 1,
            retail_price: 1249,
            retail_amount: 367,
            sale_percent: 68,
            commission_percent: 0.1324,
            office_name: "Коледино",
            supplier_oper_name: "Продажа",
            order_dt: "2022-10-13T00:00:00Z",
            sale_dt: "2022-10-20T00:00:00Z",
            rr_dt: "2022-10-20",
            shk_id: 1239159661,
            retail_price_withdisc_rub: 399.68,
            delivery_amount: 0,
            return_amount: 0,
            delivery_rub: 0,
            gi_box_type_name: "Монопаллета",
            product_discount_for_report: 399.68,
            supplier_promo: 0,
            rid: 123722249253,
            ppvz_spp_prc: 0.1581,
            ppvz_kvw_prc_base: 0.15,
            ppvz_kvw_prc: -0.0081,
            sup_rating_prc_up: 0,
            is_kgvp_v2: 0,
            ppvz_sales_commission: -3.74,
            ppvz_for_pay: 376.99,
            ppvz_reward: 0,
            acquiring_fee: 14.89,
            acquiring_percent: 4.06,
            payment_processing: "Комиссия за организацию платежа с НДС",
            acquiring_bank: "Тинькофф",
            ppvz_vw: -3.74,
            ppvz_vw_nds: -0.75,
            ppvz_office_name: "Пункт самовывоза (ПВЗ)",
            ppvz_office_id: 105383,
            ppvz_supplier_id: 186465,
            ppvz_supplier_name: "ИП Жасмин",
            ppvz_inn: "010101010101",
            declaration_number: "",
            bonus_type_name: "Штраф МП. Невыполненный заказ (отмена клиентом после недовоза)",
            sticker_id: "1964038895",
            site_country: "Россия",
            srv_dbs: true,
            penalty: 231.35,
            additional_payment: 0,
            rebill_logistic_cost: 1.349,
            rebill_logistic_org: "ИП Иванов Иван Иванович(123456789012)",
            storage_fee: 12647.29,
            deduction: 6354,
            acceptance: 865,
            assembly_id: 2816993144,
            kiz: "0102900000376311210G2CIS?ehge)S91002A92F9Qof4FDo/31Icm14kmtuVYQzLypxm3HWkC1vQ/+pVVjm1dNAth1laFMoAGn7yEMWlTjxIe7lQnJqZ7TRZhlHQ==",
            srid: "0f1c3999172603062979867564654dac5b702849",
            report_type: 1,
            is_legal_entity: false,
            trbx_id: "WB-TRBX-1234567"
          }]);
        }
      } catch (error) {
        console.error('Error fetching detailed report:', error);
        toast({
          title: "Предупреждение",
          description: "Не удалось загрузить детальный отчет, показаны демо-данные",
          variant: "destructive"
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

  const renderReportDetailTable = () => {
    if (!detailedReportData || detailedReportData.length === 0) {
      return <p className="text-center py-4">Нет данных для отображения</p>;
    }

    // Получаем первую запись для заголовков таблицы
    const firstRecord = detailedReportData[0];
    const columns = Object.keys(firstRecord).filter(key => 
      // Исключаем некоторые технические поля если нужно
      key !== 'kiz' && key !== 'srid'
    );

    return (
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(column => (
                <TableHead key={column} className="whitespace-nowrap">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {detailedReportData.map((record, recordIndex) => (
              <TableRow key={recordIndex}>
                {columns.map(column => (
                  <TableCell key={`${recordIndex}-${column}`} className="whitespace-nowrap">
                    {typeof record[column] === 'number' 
                      ? column.includes('price') || column.includes('amount') || column.includes('fee') || column.includes('pay') 
                        ? formatCurrency(record[column]) 
                        : record[column].toString()
                      : record[column]?.toString() || '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    );
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary" className={isMobile ? 'text-xs py-1 px-1' : ''}>Сводка</TabsTrigger>
          <TabsTrigger value="detailed" className={isMobile ? 'text-xs py-1 px-1' : ''}>Детальный отчет</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Детальный отчет реализации</CardTitle>
            </CardHeader>
            <CardContent>
              {renderReportDetailTable()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialReports;
