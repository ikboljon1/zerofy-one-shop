
import React from 'react';
import { WarehouseCoefficient } from '@/services/suppliesApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WarehouseCoefficientsTableProps {
  coefficients: WarehouseCoefficient[];
}

const WarehouseCoefficientsTable: React.FC<WarehouseCoefficientsTableProps> = ({ coefficients }) => {
  // Format coefficient value for display
  const formatCoefficientValue = (coefficient: number): string => {
    if (coefficient === -1) return 'Недоступно';
    if (coefficient === 0) return 'Бесплатно';
    return `х${coefficient}`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[120px]">Склад</TableHead>
            <TableHead>Коэффициент</TableHead>
            <TableHead>Тип коробов</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coefficients.map((coef, index) => {
            // Get the first (and usually only) coefficient from the map
            const boxType = Object.keys(coef.coefficients)[0];
            const coefficient = coef.coefficients[boxType];
            
            return (
              <TableRow key={index}>
                <TableCell className="font-medium">{coef.warehouse_name}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      coefficient === -1 ? "destructive" : 
                      coefficient === 0 ? "secondary" : "default"
                    }
                  >
                    {formatCoefficientValue(coefficient)}
                  </Badge>
                </TableCell>
                <TableCell>{boxType}</TableCell>
              </TableRow>
            );
          })}
          
          {coefficients.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-4">
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
