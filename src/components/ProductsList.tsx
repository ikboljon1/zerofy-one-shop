import { useState } from "react";
import { Package, RefreshCw, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";

interface Product {
  nmID: number;
  vendorCode: string;
  brand: string;
  title: string;
  photos: Array<{
    big: string;
    c246x328: string;
  }>;
  costPrice?: number;
  price?: number;
  discountedPrice?: number;
  clubPrice?: number;
  expenses?: {
    logistics: number;
    storage: number;
    penalties: number;
    acceptance: number;
  };
}

interface ProductsListProps {
  selectedStore: {
    id: string;
    apiKey: string;
  } | null;
}

const ProductsList = ({ selectedStore }: ProductsListProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date>(() => subDays(new Date(), 7));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const fetchProductPrices = async (nmIds: number[]): Promise<Record<number, number>> => {
    if (!selectedStore?.apiKey) return {};

    try {
      const response = await fetch(
        "https://suppliers-api.wildberries.ru/public/api/v1/info",
        {
          method: "POST",
          headers: {
            "Authorization": selectedStore.apiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ nmIds })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch product prices');
      }

      const data = await response.json();
      return data.reduce((acc: Record<number, number>, item: any) => {
        acc[item.nmId] = item.price;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error fetching product prices:', error);
      return {};
    }
  };

  const calculateNetProfit = (product: Product) => {
    const salesData = JSON.parse(localStorage.getItem(`sales_${selectedStore?.id}`) || "{}");
    const productSales = salesData[product.nmID] || 0;

    const totalExpenses = product.expenses ? (
      (product.expenses.logistics * productSales) +
      (product.expenses.storage * productSales) +
      (product.expenses.penalties * productSales) +
      (product.expenses.acceptance * productSales)
    ) : 0;

    const revenue = (product.discountedPrice || 0) * productSales;

    const netProfit = revenue - totalExpenses - ((product.costPrice || 0) * productSales);

    return {
      totalExpenses,
      netProfit
    };
  };

  const updateCostPrice = (productId: number, newCostPrice: number) => {
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(product => {
        if (product.nmID === productId) {
          return { ...product, costPrice: newCostPrice };
        }
        return product;
      });

      if (selectedStore?.id) {
        localStorage.setItem(`products_${selectedStore.id}`, JSON.stringify(updatedProducts));
      }

      return updatedProducts;
    });
  };

  const renderDatePicker = (date: Date, onChange: (date: Date) => void, label: string) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => date && onChange(date)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );

  const fetchSalesReport = async () => {
    if (!selectedStore?.apiKey) return null;

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    try {
      const response = await fetch(
        `https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod?dateFrom=${formatDate(dateFrom)}&dateTo=${formatDate(dateTo)}&limit=100000`,
        {
          headers: {
            Authorization: selectedStore.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch sales report');
      }

      const data = await response.json();
      
      const salesReport = {
        dateFrom: formatDate(dateFrom),
        dateTo: formatDate(dateTo),
        data: data
      };
      
      localStorage.setItem(`sales_report_${selectedStore.id}`, JSON.stringify(salesReport));
      console.log('Saved sales report:', salesReport);
      
      return data;
    } catch (error) {
      console.error('Error fetching sales report:', error);
      return null;
    }
  };

  const syncProducts = async () => {
    if (!selectedStore) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите магазин",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let expensesByProduct: { [key: number]: {
        logistics: number,
        storage: number,
        penalties: number,
        acceptance: number
      }} = {};

      const salesReport = await fetchSalesReport();
      
      if (salesReport) {
        const salesByProduct: { [key: number]: number } = {};

        salesReport.forEach((item: any) => {
          if (item.doc_type_name === "Продажа") {
            salesByProduct[item.nm_id] = (salesByProduct[item.nm_id] || 0) + item.quantity;
            
            if (!expensesByProduct[item.nm_id]) {
              expensesByProduct[item.nm_id] = {
                logistics: 0,
                storage: 0,
                penalties: 0,
                acceptance: 0
              };
            }
            
            expensesByProduct[item.nm_id].logistics += item.delivery_rub || 0;
            expensesByProduct[item.nm_id].storage += item.storage_fee || 0;
            expensesByProduct[item.nm_id].penalties += item.penalty || 0;
            expensesByProduct[item.nm_id].acceptance += item.acceptance || 0;
          }
        });

        Object.keys(expensesByProduct).forEach(nmId => {
          const numId = Number(nmId);
          const sales = salesByProduct[numId] || 1;
          expensesByProduct[numId].logistics /= sales;
          expensesByProduct[numId].storage /= sales;
          expensesByProduct[numId].penalties /= sales;
          expensesByProduct[numId].acceptance /= sales;
        });

        localStorage.setItem(`sales_${selectedStore.id}`, JSON.stringify(salesByProduct));
        console.log('Saved sales data:', salesByProduct);
        console.log('Calculated expenses:', expensesByProduct);
      }

      const response = await fetch("https://content-api.wildberries.ru/content/v2/get/cards/list", {
        method: "POST",
        headers: {
          "Authorization": selectedStore.apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          settings: {
            cursor: {
              limit: 100
            },
            filter: {
              withPhoto: -1
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      console.log("Products data:", data);
      
      const storedProducts = JSON.parse(localStorage.getItem(`products_${selectedStore.id}`) || "[]");
      const costPrices = storedProducts.reduce((acc: Record<number, number>, product: Product) => {
        if (product.costPrice) {
          acc[product.nmID] = product.costPrice;
        }
        return acc;
      }, {});

      const nmIds = data.cards.map((product: Product) => product.nmID);
      const prices = await fetchProductPrices(nmIds);

      const updatedProducts = data.cards.map((product: Product) => {
        const currentPrice = prices[product.nmID];
        const productExpenses = expensesByProduct[product.nmID] || {
          logistics: 0,
          storage: 0,
          penalties: 0,
          acceptance: 0
        };
        
        console.log(`Processing product ${product.nmID}:`, {
          price: currentPrice,
          costPrice: costPrices[product.nmID],
          expenses: productExpenses
        });
        
        return {
          ...product,
          costPrice: costPrices[product.nmID] || 0,
          discountedPrice: currentPrice || 0,
          expenses: productExpenses
        };
      });

      console.log("Updated products:", updatedProducts);
      setProducts(updatedProducts);
      localStorage.setItem(`products_${selectedStore.id}`, JSON.stringify(updatedProducts));

      toast({
        title: "Успешно",
        description: "Товары успешно синхронизированы",
      });
    } catch (error) {
      console.error("Error syncing products:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось синхронизировать товары",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Товары</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          {renderDatePicker(dateFrom, setDateFrom, "Выберите начальную дату")}
          {renderDatePicker(dateTo, setDateTo, "Выберите конечную дату")}
          <Button onClick={syncProducts} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Синхронизация...
              </>
            ) : (
              <>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Синхронизировать
              </>
            )}
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Нет товаров для отображения</p>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-3'}`}>
          {products.map((product) => {
            const profitDetails = calculateNetProfit(product);
            
            return (
              <Card key={product.nmID} className="flex flex-col h-full">
                <CardHeader className="pb-2">
                  <CardTitle className={`${isMobile ? 'text-sm' : 'text-base'} font-medium line-clamp-2`}>
                    {product.title || "Неизвестный товар"}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    ID: {product.nmID}
                  </p>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <img
                    src={product.photos?.[0]?.c246x328 || "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg"}
                    alt={product.title}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label htmlFor={`costPrice-${product.nmID}`} className="text-xs text-muted-foreground">
                        Себестоимость:
                      </label>
                      <Input
                        id={`costPrice-${product.nmID}`}
                        type="number"
                        value={product.costPrice || ""}
                        onChange={(e) => updateCostPrice(product.nmID, Number(e.target.value))}
                        className="h-8 text-sm"
                        placeholder="Введите себестоимость"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">
                        Цена товара:
                      </label>
                      <div className="text-sm font-medium">
                        {product.discountedPrice ? `${product.discountedPrice.toFixed(2)} ₽` : "0.00 ₽"}
                      </div>
                    </div>
                    {product.expenses && (
                      <div className="space-y-1.5 border-t pt-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Логистика:</span>
                          <span>{product.expenses.logistics.toFixed(2)} ₽</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Хранение:</span>
                          <span>{product.expenses.storage.toFixed(2)} ₽</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Штрафы:</span>
                          <span>{product.expenses.penalties.toFixed(2)} ₽</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Приемка:</span>
                          <span>{product.expenses.acceptance.toFixed(2)} ₽</span>
                        </div>
                        <div className="flex justify-between text-xs font-medium border-t pt-2">
                          <span className="text-muted-foreground">Общие расходы:</span>
                          <span>{profitDetails.totalExpenses.toFixed(2)} ₽</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium border-t pt-2">
                          <span>Чистая прибыль:</span>
                          <span className={profitDetails.netProfit >= 0 ? "text-green-500" : "text-red-500"}>
                            {profitDetails.netProfit.toFixed(2)} ₽
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductsList;
