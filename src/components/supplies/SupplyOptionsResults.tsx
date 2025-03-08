
import React from 'react';
import { SupplyOptionsResponse, Warehouse } from '@/services/suppliesApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface SupplyOptionsResultsProps {
  results: SupplyOptionsResponse;
  warehouses: Warehouse[];
}

const SupplyOptionsResults: React.FC<SupplyOptionsResultsProps> = ({ results, warehouses }) => {
  // Найти название склада по ID
  const getWarehouseName = (id: string): string => {
    const warehouse = warehouses.find(w => w.ID === id);
    return warehouse ? warehouse.name : `Склад #${id}`;
  };

  // Подсчет количества доступных складов для всех товаров
  const availableWarehousesCount = results.result.reduce((count, item) => {
    if (!item.isError) {
      count++;
    }
    return count;
  }, 0);

  // Проверка наличия ошибок
  const hasErrors = results.result.some(item => item.isError);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Результаты проверки доступности ({results.result.length} товаров)</span>
          <Badge variant={hasErrors ? "destructive" : "secondary"}>
            {hasErrors ? "Есть ошибки" : "Все товары доступны"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasErrors && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Внимание</AlertTitle>
            <AlertDescription>
              Обнаружены ошибки в некоторых товарах. Проверьте баркоды и количество.
            </AlertDescription>
          </Alert>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Баркод</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Комментарий</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.result.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.article}</TableCell>
                  <TableCell>
                    {item.isError ? (
                      <div className="flex items-center text-red-500">
                        <XCircle className="h-4 w-4 mr-1" />
                        <span>Ошибка</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-green-500">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span>Доступен</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.errorText || (
                      <span className="text-muted-foreground">Можно отправить на {getWarehouseName(results.warehouse.id)}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplyOptionsResults;
