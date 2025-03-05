
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  dateFrom: Date;
  dateTo: Date;
  setDateFrom: (date: Date) => void;
  setDateTo: (date: Date) => void;
  onUpdate?: () => void;
}

const DateRangePicker = ({ dateFrom, dateTo, setDateFrom, setDateTo, onUpdate }: DateRangePickerProps) => {
  const renderDatePicker = (date: Date, onChange: (date: Date) => void, label: string) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-3 w-3" />
          {date ? format(date, "dd.MM.yyyy") : <span>{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => date && onChange(date)}
          initialFocus
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {renderDatePicker(dateFrom, setDateFrom, "Начальная дата")}
      {renderDatePicker(dateTo, setDateTo, "Конечная дата")}
      <Button size="sm" onClick={onUpdate}>
        Обновить
      </Button>
    </div>
  );
};

export default DateRangePicker;
