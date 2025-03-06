
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Period = "today" | "week" | "2weeks" | "4weeks";

interface PeriodSelectorProps {
  value: Period;
  onChange: (value: Period) => void;
}

const PeriodSelector = ({ value, onChange }: PeriodSelectorProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Выберите период" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="today">Сегодня</SelectItem>
        <SelectItem value="week">Неделя</SelectItem>
        <SelectItem value="2weeks">2 недели</SelectItem>
        <SelectItem value="4weeks">4 недели</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default PeriodSelector;
