import { useState } from "react";
import { Package, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import React from "react";

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
    deductions?: number;
    ppvz_for_pay?: number;
    retail_price?: number;
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
    if (!product.expenses) return {
      netProfit: 0,
      productSales: 0,
      totalExpenses: 0,
      revenue: 0,
      salesAmount: 0,
      transferredAmount: 0,
      soldQuantity: 0,
      margin: 0
    };
    
    console.log('Calculating for product:', {
      nmId: product.nmID,
      title: product.title,
      expenses: product.expenses,
      costPrice: product.costPrice,
    });
    
    const productSales = product.quantity || 0;
    const salesAmount = product.expenses.retail_price || 0;
    const transferredAmount = product.expenses.ppvz_for_pay || 0;
    const costPriceTotal = (product.costPrice || 0) * productSales;
    
    console.log('Sales calculation:', {
      productSales,
      salesAmount,
      transferredAmount,
      costPriceTotal,
      retail_price: product.expenses.retail_price
    });
    
    const totalExpenses = 
      product.expenses.logistics +
      product.expenses.storage +
      product.expenses.penalties +
      product.expenses.acceptance +
      (product.expenses.deductions || 0);
    
    const netProfit = transferredAmount - costPriceTotal - totalExpenses;
    
    let margin = 0;
    if (costPriceTotal > 0) {
      margin = (netProfit / costPriceTotal) * 100;
    } else if (netProfit > 0) {
      margin = 100;
    }
    
    return {
      netProfit,
      productSales,
      totalExpenses,
      revenue: salesAmount,
      salesAmount,
      transferredAmount,
      soldQuantity: productSales,
      margin: Math.round(margin)
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
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const url = new URL("https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod");
      url.searchParams.append("dateFrom", startDate.toISOString().split('T')[0]);
      url.searchParams.append("dateTo", endDate.toISOString().split('T')[0]);
      url.searchParams.append("limit", "100000");

      const storageResponse = await fetch(url.toString(), {
        headers: {
          "Authorization": selectedStore.apiKey,
          "Content-Type": "application/json"
        }
      });

      if (!storageResponse.ok) {
        throw new Error("Failed to fetch storage data");
      }

      const storageData = await storageResponse.json();
      console.log("Storage data:", storageData);

      const expensesMap = new Map();
      const salesMap = new Map();
      
      console.log('Processing storage data items:', storageData.length);
      
      storageData.forEach((item: any) => {
        const nmId = item.nm_id;
        console.log('Processing item:', {
          nmId,
          doc_type_name: item.doc_type_name,
          retail_price: item.retail_price,
          quantity: item.quantity
        });

        if (!expensesMap.has(nmId)) {
          expensesMap.set(nmId, {
            logistics: 0,
            storage: 0,
            penalties: 0,
            acceptance: 0,
            deductions: 0,
            ppvz_for_pay: 0,
            retail_price: 0
          });
        }
        
        const expenses = expensesMap.get(nmId);
        expenses.logistics += item.delivery_rub || 0;
        expenses.storage += item.storage_fee || 0;
        expenses.penalties += item.penalty || 0;
        expenses.acceptance += item.acceptance || 0;
        expenses.deductions += item.deduction || 0;
        expenses.ppvz_for_pay += item.ppvz_for_pay || 0;

        if (item.doc_type_name === "Продажа") {
          expenses.retail_price += item.retail_price || 0;
          console.log('Adding sale:', {
            nmId,
            retail_price: item.retail_price,
            current_total: expenses.retail_price
          });
          
          if (!salesMap.has(nmId)) {
            salesMap.set(nmId, 0);
          }
          salesMap.set(nmId, salesMap.get(nmId) + (item.retail_price || 0));
        }
      });

      console.log('Final expenses map:', Object.fromEntries(expensesMap));
      console.log('Final sales map:', Object.fromEntries(salesMap));

      const quantities = await fetchProductQuantities(selectedStore.apiKey, startDate, endDate);

      const updatedProducts = data.cards.map((product: Product) => {
        const currentPrice = prices[product.nmID];
        const quantity = quantities[product.nmID] || 0;
        const productExpenses = expensesMap.get(product.nmID) || {
          logistics: 0,
          storage: 0,
          penalties: 0,
          acceptance: 0,
          deductions: 0,
          ppvz_for_pay: 0,
          retail_price: 0
        };
        
        console.log(`Processing product ${product.nmID}:`, {
          price: currentPrice,
          costPrice: costPrices[product.nmID],
          quantity: quantity,
          expenses: productExpenses,
          salesAmount: salesMap.get(product.nmID) || 0
        });
        
        return {
          ...product,
          costPrice: costPrices[product.nmID] || 0,
          discountedPrice: currentPrice || 0,
          quantity: quantity,
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
    
    const costPrices = JSON.parse(localStorage.getItem(`costPrices_${selectedStore?.id}`) || '{}');
    costPrices[productId] = costPrice;
    localStorage.setItem(`costPrices_${selectedStore?.id}`, JSON.stringify(costPrices));
  };

  React.useEffect(() => {
    if (selectedStore) {
      const storedProducts = localStorage.getItem(`products_${selectedStore.id}`);
      if (storedProducts) {
        const parsedProducts = JSON.parse(storedProducts);
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
  }, [selectedStore]);

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
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">
                          Цена:
                        </label>
                        <div className="text-sm font-medium">
                          {product.discountedPrice ? `${product.discountedPrice.toFixed(2)} ₽` : "0.00 ₽"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">
                          Сумма:
                        </label>
                        <div className="text-sm font-medium">
                          {profitDetails.salesAmount.toFixed(2)} ₽
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">
                          Перечислено:
                        </label>
                        <div className="text-sm font-medium">
                          {profitDetails.transferredAmount.toFixed(2)} ₽
                        </div>
                      </div>
                    </div>
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
                    <div className="space-y-1.5 border-t pt-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Продано за 30 дней:</span>
                        <span>{profitDetails.soldQuantity} шт.</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Общая логистика:</span>
                        <span>{product.expenses.logistics.toFixed(2)} ₽</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Общее хранение:</span>
                        <span>{product.expenses.storage.toFixed(2)} ₽</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Общие штрафы:</span>
                        <span>{product.expenses.penalties.toFixed(2)} ₽</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Общая приемка:</span>
                        <span>{product.expenses.acceptance.toFixed(2)} ₽</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Прочие удержания:</span>
                        <span>{(product.expenses.deductions || 0).toFixed(2)} ₽</span>
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
                      <div className="flex justify-between text-xs font-medium mt-1">
                        <span>Маржа:</span>
                        <span className={profitDetails.margin >= 0 ? "text-green-500" : "text-red-500"}>
                          {profitDetails.margin.toFixed(0)}%
                        </span>
                      </div>
                    </div>
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
