
import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface AnalysisPeriodSelectorProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onApply: () => void;
  isLoading: boolean;
}

const AnalysisPeriodSelector: React.FC<AnalysisPeriodSelectorProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  isLoading
}) => {
  const getDefaultPeriods = () => {
    const today = new Date();
    
    // Последние 7 дней
    const last7Days = () => {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      onStartDateChange(date);
      onEndDateChange(today);
    };
    
    // Последние 30 дней
    const last30Days = () => {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      onStartDateChange(date);
      onEndDateChange(today);
    };
    
    // Последние 90 дней
    const last90Days = () => {
      const date = new Date();
      date.setDate(date.getDate() - 90);
      onStartDateChange(date);
      onEndDateChange(today);
    };
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        <Button variant="outline" size="sm" onClick={last7Days}>7 дней</Button>
        <Button variant="outline" size="sm" onClick={last30Days}>30 дней</Button>
        <Button variant="outline" size="sm" onClick={last90Days}>90 дней</Button>
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Период анализа данных</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Дата начала</Label>
              <DatePicker
                value={startDate}
                onValueChange={onStartDateChange}
                placeholder="Выберите дату начала"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Дата окончания</Label>
              <DatePicker
                value={endDate}
                onValueChange={onEndDateChange}
                placeholder="Выберите дату окончания"
              />
            </div>
          </div>
          
          {getDefaultPeriods()}
          
          <Button 
            className="w-full mt-4" 
            onClick={onApply}
            disabled={isLoading || !startDate || !endDate}
          >
            {isLoading ? 'Загрузка данных...' : 'Применить период и загрузить данные'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisPeriodSelector;
