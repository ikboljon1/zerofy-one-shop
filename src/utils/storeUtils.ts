export const getProductProfitabilityData = (storeId: string) => {
  const storageKey = `marketplace_profitability_${storeId}`;
  try {
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (e) {
    console.error("Error parsing product profitability data:", e);
  }
  return null;
};
