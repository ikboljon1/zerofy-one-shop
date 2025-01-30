import { useState } from "react";
import { Package, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

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
  quantity?: number;
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

interface WBPriceResponse {
  data: {
    listGoods: Array<{
      nmID: number;
      vendorCode: string;
      sizes: Array<{
        price: number;
        discountedPrice: number;
        clubDiscountedPrice: number;
      }>;
    }>;
  };
}

const ProductsList = ({ selectedStore }: ProductsListProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const calculateNetProfit = (product: Product) => {
    if (!product.costPrice || !product.expenses) return {
      netProfit: 0,
      productSales: 0,
      totalExpenses: 0,
      revenue: 0
    };
    
    // Получаем данные о продажах из localStorage
    const salesData = JSON.parse(localStorage.getItem(`sales_${selectedStore?.id}`) || '{}');
    console.log('Sales data from localStorage:', salesData);
    
    // Получаем количество продаж для конкретного товара
    const productSales = product.quantity || salesData[product.nmID] || 0;
    console.log('Product sales for ID', product.nmID, ':', productSales);
    
    // Расчет общих расходов с учетом количества проданных товаров
    const totalExpenses = 
      (product.expenses.logistics * productSales) +     // Логистика
      (product.expenses.storage * productSales) +       // Хранение
      (product.expenses.penalties * productSales) +     // Штрафы
      (product.expenses.acceptance * productSales);     // Приемка
    
    console.log('Calculation details for product', product.nmID, {
      costPrice: product.costPrice,
      productSales,
      logistics: product.expenses.logistics,
      storage: product.expenses.storage,
      penalties: product.expenses.penalties,
      acceptance: product.expenses.acceptance,
      totalExpenses
    });
    
    // Расчет выручки: цена продажи * количество проданных товаров
    const revenue = (product.discountedPrice || 0) * productSales;
    console.log('Revenue calculation:', {
      discountedPrice: product.discountedPrice,
      productSales,
      revenue
    });
    
    // Чистая прибыль = выручка - общие расходы - (себестоимость * количество)
    const netProfit = revenue - totalExpenses - (product.costPrice * productSales);
    console.log('Net profit calculation:', {
      revenue,
      totalExpenses,
      costPrice: product.costPrice,
      productSales,
      netProfit
    });
    
    return {
      netProfit,
      productSales,
      totalExpenses,
      revenue
    };
  };

  const fetchProductPrices = async (nmIds: number[]) => {
    if (!selectedStore?.apiKey || nmIds.length === 0) return {};

    try {
      const chunkSize = 20;
      const priceMap: { [key: number]: number } = {};

      for (let i = 0; i < nmIds.length; i += chunkSize) {
        const chunk = nmIds.slice(i, i + chunkSize);
        const url = new URL("https://discounts-prices-api.wildberries.ru/api/v2/list/goods/filter");
        url.searchParams.append("limit", "1000");
        url.searchParams.append("nmId", chunk.join(','));

        console.log(`Fetching prices for chunk ${i / chunkSize + 1}, IDs:`, chunk);

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "Authorization": selectedStore.apiKey,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error(`Price fetch error for chunk ${i / chunkSize + 1}:`, errorData);
          continue;
        }

        const data = await response.json() as WBPriceResponse;
        console.log(`Price data for chunk ${i / chunkSize + 1}:`, data);
        
        if (data.data?.listGoods) {
          data.data.listGoods.forEach((item) => {
            if (item.sizes && item.sizes.length > 0) {
              const firstSize = item.sizes[0];
              const discountedPrice = firstSize.discountedPrice || 0;
              priceMap[item.nmID] = discountedPrice;
              console.log(`Price set for ${item.nmID}:`, {
                nmID: item.nmID,
                vendorCode: item.vendorCode,
                discountedPrice: discountedPrice,
                firstSize: firstSize
              });
            }
          });
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log("Final price map:", priceMap);
      return priceMap;
    } catch (error) {
      console.error("Error fetching prices:", error);
      return {};
    }
  };

  const fetchProductQuantities = async (apiKey: string, dateFrom: Date, dateTo: Date) => {
    try {
      const url = new URL("https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod");
      url.searchParams.append("dateFrom", dateFrom.toISOString().split('T')[0]);
      url.searchParams.append("dateTo", dateTo.toISOString().split('T')[0]);
      url.searchParams.append("limit", "100000");

      console.log('Fetching quantities with URL:', url.toString());

      const response = await fetch(url.toString(), {
        headers: {
          "Authorization": apiKey,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching quantities:', errorText);
        return {};
      }

      const data = await response.json();
      console.log('Quantities data:', data);

      const quantityMap: { [key: number]: number } = {};
      
      // Группируем количество по nmId
      data.forEach((item: any) => {
        if (item.doc_type_name === "Продажа") {
          const nmId = item.nm_id;
          quantityMap[nmId] = (quantityMap[nmId] || 0) + (item.quantity || 0);
        }
      });

      console.log('Final quantity map:', quantityMap);
      return quantityMap;
    } catch (error) {
      console.error('Error in fetchProductQuantities:', error);
      return {};
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
      
      // Получаем количество проданных товаров за последние 30 дней
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const quantities = await fetchProductQuantities(selectedStore.apiKey, startDate, endDate);

      const updatedProducts = data.cards.map((product: Product) => {
        const currentPrice = prices[product.nmID];
        const quantity = quantities[product.nmID] || 0;
        
        console.log(`Processing product ${product.nmID}:`, {
          price: currentPrice,
          costPrice: costPrices[product.nmID],
          quantity: quantity
        });
        
        return {
          ...product,
          costPrice: costPrices[product.nmID] || 0,
          discountedPrice: currentPrice || 0,
          quantity: quantity,
          expenses: {
            logistics: Math.random() * 100,
            storage: Math.random() * 50,
            penalties: Math.random() * 20,
            acceptance: Math.random() * 30
          }
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

  const updateCostPrice = (productId: number, costPrice: number) => {
    const updatedProducts = products.map(product => {
      if (product.nmID === productId) {
        const updatedProduct = { ...product, costPrice };
        return updatedProduct;
      }
      return product;
    });
    
    setProducts(updatedProducts);
    localStorage.setItem(`products_${selectedStore?.id}`, JSON.stringify(updatedProducts));
    
    // Обновляем себестоимость в отдельном хранилище для быстрого доступа
    const costPrices = JSON.parse(localStorage.getItem(`costPrices_${selectedStore?.id}`) || '{}');
    costPrices[productId] = costPrice;
    localStorage.setItem(`costPrices_${selectedStore?.id}`, JSON.stringify(costPrices));
  };

  useState(() => {
    if (selectedStore) {
      const storedProducts = localStorage.getItem(`products_${selectedStore.id}`);
      if (storedProducts) {
        const parsedProducts = JSON.parse(storedProducts);
        // Загружаем сохраненные себестоимости
        const costPrices = JSON.parse(localStorage.getItem(`costPrices_${selectedStore.id}`) || '{}');
        const productsWithCostPrices = parsedProducts.map((product: Product) => ({
          ...product,
          costPrice: costPrices[product.nmID] || product.costPrice || 0
        }));
        setProducts(productsWithCostPrices);
      } else {
        setProducts([]);
      }
    }
  });

  if (!selectedStore) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Выберите магазин для просмотра товаров</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Товары</h2>
        </div>
        <Button onClick={syncProducts} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Синхронизировать
        </Button>
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
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">
                        Продано за 30 дней:
                      </label>
                      <div className="text-sm font-medium">
                        {product.quantity || 0} шт.
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
