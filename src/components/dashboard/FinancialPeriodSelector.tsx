
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

export type FinancialPeriod = "week" | "2weeks" | "month" | "quarter" | "year";

interface FinancialPeriodSelectorProps {
  value: FinancialPeriod;
  onChange: (value: FinancialPeriod) => void;
}

const FINANCIAL_PERIOD_LABELS = {
  week: "Неделя",
  "2weeks": "2 недели",
  month: "Месяц",
  quarter: "Квартал",
  year: "Год",
};

const FinancialPeriodSelector = ({ value, onChange }: FinancialPeriodSelectorProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'w-full' : 'w-[180px]'} flex-shrink-0`}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full h-10">
          <SelectValue placeholder="Выберите период" />
        </SelectTrigger>
        <SelectContent position="popper" className={isMobile ? "w-[calc(100vw-32px)]" : "w-[180px]"} align="start">
          {Object.entries(FINANCIAL_PERIOD_LABELS).map(([periodKey, label]) => (
            <SelectItem key={periodKey} value={periodKey}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FinancialPeriodSelector;
