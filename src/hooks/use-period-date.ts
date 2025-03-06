
import { TimePeriod } from "@/types/statistics";
import { subDays } from "date-fns";

export const usePeriodDate = (period: TimePeriod) => {
  const getDateFromPeriod = () => {
    const now = new Date();
    
    switch (period) {
      case "today":
        return new Date(now.setHours(0, 0, 0, 0));
      case "week":
        return subDays(now, 7);
      case "2weeks":
        return subDays(now, 14);
      case "4weeks":
        return subDays(now, 28);
      default:
        return now;
    }
  };

  return {
    dateFrom: getDateFromPeriod(),
    dateTo: new Date()
  };
};
