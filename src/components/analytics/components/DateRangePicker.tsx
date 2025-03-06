
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DateRangePickerProps {
  dateFrom: Date;
  dateTo: Date;
  setDateFrom: (date: Date) => void;
  setDateTo: (date: Date) => void;
  onApplyDateRange?: () => void;
  onUpdate?: () => void;
}

const DateRangePicker = ({ 
  dateFrom, 
  dateTo, 
  setDateFrom, 
  setDateTo,
  onApplyDateRange,
  onUpdate
}: DateRangePickerProps) => {
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [localDateFrom, setLocalDateFrom] = useState<Date>(dateFrom);
  const [localDateTo, setLocalDateTo] = useState<Date>(dateTo);
  const { toast } = useToast();

  // Синхронизация внешних и локальных дат при изменении props
  useEffect(() => {
    setLocalDateFrom(dateFrom);
    setLocalDateTo(dateTo);
  }, [dateFrom, dateTo]);

  const handleFromDateSelect = (date: Date | undefined) => {
    if (date) {
      setLocalDateFrom(date);
      setFromOpen(false);
    }
  };

  const handleToDateSelect = (date: Date | undefined) => {
    if (date) {
      setLocalDateTo(date);
      setToOpen(false);
    }
  };

  const handleApply = () => {
    // Проверка валидности дат
    if (localDateFrom > localDateTo) {
      toast({
        title: "Ошибка",
        description: "Начальная дата не может быть позже конечной даты",
        variant: "destructive"
      });
      return;
    }

    // Обновляем внешние значения
    setDateFrom(localDateFrom);
    setDateTo(localDateTo);

    // Уведомляем родительский компонент об изменении дат
    if (onApplyDateRange) {
      onApplyDateRange();
    }
    if (onUpdate) {
      onUpdate();
    }

    toast({
      title: "Период выбран",
      description: `С ${format(localDateFrom, 'dd.MM.yyyy')} по ${format(localDateTo, 'dd.MM.yyyy')}`
    });
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
                !localDateFrom && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {localDateFrom ? format(localDateFrom, 'PPP') : <span>Начальная дата</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={localDateFrom}
              onSelect={handleFromDateSelect}
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
                !localDateTo && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {localDateTo ? format(localDateTo, 'PPP') : <span>Конечная дата</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={localDateTo}
              onSelect={handleToDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <Button onClick={handleApply} className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-md">
          Применить
        </Button>
      </div>
    </div>
  );
};

export default DateRangePicker;
