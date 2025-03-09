export const fetchWildberriesStats = async (apiKey: string, dateFrom: Date, dateTo: Date) => {
  try {
    // In a real implementation, this would make an API call to the Wildberries API
    // For now, we'll return mock data
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock data
    const currentPeriod = {
      orderCount: Math.floor(Math.random() * 500) + 100,
      income: Math.floor(Math.random() * 1000000) + 100000,
      expenses: Math.floor(Math.random() * 500000) + 50000,
      profit: 0, // Will calculate below
    };
    
    // Calculate profit
    currentPeriod.profit = currentPeriod.income - currentPeriod.expenses;
    
    // Create previous period with slightly lower numbers
    const previousPeriod = {
      orderCount: Math.floor(currentPeriod.orderCount * 0.8),
      income: Math.floor(currentPeriod.income * 0.8),
      expenses: Math.floor(currentPeriod.expenses * 0.8),
      profit: 0,
    };
    previousPeriod.profit = previousPeriod.income - previousPeriod.expenses;
    
    // Generate sales data (daily)
    const sales = [];
    const days = Math.round((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < days; i++) {
      const date = new Date(dateFrom);
      date.setDate(date.getDate() + i);
      
      sales.push({
        date: date.toISOString().split('T')[0],
        orderCount: Math.floor(Math.random() * 30) + 1,
        profit: Math.floor(Math.random() * 20000) + 5000,
      });
    }
    
    // Generate product data
    const products = [];
    for (let i = 0; i < 10; i++) {
      const sales = Math.floor(Math.random() * 100) + 10;
      const income = sales * (Math.floor(Math.random() * 2000) + 500);
      const profit = Math.floor(income * 0.4);
      
      products.push({
        name: `Товар ${i + 1}`,
        sku: `SKU${100000 + i}`,
        sales,
        income,
        profit,
      });
    }
    
    return {
      currentPeriod,
      previousPeriod,
      sales,
      products
    };
  } catch (error) {
    console.error("Error fetching Wildberries statistics:", error);
    throw error;
  }
};
