
import React, { useState } from 'react';
import { WarehouseCoefficient } from '@/types/supplies';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  CheckCircle, 
  XCircle, 
  SortAsc, 
  SortDesc, 
  ArrowUpDown, 
  Info,
  WarehouseIcon,
  BadgePercent
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SortKey = 'warehouseName' | 'date' | 'coefficient' | 'boxTypeName';
type SortOrder = 'asc' | 'desc';

interface WarehouseCoefficientsTableProps {
  coefficients: WarehouseCoefficient[];
}

const WarehouseCoefficientsTable: React.FC<WarehouseCoefficientsTableProps> = ({ coefficients }) => {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  const formatCoefficientValue = (coefficient: number): string => {
    if (coefficient === -1) return 'Недоступно';
    if (coefficient === 0) return 'Бесплатно';
    return `х${coefficient}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: ru });
    } catch (e) {
      return dateString;
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedCoefficients = [...coefficients].sort((a, b) => {
    let comparison = 0;

    switch (sortKey) {
      case 'warehouseName':
        comparison = a.warehouseName.localeCompare(b.warehouseName);
        break;
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'coefficient':
        comparison = a.coefficient - b.coefficient;
        break;
      case 'boxTypeName':
        comparison = a.boxTypeName.localeCompare(b.boxTypeName);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Filter to show only available options first (coefficient = 0 or 1 AND allowUnload = true)
  const availableCoefficients = sortedCoefficients.filter(
    coef => (coef.coefficient === 0 || coef.coefficient === 1) && coef.allowUnload
  );
  
  const unavailableCoefficients = sortedCoefficients.filter(
    coef => !((coef.coefficient === 0 || coef.coefficient === 1) && coef.allowUnload)
  );

  // Reorganized data to show available options first
  const organizedCoefficients = [...availableCoefficients, ...unavailableCoefficients];

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="p-4 bg-muted/50 border-b">
        <div className="flex items-center space-x-2">
          <BadgePercent className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Коэффициенты приемки на складах WB</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Приёмка для поставки доступна только при сочетании: коэффициент = 0 или 1 и статус приёмки = доступно
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="min-w-[180px] cursor-pointer"
                onClick={() => handleSort('warehouseName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Склад</span>
                  {renderSortIcon('warehouseName')}
                </div>
              </TableHead>
              <TableHead>Тип</TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center space-x-1">
                  <span>Дата</span>
                  {renderSortIcon('date')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('coefficient')}
              >
                <div className="flex items-center space-x-1">
                  <span>Коэффициент</span>
                  {renderSortIcon('coefficient')}
                </div>
              </TableHead>
              <TableHead>Приёмка</TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('boxTypeName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Тип упаковки</span>
                  {renderSortIcon('boxTypeName')}
                </div>
              </TableHead>
              <TableHead>Хранение (₽)</TableHead>
              <TableHead>Логистика (₽)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizedCoefficients.map((coef, index) => {
              const isAvailable = (coef.coefficient === 0 || coef.coefficient === 1) && coef.allowUnload;
              
              return (
                <TableRow 
                  key={index}
                  className={isAvailable ? "bg-green-50" : undefined}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <WarehouseIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      {coef.warehouseName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={coef.isSortingCenter ? "secondary" : "outline"}>
                      {coef.isSortingCenter ? 'СЦ' : 'Склад'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(coef.date)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        coef.coefficient === -1 ? "destructive" : 
                        coef.coefficient === 0 ? "success" : 
                        coef.coefficient === 1 ? "secondary" : "default"
                      }
                    >
                      {formatCoefficientValue(coef.coefficient)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center cursor-help">
                            {coef.allowUnload ? 
                              <CheckCircle className="h-5 w-5 text-green-500" /> : 
                              <XCircle className="h-5 w-5 text-red-500" />
                            }
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Приёмка {coef.allowUnload ? 'доступна' : 'недоступна'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>{coef.boxTypeName}</TableCell>
                  <TableCell>
                    {coef.storageBaseLiter && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-sm cursor-help flex items-center">
                              <span>От {coef.storageBaseLiter} руб.</span>
                              <Info className="h-3 w-3 ml-1 text-muted-foreground" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <div className="space-y-1">
                              <p className="font-medium">Стоимость хранения:</p>
                              <p>Базовая: {coef.storageBaseLiter} руб.</p>
                              {coef.storageAdditionalLiter && (
                                <p>Доп. литр: {coef.storageAdditionalLiter} руб.</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>
                  <TableCell>
                    {coef.deliveryBaseLiter && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-sm cursor-help flex items-center">
                              <span>От {coef.deliveryBaseLiter} руб.</span>
                              <Info className="h-3 w-3 ml-1 text-muted-foreground" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <div className="space-y-1">
                              <p className="font-medium">Стоимость логистики:</p>
                              <p>Базовая: {coef.deliveryBaseLiter} руб.</p>
                              {coef.deliveryAdditionalLiter && (
                                <p>Доп. литр: {coef.deliveryAdditionalLiter} руб.</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            
            {organizedCoefficients.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Нет данных о коэффициентах приёмки
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default WarehouseCoefficientsTable;
