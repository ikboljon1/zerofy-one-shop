
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RefreshCw, Download } from 'lucide-react';
import { format } from 'date-fns';

interface AnalysisPeriodSelectorProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
  onLoadData: () => Promise<void>;
  isLoading: boolean;
}

const AnalysisPeriodSelector: React.FC<AnalysisPeriodSelectorProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  apiKey,
  onApiKeyChange,
  onLoadData,
  isLoading
}) => {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API ключ Wildberries</Label>
            <Input
              id="api-key"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="Введите API ключ"
              type="password"
              className="text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start-date">Дата начала</Label>
            <DatePicker
              value={startDate}
              onValueChange={onStartDateChange}
              placeholder="Выберите дату начала"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">Дата окончания</Label>
            <DatePicker
              value={endDate}
              onValueChange={onEndDateChange}
              placeholder="Выберите дату окончания"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button 
            onClick={onLoadData} 
            disabled={isLoading || !startDate || !endDate || !apiKey}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Загрузка данных...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Получить данные о продажах
              </>
            )}
          </Button>
        </div>
        {startDate && endDate && (
          <div className="text-xs text-muted-foreground">
            Период анализа: {format(startDate, 'dd.MM.yyyy')} - {format(endDate, 'dd.MM.yyyy')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisPeriodSelector;
