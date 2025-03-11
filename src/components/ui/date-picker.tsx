
import * as React from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date;
  onValueChange?: (date?: Date) => void;
  placeholder?: string;
  className?: string;
  // Add new props to match what's being passed
  date?: Date;
  setDate?: (date: Date) => void;
}

export function DatePicker({ 
  value, 
  onValueChange, 
  placeholder = "Выберите дату", 
  className,
  date,
  setDate
}: DatePickerProps) {
  // Use either the date/setDate combo or value/onValueChange
  const selectedDate = date || value;
  const handleDateChange = React.useCallback((newDate?: Date) => {
    if (setDate && newDate) {
      setDate(newDate);
    } else if (onValueChange) {
      onValueChange(newDate);
    }
  }, [setDate, onValueChange]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "dd.MM.yyyy", { locale: ru }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateChange}
          initialFocus
          locale={ru}
          className="pointer-events-auto"
          fromDate={new Date(2020, 0, 1)}
          toDate={new Date(2030, 11, 31)}
        />
      </PopoverContent>
    </Popover>
  )
}
