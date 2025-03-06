
import React from 'react';
import { WarehouseCoefficient } from '@/types/supplies';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface WarehouseCoefficientsTableProps {
  coefficients: WarehouseCoefficient[];
}

const WarehouseCoefficientsTable: React.FC<WarehouseCoefficientsTableProps> = ({ coefficients }) => {
  const formatCoefficientValue = (coefficient: number): string => {
    if (coefficient === -1) return 'Недоступно';
    if (coefficient === 0) return 'Бесплатно';
    return `х${coefficient}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[120px]">Склад</TableHead>
            <TableHead>Тип</TableHead>
            <TableHead>Дата</TableHead>
            <TableHead>Коэффициент</TableHead>
            <TableHead>Приёмка</TableHead>
            <TableHead>Тип упаковки</TableHead>
            <TableHead>Хранение (₽)</TableHead>
            <TableHead>Логистика (₽)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coefficients.map((coef, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{coef.warehouseName}</TableCell>
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
                    coef.coefficient === 0 ? "secondary" : "default"
                  }
                >
                  {formatCoefficientValue(coef.coefficient)}
                </Badge>
              </TableCell>
              <TableCell>
                {coef.allowUnload ? 
                  <CheckCircle className="h-5 w-5 text-green-500" /> : 
                  <XCircle className="h-5 w-5 text-red-500" />
                }
              </TableCell>
              <TableCell>{coef.boxTypeName}</TableCell>
              <TableCell>
                {coef.storageBaseLiter && (
                  <div className="text-sm">
                    <div>Базовая: {coef.storageBaseLiter}</div>
                    {coef.storageAdditionalLiter && (
                      <div>Доп. литр: {coef.storageAdditionalLiter}</div>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {coef.deliveryBaseLiter && (
                  <div className="text-sm">
                    <div>Базовая: {coef.deliveryBaseLiter}</div>
                    {coef.deliveryAdditionalLiter && (
                      <div>Доп. литр: {coef.deliveryAdditionalLiter}</div>
                    )}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
          
          {coefficients.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                Нет данных о коэффициентах приёмки
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default WarehouseCoefficientsTable;
