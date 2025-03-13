
import { ProductSearchQuery } from "@/services/advertisingApi";

/**
 * Returns a color class based on the position value
 */
export const getPositionColorClass = (position: number): string => {
  if (position <= 10) return "text-green-600 dark:text-green-400 font-medium";
  if (position <= 30) return "text-amber-600 dark:text-amber-400 font-medium";
  if (position <= 50) return "text-orange-600 dark:text-orange-400 font-medium";
  return "text-red-600 dark:text-red-400 font-medium";
};

/**
 * Returns a color class based on the percentile value
 */
export const getPercentileColorClass = (percentile: number): string => {
  if (percentile >= 75) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
  if (percentile >= 50) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
  if (percentile >= 25) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
  return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
};

/**
 * Formats dynamics values with proper color and prefix
 */
export const formatDynamics = (value: number | undefined): JSX.Element => {
  if (value === undefined) return <span className="text-gray-400">—</span>;
  
  const prefix = value > 0 ? "+" : "";
  const colorClass = value > 0 
    ? "text-green-600 dark:text-green-400" 
    : value < 0 
      ? "text-red-600 dark:text-red-400" 
      : "text-gray-600 dark:text-gray-400";
      
  return <span className={colorClass}>{prefix}{value}%</span>;
};

/**
 * Safely accesses nested 'current' property in product search query objects
 */
export const getCurrentValue = (obj: any, field: string): number => {
  if (field.includes('.')) {
    const [parent, child] = field.split('.');
    const parentObj = obj[parent];
    
    if (parentObj && typeof parentObj === 'object' && 'current' in parentObj) {
      return parentObj.current;
    }
    return 0;
  }
  
  if (field === "avgPosition" && obj.avgPosition && 'current' in obj.avgPosition) {
    return obj.avgPosition.current;
  }
  
  return 0;
};

/**
 * Sorts product search queries based on given field and direction
 */
export const sortProductQueries = (
  queries: ProductSearchQuery[], 
  field: string, 
  direction: "asc" | "desc"
): ProductSearchQuery[] => {
  return [...queries].sort((a, b) => {
    let valA: any;
    let valB: any;
    
    // Handle nested fields
    if (field.includes('.')) {
      valA = getCurrentValue(a, field);
      valB = getCurrentValue(b, field);
    } else if (field === "text") {
      valA = a.text;
      valB = b.text;
    } else if (field === "avgPosition") {
      valA = a.avgPosition.current;
      valB = b.avgPosition.current;
    } else {
      // @ts-ignore - dynamic access for non-nested fields
      valA = a[field];
      // @ts-ignore - dynamic access for non-nested fields
      valB = b[field];
    }
    
    if (valA === valB) return 0;
    
    const comparison = valA > valB ? 1 : -1;
    return direction === "asc" ? comparison : -comparison;
  });
};
