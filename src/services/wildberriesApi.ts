export interface WildberriesResponse {
  currentPeriod: {
    sales: number;
    transferred: number;
    expenses: {
      logistics: number;
      storage: number;
      penalties: number;
      total: number;
    };
    netProfit: number;
    acceptance: number;
  };
  previousPeriod: {
    sales: number;
    transferred: number;
    expenses: {
      logistics: number;
      storage: number;
      penalties: number;
      total: number;
    };
    netProfit: number;
    acceptance: number;
  };
  dailySales: any[];
  productSales: any[];
}

interface ProductWithCost {
  nmID: number;
  costPrice?: number;
  quantity: number;
}

export const calculateTotalCosts = (products: ProductWithCost[]): number => {
  console.log("Calculating total costs for products:", products);
  return products.reduce((total, product) => {
    if (product.costPrice && product.quantity) {
      const productCost = product.costPrice * product.quantity;
      console.log(`Product ${product.nmID}: Cost ${product.costPrice} × Quantity ${product.quantity} = ${productCost}`);
      return total + productCost;
    }
    return total;
  }, 0);
};

export const fetchWildberriesStats = async (apiKey: string, dateFrom: Date, dateTo: Date): Promise<WildberriesResponse> => {
  try {
    // Get stored products with cost prices
    const storedProducts = JSON.parse(localStorage.getItem(`products_${apiKey}`) || '[]');
    console.log("Stored products with costs:", storedProducts);
    
    const productCosts = storedProducts.reduce((acc: Record<number, number>, product: ProductWithCost) => {
      if (product.costPrice) {
        acc[product.nmID] = product.costPrice;
      }
      return acc;
    }, {});

    console.log("Product costs mapping:", productCosts);

    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    // Create URL with query parameters
    const params = new URLSearchParams({
      dateFrom: formatDate(dateFrom),
      dateTo: formatDate(dateTo)
    });

    const url = `https://statistics-api.wildberries.ru/api/v1/supplier/sales?${params.toString()}`;
    console.log("Fetching stats from URL:", url);

    // Fetch sales data from API
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`Failed to fetch statistics: ${errorText}`);
    }

    const data = await response.json();
    console.log("Raw statistics data:", data);

    // Calculate total costs based on sold products and their cost prices
    const soldProducts = data.sales.map((sale: any) => ({
      nmID: sale.nmId,
      quantity: sale.quantity,
      costPrice: productCosts[sale.nmId] || 0
    }));

    console.log("Sold products with costs:", soldProducts);

    const totalProductCosts = calculateTotalCosts(soldProducts);
    console.log("Total product costs:", totalProductCosts);

    // Current period calculations
    const currentPeriodSales = data.currentPeriod.sales || 0;
    const currentPeriodTransferred = data.currentPeriod.transferred || 0;
    const currentPeriodExpenses = {
      logistics: data.currentPeriod.expenses?.logistics || 0,
      storage: data.currentPeriod.expenses?.storage || 0,
      penalties: data.currentPeriod.expenses?.penalties || 0,
      total: totalProductCosts + 
        (data.currentPeriod.expenses?.logistics || 0) + 
        (data.currentPeriod.expenses?.storage || 0) + 
        (data.currentPeriod.expenses?.penalties || 0)
    };

    // Previous period calculations
    const previousPeriodSales = data.previousPeriod?.sales || 0;
    const previousPeriodTransferred = data.previousPeriod?.transferred || 0;
    const previousPeriodExpenses = {
      logistics: data.previousPeriod?.expenses?.logistics || 0,
      storage: data.previousPeriod?.expenses?.storage || 0,
      penalties: data.previousPeriod?.expenses?.penalties || 0,
      total: (data.previousPeriod?.expenses?.logistics || 0) + 
        (data.previousPeriod?.expenses?.storage || 0) + 
        (data.previousPeriod?.expenses?.penalties || 0)
    };

    // Calculate net profit including product costs
    const currentNetProfit = currentPeriodSales - currentPeriodExpenses.total;
    const previousNetProfit = previousPeriodSales - previousPeriodExpenses.total;

    console.log("Final calculations:", {
      currentPeriod: {
        sales: currentPeriodSales,
        expenses: currentPeriodExpenses,
        netProfit: currentNetProfit
      }
    });

    return {
      currentPeriod: {
        sales: currentPeriodSales,
        transferred: currentPeriodTransferred,
        expenses: currentPeriodExpenses,
        netProfit: currentNetProfit,
        acceptance: data.currentPeriod.acceptance || 0
      },
      previousPeriod: {
        sales: previousPeriodSales,
        transferred: previousPeriodTransferred,
        expenses: previousPeriodExpenses,
        netProfit: previousNetProfit,
        acceptance: data.previousPeriod?.acceptance || 0
      },
      dailySales: data.dailySales || [],
      productSales: data.productSales || []
    };
  } catch (error) {
    console.error("Error fetching statistics:", error);
    throw error;
  }
};