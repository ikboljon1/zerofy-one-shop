
import React from 'react';
import { SupplyOptionsResponse, Warehouse } from '@/types/supplies';
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
  const getWarehouseName = (id: number): string => {
    const warehouse = warehouses.find(w => w.ID === id);
    return warehouse ? warehouse.name : `Склад #${id}`;
  };

  // Подсчет количества доступных складов для всех товаров
  const availableWarehousesCount = results.result.reduce((count, item) => {
    if (!item.isError && item.warehouses && item.warehouses.length > 0) {
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
          <Badge variant={hasErrors ? "destructive" : "success"}>
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
                <TableHead>Доступные склады</TableHead>
                <TableHead>Доступные типы упаковки</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.result.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.barcode}</TableCell>
                  <TableCell>
                    {item.isError ? (
                      <div className="flex items-center text-red-500">
                        <XCircle className="h-4 w-4 mr-1" />
                        <span>{item.error?.detail || "Ошибка"}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-green-500">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span>Доступен</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.warehouses ? (
                      <div className="flex flex-wrap gap-1">
                        {item.warehouses.map((wh, idx) => (
                          <Badge key={idx} variant="outline">
                            {getWarehouseName(wh.warehouseID)}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Нет доступных складов</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.warehouses ? (
                      <div className="space-y-1">
                        {item.warehouses.some(wh => wh.canBox) && (
                          <Badge variant="secondary" className="mr-1">Короба</Badge>
                        )}
                        {item.warehouses.some(wh => wh.canMonopallet) && (
                          <Badge variant="secondary" className="mr-1">Монопаллеты</Badge>
                        )}
                        {item.warehouses.some(wh => wh.canSupersafe) && (
                          <Badge variant="secondary">Суперсейф</Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
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
