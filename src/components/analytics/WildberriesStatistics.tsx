
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from '@/utils/formatCurrency';

interface WildberriesStatisticsProps {
  statistics: any;
}

export const WildberriesStatistics = ({ statistics }: WildberriesStatisticsProps) => {
  if (!statistics) return null;

  // Extract the necessary data from statistics
  const { 
    currentPeriod = {}, 
    previousPeriod = {},
    sales = [], 
    products = [] 
  } = statistics;

  // Calculate total values
  const totalOrders = currentPeriod.orderCount || 0;
  const totalIncome = currentPeriod.income || 0;
  const totalExpenses = currentPeriod.expenses || 0;
  const totalProfit = currentPeriod.profit || 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Всего заказов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Общий доход</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Общие расходы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Чистая прибыль</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalProfit)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Топ товары по продажам</CardTitle>
          <CardDescription>Товары с наибольшим количеством продаж за период</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Товар</TableHead>
                <TableHead>Артикул</TableHead>
                <TableHead>Продажи</TableHead>
                <TableHead>Доход</TableHead>
                <TableHead>Прибыль</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(products) && products.length > 0 ? (
                products.slice(0, 5).map((product, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{product.name || `Товар ${index + 1}`}</TableCell>
                    <TableCell>{product.sku || '-'}</TableCell>
                    <TableCell>{product.sales || 0}</TableCell>
                    <TableCell>{formatCurrency(product.income || 0)}</TableCell>
                    <TableCell>{formatCurrency(product.profit || 0)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Нет данных о товарах</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
