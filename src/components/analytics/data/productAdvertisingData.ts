
import { ProductStats, getCampaignFullStats } from "@/services/advertisingApi";

// Default product advertising data - used as fallback
export const productAdvertisingData = [
  {
    name: "Футболка 'Спортивная'",
    value: 12500,
    color: "#8b5cf6",
    id: 1234567
  },
  {
    name: "Джинсы классические",
    value: 8700,
    color: "#ec4899",
    id: 2345678
  },
  {
    name: "Кроссовки беговые",
    value: 7300,
    color: "#f59e0b",
    id: 3456789
  },
  {
    name: "Куртка зимняя",
    value: 5200,
    color: "#3b82f6",
    id: 4567890
  },
  {
    name: "Другие товары",
    value: 3100,
    color: "#10b981",
    id: 5678901
  }
];

// Colors for chart data
export const PRODUCT_COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#3B82F6', '#10B981', '#6366F1', '#F43F5E', '#0EA5E9'];

// Function to fetch real product advertising data from API
export const fetchProductAdvertisingData = async (apiKey: string, campaignIds: number[], dateFrom: Date, dateTo: Date) => {
  try {
    // Get full stats from API
    const campaignStats = await getCampaignFullStats(apiKey, campaignIds, dateFrom, dateTo);
    
    // Extract product stats from all campaigns
    const allProductStats: ProductStats[] = [];
    
    campaignStats.forEach(campaign => {
      campaign.days?.forEach(day => {
        if (day.nm && day.nm.length > 0) {
          day.nm.forEach(product => {
            // Find if product already exists in our collection
            const existingProduct = allProductStats.find(p => p.nmId === product.nmId);
            
            if (existingProduct) {
              // Update existing product stats
              existingProduct.views += product.views;
              existingProduct.clicks += product.clicks;
              existingProduct.sum += product.sum;
              existingProduct.orders += product.orders;
              existingProduct.atbs += product.atbs;
              existingProduct.sum_price += product.sum_price;
            } else {
              // Add new product
              allProductStats.push(product);
            }
          });
        }
      });
    });
    
    // Sort products by advertising spend (sum) from highest to lowest
    allProductStats.sort((a, b) => b.sum - a.sum);
    
    // Take top 5 products and group the rest as "Other products"
    const topProducts = allProductStats.slice(0, 5);
    
    // Calculate total for other products
    const otherProductsTotal = allProductStats.slice(5).reduce(
      (total, product) => total + product.sum,
      0
    );
    
    // Format data for pie chart
    const formattedData = topProducts.map((product, index) => ({
      name: product.name || `Товар ${product.nmId}`,
      value: Math.round(product.sum),
      color: PRODUCT_COLORS[index % PRODUCT_COLORS.length],
      id: product.nmId
    }));
    
    // Add "Other products" category if there are more than 5 products
    if (otherProductsTotal > 0) {
      formattedData.push({
        name: "Другие товары",
        value: Math.round(otherProductsTotal),
        color: PRODUCT_COLORS[5 % PRODUCT_COLORS.length],
        id: 0
      });
    }
    
    return formattedData.length > 0 ? formattedData : productAdvertisingData;
  } catch (error) {
    console.error("Error fetching product advertising data:", error);
    return productAdvertisingData; // Return default data in case of error
  }
};
