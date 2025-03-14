
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { CalendarRange } from "lucide-react";

export type Period = "today" | "yesterday" | "week" | "2weeks" | "4weeks" | "3months";

interface PeriodSelectorProps {
  value: Period;
  onChange: (value: Period) => void;
}

const PeriodSelector = ({ value, onChange }: PeriodSelectorProps) => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <div className="w-full mb-2">
        <Tabs 
          value={value}
          onValueChange={(val) => onChange(val as Period)} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-5 h-9">
            <TabsTrigger value="today" className="text-xs px-0">Сегодня</TabsTrigger>
            <TabsTrigger value="yesterday" className="text-xs px-0">Вчера</TabsTrigger>
            <TabsTrigger value="week" className="text-xs px-0">7 дней</TabsTrigger>
            <TabsTrigger value="2weeks" className="text-xs px-0">14 дней</TabsTrigger>
            <TabsTrigger value="3months" className="text-xs px-0">3 месяца</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    );
  }
  
  return (
    <div className="w-auto flex-shrink-0">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px] h-10">
          <CalendarRange className="mr-2 h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Выберите период" />
        </SelectTrigger>
        <SelectContent position="popper" className="w-[180px]" align="start">
          <SelectItem value="today">Сегодня</SelectItem>
          <SelectItem value="yesterday">Вчера</SelectItem>
          <SelectItem value="week">7 дней</SelectItem>
          <SelectItem value="2weeks">14 дней</SelectItem>
          <SelectItem value="4weeks">28 дней</SelectItem>
          <SelectItem value="3months">3 месяца</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PeriodSelector;
