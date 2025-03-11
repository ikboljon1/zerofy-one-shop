
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
  className?: string;  // Add className prop to the interface
}

export function DatePicker({ value, onValueChange, placeholder = "Выберите дату", className }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className  // Apply the className prop here
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "dd.MM.yyyy", { locale: ru }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onValueChange}
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
