
import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

interface DateRangePickerProps {
  dateFrom: Date;
  dateTo: Date;
  setDateFrom: (date: Date) => void;
  setDateTo: (date: Date) => void;
  onApplyDateRange?: () => void;
}

const DateRangePicker = ({ 
  dateFrom, 
  dateTo, 
  setDateFrom, 
  setDateTo,
  onApplyDateRange
}: DateRangePickerProps) => {
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const handleApply = () => {
    if (onApplyDateRange) {
      onApplyDateRange();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div className="space-y-1">
        <h2 className="text-lg sm:text-xl font-semibold">Аналитика продаж и удержаний</h2>
        <p className="text-sm text-muted-foreground">
          Выберите диапазон дат для анализа
        </p>
      </div>
      
      <div className="flex flex-wrap gap-3 items-center">
        <Popover open={fromOpen} onOpenChange={setFromOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-auto justify-start text-left font-normal",
                !dateFrom && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, 'PPP') : <span>Начальная дата</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={(date) => {
                if (date) {
                  setDateFrom(date);
                  setFromOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <Popover open={toOpen} onOpenChange={setToOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-auto justify-start text-left font-normal",
                !dateTo && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo ? format(dateTo, 'PPP') : <span>Конечная дата</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={(date) => {
                if (date) {
                  setDateTo(date);
                  setToOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <Button onClick={handleApply}>
          Применить
        </Button>
      </div>
    </div>
  );
};

export default DateRangePicker;
