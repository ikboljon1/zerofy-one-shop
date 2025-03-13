
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getRealDataForStorageProfitability } from '@/services/suppliesApi';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface SalesDataProviderProps {
  apiKey: string;
  onDataReceived: (data: {
    productInfo: {
      nmId: string;
      productName: string;
      dailySales: number;
      storageCost: number;
    }
  }) => void;
  children: React.ReactNode;
}

const SalesDataProvider: React.FC<SalesDataProviderProps> = ({ apiKey, onDataReceived, children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dateFrom, setDateFrom] = useState(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return thirtyDaysAgo.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const { toast } = useToast();

  const fetchData = async (from = dateFrom, to = dateTo) => {
    if (!apiKey) {
      setError('API ключ не указан');
      toast({
        title: 'Ошибка',
        description: 'API ключ не указан. Пожалуйста, укажите API ключ.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getRealDataForStorageProfitability(apiKey, from, to);
      onDataReceived(data);
      toast({
        title: 'Успешно',
        description: 'Данные о продажах успешно получены',
        variant: 'default'
      });
      setShowDialog(false);
    } catch (err: any) {
      console.error('Ошибка при получении данных о продажах:', err);
      setError(err.message || 'Не удалось получить данные о продажах');
      toast({
        title: 'Ошибка',
        description: err.message || 'Не удалось получить данные о продажах',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setShowDialog(true);
  };

  const handleDialogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(dateFrom, dateTo);
  };

  return (
    <div>
      {children}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Получение данных о продажах</DialogTitle>
            <DialogDescription>
              Укажите период, за который нужно получить данные о продажах и стоимости хранения
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDialogSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dateFrom" className="text-right">С даты</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dateTo" className="text-right">По дату</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="col-span-3"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>Получить данные</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={loading}
        className="flex gap-2 items-center"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Загрузка данных...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            Получить данные о продажах
          </>
        )}
      </Button>
    </div>
  );
};

export default SalesDataProvider;
