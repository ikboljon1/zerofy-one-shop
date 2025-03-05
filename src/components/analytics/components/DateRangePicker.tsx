
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
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{label}</span>}
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
    <div className="flex flex-col sm:flex-row gap-4">
      {renderDatePicker(dateFrom, setDateFrom, "Выберите начальную дату")}
      {renderDatePicker(dateTo, setDateTo, "Выберите конечную дату")}
      <Button onClick={onUpdate}>
        Обновить
      </Button>
    </div>
  );
};

export default DateRangePicker;
