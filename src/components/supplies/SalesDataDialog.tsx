
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { format, subDays } from 'date-fns';

type SalesDataDialogProps = {
  onFetchData: (salesDateFrom: string, salesDateTo: string, storageDateFrom: string, storageDateTo: string) => void;
  isLoading: boolean;
};

const SalesDataDialog = ({ onFetchData, isLoading }: SalesDataDialogProps) => {
  const [open, setOpen] = useState(false);
  
  // Defaults:
  // Sales: last 30 days
  // Storage: last 7 days
  const [salesDateFrom, setSalesDateFrom] = useState<Date | undefined>(subDays(new Date(), 30));
  const [salesDateTo, setSalesDateTo] = useState<Date | undefined>(new Date());
  const [storageDateFrom, setStorageDateFrom] = useState<Date | undefined>(subDays(new Date(), 7));
  const [storageDateTo, setStorageDateTo] = useState<Date | undefined>(new Date());

  const handleFetchData = () => {
    if (salesDateFrom && salesDateTo && storageDateFrom && storageDateTo) {
      // Format dates to be API compatible
      const salesFromFormatted = format(salesDateFrom, 'yyyy-MM-dd');
      const salesToFormatted = format(salesDateTo, 'yyyy-MM-dd');
      const storageFromFormatted = format(storageDateFrom, 'yyyy-MM-dd\'T\'00:00:00');
      const storageToFormatted = format(storageDateTo, 'yyyy-MM-dd\'T\'23:59:59');
      
      onFetchData(
        salesFromFormatted,
        salesToFormatted,
        storageFromFormatted,
        storageToFormatted
      );
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Получить данные о продажах
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Выбор периода для анализа</DialogTitle>
          <DialogDescription>
            Укажите период продаж и хранения для расчета рентабельности
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Период продаж</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salesDateFrom">Начало периода:</Label>
                <DatePicker 
                  value={salesDateFrom} 
                  onValueChange={setSalesDateFrom}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salesDateTo">Конец периода:</Label>
                <DatePicker 
                  value={salesDateTo} 
                  onValueChange={setSalesDateTo}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Период платного хранения</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storageDateFrom">Начало периода:</Label>
                <DatePicker 
                  value={storageDateFrom} 
                  onValueChange={setStorageDateFrom}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storageDateTo">Конец периода:</Label>
                <DatePicker 
                  value={storageDateTo} 
                  onValueChange={setStorageDateTo}
                />
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button disabled={isLoading} onClick={handleFetchData}>
            {isLoading ? 'Загрузка...' : 'Получить данные'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SalesDataDialog;
