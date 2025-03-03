
// API functions for interacting with Wildberries API

/**
 * Fetches product details from Wildberries API
 * @param apiKey The API key to authenticate with Wildberries
 * @param nmIds Array of product IDs to fetch
 * @returns Product details
 */
export const fetchProductDetails = async (apiKey: string, nmIds: number[]) => {
  if (!apiKey || nmIds.length === 0) return {};

  try {
    const url = new URL("https://content-api.wildberries.ru/content/v2/get/cards/list");
    
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        settings: {
          cursor: {
            limit: 100
          },
          filter: {
            nmID: nmIds
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error("Failed to fetch product details");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching product details:", error);
    return {};
  }
};

/**
 * Fetches product prices from Wildberries API
 * @param apiKey The API key to authenticate with Wildberries
 * @param nmIds Array of product IDs to fetch prices for
 * @returns Map of product IDs to prices
 */
export const fetchProductPrices = async (apiKey: string, nmIds: number[]) => {
  if (!apiKey || nmIds.length === 0) return {};

  try {
    const chunkSize = 20;
    const priceMap: { [key: number]: number } = {};

    for (let i = 0; i < nmIds.length; i += chunkSize) {
      const chunk = nmIds.slice(i, i + chunkSize);
      const url = new URL("https://discounts-prices-api.wildberries.ru/api/v2/list/goods/filter");
      url.searchParams.append("limit", "1000");
      url.searchParams.append("nmId", chunk.join(','));

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Authorization": apiKey,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      
      if (data.data?.listGoods) {
        data.data.listGoods.forEach((item: any) => {
          if (item.sizes && item.sizes.length > 0) {
            const firstSize = item.sizes[0];
            priceMap[item.nmID] = firstSize.discountedPrice || 0;
          }
        });
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return priceMap;
  } catch (error) {
    console.error("Error fetching prices:", error);
    return {};
  }
};

/**
 * Fetches sales data from Wildberries API for a given period
 * @param apiKey The API key to authenticate with Wildberries
 * @param dateFrom Start date for the report
 * @param dateTo End date for the report 
 * @returns Sales data
 */
export const fetchSalesData = async (apiKey: string, dateFrom: Date, dateTo: Date) => {
  try {
    const url = new URL("https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod");
    url.searchParams.append("dateFrom", dateFrom.toISOString().split('T')[0]);
    url.searchParams.append("dateTo", dateTo.toISOString().split('T')[0]);
    url.searchParams.append("limit", "100000");

    const response = await fetch(url.toString(), {
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch sales data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return [];
  }
};
