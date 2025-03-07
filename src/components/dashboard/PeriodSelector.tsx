
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

export type Period = "today" | "yesterday" | "week" | "2weeks" | "4weeks";

interface PeriodSelectorProps {
  value: Period;
  onChange: (value: Period) => void;
}

const PERIOD_LABELS = {
  today: "Сегодня",
  yesterday: "Вчера",
  week: "Неделя",
  "2weeks": "2 недели",
  "4weeks": "4 недели",
};

const PeriodSelector = ({ value, onChange }: PeriodSelectorProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'w-full' : 'w-[180px]'} flex-shrink-0`}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full h-10">
          <SelectValue placeholder="Выберите период" />
        </SelectTrigger>
        <SelectContent position="popper" className={isMobile ? "w-[calc(100vw-32px)]" : "w-[180px]"} align="start">
          {Object.entries(PERIOD_LABELS).map(([periodKey, label]) => (
            <SelectItem key={periodKey} value={periodKey}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PeriodSelector;
