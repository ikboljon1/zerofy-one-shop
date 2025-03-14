import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Calendar as CalendarIcon2, ChevronDown, RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DateRangePickerProps {
  value?: { from: Date; to: Date };
  onChange?: (newRange: { from: Date; to: Date }) => void;
  dateFrom?: Date;
  dateTo?: Date;
  setDateFrom?: (date: Date) => void;
  setDateTo?: (date: Date) => void;
  onApplyDateRange?: () => void;
  onUpdate?: () => void;
  forceRefresh?: boolean;
}

const DateRangePicker = ({ 
  value,
  onChange,
  dateFrom: propDateFrom, 
  dateTo: propDateTo, 
  setDateFrom: propSetDateFrom, 
  setDateTo: propSetDateTo,
  onApplyDateRange,
  onUpdate,
  forceRefresh = true
}: DateRangePickerProps) => {
  const [localDateFrom, setLocalDateFrom] = useState<Date>(
    value?.from || propDateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const [localDateTo, setLocalDateTo] = useState<Date>(
    value?.to || propDateTo || new Date()
  );

  const dateFrom = value?.from || localDateFrom;
  const dateTo = value?.to || localDateTo;

  const setDateFrom = (date: Date) => {
    if (value && onChange) {
      onChange({ ...value, from: date });
    } else if (propSetDateFrom) {
      propSetDateFrom(date);
    } else {
      setLocalDateFrom(date);
    }
  };

  const setDateTo = (date: Date) => {
    if (value && onChange) {
      onChange({ ...value, to: date });
    } else if (propSetDateTo) {
      propSetDateTo(date);
    } else {
      setLocalDateTo(date);
    }
  };

  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [quickSelectOpen, setQuickSelectOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  const handleApply = () => {
    setIsLoading(true);
    
    if (onApplyDateRange) {
      onApplyDateRange();
    }
    if (onUpdate) {
      onUpdate();
    }
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const applyPreset = (preset: string) => {
    const today = new Date();
    
    switch(preset) {
      case 'today':
        setDateFrom(today);
        setDateTo(today);
        break;
      case 'yesterday':
        const yesterday = subDays(today, 1);
        setDateFrom(yesterday);
        setDateTo(yesterday);
        break;
      case 'week':
        setDateFrom(subDays(today, 6));
        setDateTo(today);
        break;
      case 'month':
        setDateFrom(subDays(today, 29));
        setDateTo(today);
        break;
      default:
        break;
    }
    
    setQuickSelectOpen(false);
    
    if (onApplyDateRange) {
      setTimeout(onApplyDateRange, 100);
    }
  };

  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-800/30 shadow-lg ${isMobile ? 'space-y-2' : ''}`}>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">Аналитика продаж</h2>
          <p className="text-sm text-muted-foreground">
            {format(dateFrom, 'dd.MM.yyyy')} - {format(dateTo, 'dd.MM.yyyy')}
          </p>
        </div>
        
        {isMobile ? (
          <div className="flex justify-between items-center gap-2">
            <Popover open={quickSelectOpen} onOpenChange={setQuickSelectOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex-1 h-9 px-3 text-sm flex items-center justify-between"
                >
                  <CalendarIcon2 className="h-4 w-4 mr-2" />
                  <span>Период</span>
                  <ChevronDown className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[210px] p-2" align="end">
                <div className="space-y-1.5">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm h-9" 
                    onClick={() => applyPreset('today')}
                  >
                    Сегодня
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm h-9" 
                    onClick={() => applyPreset('yesterday')}
                  >
                    Вчера
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button size="sm" className="h-9" onClick={handleApply} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Загрузка...
                </>
              ) : (
                "Применить"
              )}
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 items-center">
            <Popover open={fromOpen} onOpenChange={setFromOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal h-9",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, 'dd.MM.yyyy') : <span>Начальная дата</span>}
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
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            <Popover open={toOpen} onOpenChange={setToOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal h-9",
                    !dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, 'dd.MM.yyyy') : <span>Конечная дата</span>}
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
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            <Button onClick={handleApply} className="h-9" disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Загрузка...
                </>
              ) : (
                "Применить"
              )}
            </Button>
          </div>
        )}
      </div>
      
      {isMobile && (
        <div className="flex gap-2 mt-2">
          <Popover open={fromOpen} onOpenChange={setFromOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs font-normal"
              >
                {dateFrom ? format(dateFrom, 'dd.MM.yyyy') : "Начало"}
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
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          <Popover open={toOpen} onOpenChange={setToOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs font-normal"
              >
                {dateTo ? format(dateTo, 'dd.MM.yyyy') : "Конец"}
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
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
