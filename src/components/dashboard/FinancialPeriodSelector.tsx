
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

export type FinancialPeriod = "week" | "2weeks" | "month" | "quarter" | "year" | "custom";

interface FinancialPeriodSelectorProps {
  value: FinancialPeriod;
  onChange: (value: FinancialPeriod) => void;
  className?: string;
}

const FINANCIAL_PERIOD_LABELS = {
  week: "Неделя",
  "2weeks": "2 недели",
  month: "Месяц",
  quarter: "Квартал",
  year: "Год",
  custom: "Произвольный период",
};

const FinancialPeriodSelector = ({ value, onChange, className }: FinancialPeriodSelectorProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'w-full' : 'w-[220px]'} flex-shrink-0 ${className || ''}`}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full h-10">
          <SelectValue placeholder="Выберите период" />
        </SelectTrigger>
        <SelectContent position="popper" className={isMobile ? "w-[calc(100vw-32px)]" : "w-[220px]"} align="start">
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
