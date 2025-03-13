
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';

interface SalesDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFetchData: (salesDateFrom: Date, salesDateTo: Date, storageDateFrom: Date, storageDateTo: Date) => Promise<void>;
  isLoading: boolean;
}

export const SalesDataDialog: React.FC<SalesDataDialogProps> = ({
  open,
  onOpenChange,
  onFetchData,
  isLoading
}) => {
  // По умолчанию, последние 30 дней для продаж
  const [salesDateFrom, setSalesDateFrom] = useState<Date>(subDays(new Date(), 30));
  const [salesDateTo, setSalesDateTo] = useState<Date>(new Date());
  
  // По умолчанию, последние 7 дней для хранения
  const [storageDateFrom, setStorageDateFrom] = useState<Date>(subDays(new Date(), 7));
  const [storageDateTo, setStorageDateTo] = useState<Date>(new Date());

  const handleFetchData = () => {
    onFetchData(salesDateFrom, salesDateTo, storageDateFrom, storageDateTo);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Получение данных о продажах и хранении</DialogTitle>
          <DialogDescription>
            Выберите период для получения данных о продажах и затратах на хранение
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Период для данных о продажах</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Дата начала</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !salesDateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {salesDateFrom ? format(salesDateFrom, "dd.MM.yyyy") : "Выберите дату"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={salesDateFrom}
                      onSelect={(date) => date && setSalesDateFrom(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Дата окончания</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !salesDateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {salesDateTo ? format(salesDateTo, "dd.MM.yyyy") : "Выберите дату"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={salesDateTo}
                      onSelect={(date) => date && setSalesDateTo(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Период для данных о платном хранении</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Дата начала</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !storageDateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {storageDateFrom ? format(storageDateFrom, "dd.MM.yyyy") : "Выберите дату"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={storageDateFrom}
                      onSelect={(date) => date && setStorageDateFrom(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Дата окончания</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !storageDateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {storageDateTo ? format(storageDateTo, "dd.MM.yyyy") : "Выберите дату"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={storageDateTo}
                      onSelect={(date) => date && setStorageDateTo(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={handleFetchData} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Загрузка...
              </>
            ) : (
              "Получить данные"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
