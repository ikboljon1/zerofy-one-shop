import { SalesData } from '@/types/analytics';
import salesData from '@/data/salesData.json';

export const calculateAnalytics = (startDate: string, endDate: string) => {
  const filteredSales = salesData.sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
  });

  const totalSalesVolume = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalOrdersCount = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);
  const totalReturnsCount = filteredSales.reduce((sum, sale) => sum + sale.returns, 0);
  const returnRate = (totalReturnsCount / totalOrdersCount) * 100;

  const productAnalysis = filteredSales.reduce((acc: any, sale) => {
    if (!acc[sale.productId]) {
      acc[sale.productId] = {
        productName: sale.productName,
        quantitySold: 0,
        salesAmount: 0,
        averagePrice: 0,
        profit: 0,
        profitability: 0,
        ordersCount: 0,
        returnsCount: 0,
        returnRate: 0
      };
    }

    const product = acc[sale.productId];
    product.quantitySold += sale.quantity;
    product.salesAmount += sale.totalAmount;
    product.ordersCount += sale.quantity;
    product.returnsCount += sale.returns;
    product.averagePrice = product.salesAmount / product.quantitySold;
    product.profit = product.salesAmount * 0.2; // Примерная прибыль 20%
    product.profitability = (product.profit / product.salesAmount) * 100;
    product.returnRate = (product.returnsCount / product.ordersCount) * 100;

    return acc;
  }, {});

  return {
    generalSalesAnalytics: {
      totalSalesVolume,
      totalOrdersCount,
      totalReturnsCount,
      returnRate
    },
    productSalesAnalysis: productAnalysis
  };
};